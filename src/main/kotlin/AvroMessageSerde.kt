package main

import org.apache.avro.message.BinaryMessageDecoder
import org.apache.avro.message.BinaryMessageEncoder
import org.apache.kafka.common.errors.SerializationException
import org.apache.kafka.common.serialization.Deserializer
import org.apache.kafka.common.serialization.Serde
import org.apache.kafka.common.serialization.Serializer

class AvroMessageSerde<T>(
    private val encoder: BinaryMessageEncoder<T>,
    private val decoder: BinaryMessageDecoder<T>
): Serde<T> {
    override fun serializer(): Serializer<T> {
        return Serializer<T> { _, data -> encoder.encode(data).array() }
    }
    override fun deserializer(): Deserializer<T> {
        return Deserializer<T> { _, data: ByteArray ->
            try {
                decoder.decode(data);
            } catch (e: Exception) {
                throw SerializationException("Error deserializing avro message", e)
            }
        }
    }
}