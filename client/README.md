# CORE Client Application


## Convert .dxf to topojson
`ogr2ogr -f GeoJSON ./df_building.geojson df_building.dxf`
`geo2topo df_building.geojson > df_building.json`

```
CREATE OR REPLACE VIEW customer_order_counts AS
select customer,sum(1) from shipping group by customer;
CREATE OR REPLACE VIEW part_order_counts AS
select part,sum(1),sum(qty_order) as total_units from shipping group by part;
```
