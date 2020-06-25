package main

data class ConnectSchema(
        val type: String,
        val fields: List<ConnectSchemaField>,
        val optional: Boolean,
        val name: String
)