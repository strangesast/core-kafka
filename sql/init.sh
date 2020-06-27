#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE DATABASE development;
  GRANT ALL PRIVILEGES ON DATABASE development TO postgres;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "development" <<-EOSQL
  CREATE EXTENSION pgcrypto;
  
  CREATE TABLE roles (
    id          text primary key,
    name        text NOT NULL,
    description text
  );

  CREATE TABLE users (
    id            integer generated always as identity primary key,
    username      text NOT NULL UNIQUE,
    email         text,
    color         text,
    password      text NOT NULL,
    last_modified timestamp DEFAULT CURRENT_TIMESTAMP,
    employee_id   integer UNIQUE,
    active        boolean
  );

  CREATE TABLE employees (
    id                integer primary key,
    code              text,
    first_name        text,
    last_name         text,
    middle_name       text,
    hire_date         date,
    user_id           integer,
    color             text,
    compensation_type text,
    last_modified     timestamp DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE user_roles (
    user_id integer NOT NULL,
    role_id text NOT NULL,
  	PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (role_id) REFERENCES roles (id),
  	FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE shipping (
    id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ship_date     date,
    part          text,
    qty_order     integer,
    order_id      text,
    customer      text,
    part_customer text,
    description   text,
    po            text,
    qty_ship      integer,
    rem           integer,
    price         real,
    vend          text,
    meta          json
  );

  CREATE TABLE timeclock_polls (
    id   integer PRIMARY KEY,
    date timestamp
  );

  CREATE TABLE timeclock_sync (
    id            integer generated always as identity primary key,
    start_date    timestamp,
    complete_date timestamp,
    job_status    text,
    is_manual     boolean,
    user_id       integer,
    update_count  integer,
    note          text,
  	FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE timeclock_shifts (
    id            integer generated always as identity unique,
    employee_id   integer,
    date          date,
    date_start    timestamp,
    date_stop     timestamp,
    duration      integer GENERATED ALWAYS AS (extract(epoch from (date_stop - date_start)) * 1000) STORED,
    punch_start   integer,
    punch_stop    integer,
    is_manual     boolean,
    last_modified timestamp DEFAULT CURRENT_TIMESTAMP,
    sync_id       integer,
  	PRIMARY KEY (employee_id, date_start),
    FOREIGN KEY (employee_id) REFERENCES employees (id),
  	FOREIGN KEY (sync_id) REFERENCES timeclock_sync (id)
  );

  create materialized view timeclock_shifts_view as select
  	id,
  	employee_id,
  	date_start,
  	date_stop,
  	shift_num
  from (
  	select *,
  		sum(case when nearby = true then 0 else 1 end) over (partition by employee_id order by num) as shift_num
  	from (
  		select *,
  			row_number() over (partition by employee_id order by date_start asc) num,
  			case when prev_stop is NULL then false else ((date_start - prev_stop) < interval '6 hour') end as nearby
  		from (
  			select *,
  				lag(date_stop, 1) over (partition by employee_id order by date_start asc) prev_stop
  			from timeclock_shifts
  		) t
  	) t
  ) t order by date_start desc;

  create materialized view timeclock_shift_groups as SELECT
  	t.shift_num,
  	t.employee_id,
  	timezone('America/New_York'::text, t.dates_start[1]::timestamp with time zone)::date AS date,
  	t.dates_start[1] AS date_start,
  	t.dates_stop[array_upper(t.dates_stop, 1)] AS date_stop
  FROM (
  	SELECT
  		employee_id,
  		shift_num,
  		array_agg(date_start order by date_start asc) AS dates_start,
  		array_agg(date_stop order by date_stop asc) AS dates_stop
  	FROM timeclock_shifts_view
  	GROUP BY employee_id, shift_num
  ) t
  ORDER BY (t.dates_start[1]) DESC;

  create view timeclock_shifts_daily as select t.employee_id,
    t.date,
    array_agg(t.id) as shifts,
    min(t.date_start) as date_start,
    max(t.date_stop) as date_stop,
    sum(t.duration) as duration
  from (
    select t_1.id,
      t_1.employee_id,
      t_1.date,
      t_1.date_start,
      t_1.date_stop,
      extract('epoch' from (t_1.date_stop - t_1.date_start::timestamp with time zone)) * 1000 as duration
    from (
      select timeclock_shifts.id,
        timeclock_shifts.employee_id,
        timeclock_shifts.date,
        timeclock_shifts.date_start,
        case
            when timeclock_shifts.date_stop is null then now()
            else timeclock_shifts.date_stop::timestamp with time zone
        end as date_stop
      from timeclock_shifts
    ) t_1
  ) t
  group by t.employee_id, t.date;

  create table machines (
    id           text primary key,
    name         text,
    type         text,
    manufacturer text,
    capabilities text[],
    description  text
  );

  insert into machines (id,name,type,manufacturer) values ('doosan-2600sy', 'Doosan 2600SY', 'lathe', 'doosan');
  insert into machines (id,name,type,manufacturer) values ('doosan-gt2100m', 'Doosan GT2100M', 'lathe', 'doosan');
  insert into machines (id,name,type,manufacturer) values ('hardinge-gx1600', 'Hardinge GX1600', 'mill', 'hardinge');
  insert into machines (id,name,type,manufacturer) values ('samsung-sl45', 'Samsung SL45', 'lathe', 'samsung');
  insert into machines (id,name,type,manufacturer) values ('samsung-mcv50', 'Samsung MCV50', 'mill', 'samsung');

  create table machine_state (
    value      text,
    property   text,
    timestamp  bigint,
    machine_id text,
    "offset"   bigint,
    PRIMARY KEY (machine_id,property,"offset")
  );

  create view machine_state_view as select
    machine_id,
    property,
    value,
    to_timestamp("timestamp"/1000) as timestamp,
    "offset"
  from machine_state;

  create view machine_execution_state as select
  	machine_id,
  	value,
  	timestamp,
  	lead(timestamp, 1) over (partition by machine_id order by "timestamp", "offset") as next_timestamp,
    "offset"
  from (
  	select
  		machine_id,
  		property,
  		value,
  		to_timestamp(timestamp/1000) as timestamp,
      "offset"
  	from machine_state
  ) t
  where property = 'execution';

  select
    machine_id,
    property,
    value,
    "timestamp",
    "offset",
    r
  from (
    select
      machine_id,
      property,
      value::integer as value,
      "timestamp",
      "offset",
      dense_rank() over (partition by machine_id order by "timestamp") as r
    from machine_state_view
    where property = 'part_count'::text and value <> 'unavailable'::text) t
  order by "timestamp" desc; 

  CREATE TABLE machine_values (
    "machine_id" text not null,
    "property"   text not null,
    "timestamp"  bigint not null,
    "value"      text not null,
    "offset"     bigint not null
  );

  CREATE UNIQUE INDEX timeclock_shift_groups_pk
    ON timeclock_shift_groups (employee_id, shift_num);

  CREATE TABLE schedule (
    col                    integer PRIMARY KEY,
    part                   text,
    customer               text,
    date                   date,
    qty                    integer,
    qty_note               text,
    sos                    text[],
    description            text,

    readystate             text,
    hardware_kit           json,
    seal_kit               json,

    body_assy              json,
    body_assy_body         json,
    body_assy_collar       json,
    body_assy_end_cap      json,
    body_assy_base_mount   json,
    rod_assy               json,
    rod_assy_rod           json,
    rod_assy_rod_mount     json,
    gland                  json,
    piston                 json,
    stroke_limiter         json,
    misc_1                 json,
    misc_2                 json,
    misc_3                 json
  );

  create table notifications (
    id                integer generated always as identity primary key,
    deleted           boolean,
    deleted_on        timestamp,  
    title             text,
    description       text,
    concerning_shifts integer[]
  );

  create table user_notifications (
    user_id         integer NOT NULL,
    notification_id integer NOT NULL,
    read            boolean,
    read_on         timestamp,
  	PRIMARY KEY (user_id, notification_id),
  	FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (notification_id) REFERENCES notifications (id)
  );

  DO \$\$DECLARE lastid integer;
  BEGIN
    INSERT INTO roles(id, name, description) values('isAdmin', 'Administrator', 'Self explanatory.');
    INSERT INTO roles(id, name, description) values('isCameraViewer', 'Camera Viewer', 'Can view cameras.');
    INSERT INTO roles(id, name, description) values('isPaidHourly', 'Paid Hourly', 'Uses timeclock.');

    INSERT INTO users(username, email, password, color) values('admin', 'admin@direktforce.com', crypt('password', gen_salt('bf')), '#1f78b4') RETURNING id into lastid;

    INSERT INTO user_roles(user_id, role_id) values(lastid, 'isAdmin');
    INSERT INTO user_roles(user_id, role_id) values(lastid, 'isCameraViewer');
  END\$\$;
EOSQL
