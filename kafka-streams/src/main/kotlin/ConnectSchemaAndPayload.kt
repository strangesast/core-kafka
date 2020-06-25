package main

data class ConnectSchemaAndPayload(
        val schema: ConnectSchema,
        val payload: Any
)