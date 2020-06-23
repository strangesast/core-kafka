# Aggregations

## Recent Activity
```
select
	*,
	(case when next_timestamp is null then now() else next_timestamp end) - timestamp as diff
from (
	select
		*,
		lead(timestamp, 1) over (partition by machine_id order by timestamp asc) as next_timestamp,
		dense_rank() over (partition by machine_id order by timestamp asc) as r
	from (
		select machine_id, property, value, timestamp::timestamp from machine_state
	) t
	where property = 'execution'
) t
where value = 'ACTIVE'
order by timestamp desc
```
