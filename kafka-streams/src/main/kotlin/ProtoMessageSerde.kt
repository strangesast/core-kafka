package main

import com.google.protobuf.InvalidProtocolBufferException
import com.google.protobuf.Message
import com.google.protobuf.Parser
import org.apache.kafka.common.errors.SerializationException
import org.apache.kafka.common.serialization.Deserializer
import org.apache.kafka.common.serialization.Serde
import org.apache.kafka.common.serialization.Serializer

class ProtoMessageSerde<T : Message>(private val parser: Parser<T>) : Serde<T> {

    override fun serializer(): Serializer<T> {
        return Serializer<T> { _, data -> data.toByteArray() }
    }

    override fun deserializer(): Deserializer<T> {
        return Deserializer<T> { _, data: ByteArray ->
            try {
                parser.parseFrom(data)
            } catch (e: InvalidProtocolBufferException) {
                throw SerializationException("Error deserializing from Protobuf message", e)
            }
        }
    }
}