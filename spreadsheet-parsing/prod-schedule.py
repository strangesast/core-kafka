from typing import Tuple, Union
import json
from datetime import datetime
from pathlib import Path
from enum import Enum
import psycopg2
from psycopg2.extras import execute_values
import xlrd
import re

from pprint import pprint


KEY_ROWS = {
   3 : 'body_assy',
   4 : 'body_assy_body',
   5 : 'body_assy_end_cap',
   6 : 'body_assy_base_mount',
   7 : 'body_assy_collar',
   8 : '',
   9 : 'rod_assy',
  10 : 'rod_assy_rod',
  11 : 'rod_assy_rod_mount',
  12 : '',
  13 : '',
  14 : 'gland',
  15 : 'piston',
  16 : 'stroke_limiter',
  17 : '',
  18 : 'misc_1',
  19 : 'misc_2',
  20 : 'misc_3',
  21 : 'hardware_kit',
  22 : 'seal_kit',
}

CompletedState = {
    '/': 'NEED_MATERIAL',
    'X': 'READY',
    'Ä': 'COMPLETE',
}


def parse_prod_schedule(filepath: Path):
    wb = xlrd.open_workbook(filepath)
    sheet = next((s for i in range(wb.nsheets) if (s := wb.sheet_by_index(i)).name == 'Production Schedule'), None);

    if sheet is None:
        raise Exception('missing target sheet!')

    for j in range(2, sheet.ncols):
        col = sheet.col_values(j)

        customer, description, part, sos = parse_sheet_name(col[0])

        date, readystate = parse_sheet_date(col[1], (1, j), sheet)

        qty, qty_note = parse_sheet_qty(col[2], (2, j), sheet)

        blah = {}
        for i, key in KEY_ROWS.items():
            note = col[i].strip()
            if key == '':
                continue
            value = None
            for prefix in CompletedState:
                if note.startswith(prefix):
                    value = CompletedState[prefix]
                    note = note[1:].strip()
            blah[key] = {'note': note, 'value': value}

        record = {
            **blah,
            'col': j,
            'qty': qty,
            'qty_note': qty_note,
            'date': date,
            'readystate': readystate,
            'customer': customer,
            'description': description,
            'part': part,
            'sos': sos,
        }

        yield record


# break text into part & sos
step_one = re.compile('^(?P<part>A[\w-]+)\s{3,}(?P<sos>[\w\-\(\)&, ]+)$')
# parse sos
step_two = re.compile('(?P<so>S?[0-9]+(\s\(\w+\))?)')

# parse date row
step_three = re.compile('^(?P<state>\w+)\s(?P<date>[0-9\/]+)$')

# parse qty text
step_four = re.compile('^(?P<note>[\s\w\+\(\)]+)\n(?P<qty>[0-9]+)$')


def parse_sheet_name(text):
    customer, description, l2 = text.split('\n')

    m = step_one.match(l2)
    part, sos = m.group('part'), m.group('sos')
    sos = [m[0] for m in step_two.findall(sos)]

    # if len is small, start with the nearest previous number
    sos = tuple(m if len(m) > 3 else next(n for n in sos[i-1::-1] if len(n) > 3)[0:-len(m)] + m
            for i, m in enumerate(sos))

    return customer, description, part, sos


def parse_sheet_date(text: str, cell_pos: Tuple[int, int], sheet: xlrd.sheet.Sheet):
    _type = sheet.cell_type(*cell_pos)
    if _type == 1:
        m = step_three.match(text)
        readystate = m.group('state')
        dt = datetime.strptime(m.group('date'), '%m/%d/%y')
    elif _type == 3:
        readystate = None
        tup = xlrd.xldate_as_tuple(text, sheet.book.datemode)
        dt = datetime(*tup[:3])
    else:
        raise Exception('unexpected date cell type')

    return dt, readystate


def parse_sheet_qty(text: Union[str,float], cell_pos: Tuple[int, int], sheet: xlrd.sheet.Sheet):
    _type = sheet.cell_type(*cell_pos)
    if _type == 1 and (m := step_four.match(text)):
        qty_note, qty = m.group('note'), m.group('qty')
        qty = int(qty)
    elif _type == 2 and text.is_integer():
        qty = int(text)
        qty_note = None
    else:
        raise Exception('unexpected qty type')

    return qty, qty_note


def write_prod_schedule(conn):
    cur = conn.cursor()

    root_dir = Path.home().joinpath('f')
    filepath = root_dir / 'SCHEDULES' / 'PRODUCTION SCHEDULE.xls'
    if not filepath.is_file():
        raise Exception('missing target file!')
    data = parse_prod_schedule(filepath)

    keys = ['body_assy_collar', 'hardware_kit', 'misc_2', 'seal_kit', 'gland',
            'misc_3', 'body_assy_end_cap', 'misc_1', 'date', 'part',
            'rod_assy_rod_mount', 'body_assy', 'piston', 'col',
            'readystate', 'sos', 'description', 'body_assy_base_mount',
            'body_assy_body', 'stroke_limiter', 'qty_note', 'customer',
            'rod_assy', 'rod_assy_rod', 'qty']

    def h(value):
        if isinstance(value, dict):
            return json.dumps(value)
        elif isinstance(value, tuple):
            return list(value)
        else:
            return value

    execute_values(cur, f'INSERT INTO schedule ({", ".join(keys)}) VALUES %s', [[h(datum[k]) for k in keys] for datum in data])
    conn.commit()


def main():
    conn = psycopg2.connect(
            host="localhost",
            port="5432",
            dbname="development",
            user="postgres",
            password="password")

    write_prod_schedule(conn)


if __name__ == '__main__':
    main()
