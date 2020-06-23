package main

import com.google.gson.Gson
import com.google.protobuf.Timestamp
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.common.serialization.Serdes
import org.apache.kafka.streams.KafkaStreams
import org.apache.kafka.streams.KeyValue
import org.apache.kafka.streams.StreamsBuilder
import org.apache.kafka.streams.StreamsConfig
import org.apache.kafka.streams.kstream.*
import org.slf4j.LoggerFactory
import proto.SerialMonitoring
import java.time.Instant
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.*
import java.util.concurrent.CountDownLatch
import kotlin.system.exitProcess

fun main() {

    val logger = LoggerFactory.getLogger("streams-logger")

    val props = Properties()
    props[StreamsConfig.APPLICATION_ID_CONFIG] = "streams-streams-monitoring"
    props[StreamsConfig.BOOTSTRAP_SERVERS_CONFIG] = "localhost:9092"
    props[StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG] = Serdes.ByteArray().javaClass
    props[StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG] = Serdes.ByteArray().javaClass
    props[ConsumerConfig.AUTO_OFFSET_RESET_CONFIG] = "earliest"
    props[StreamsConfig.CACHE_MAX_BYTES_BUFFERING_CONFIG] = 0

    val gson = Gson()
    val builder = StreamsBuilder()

    val input = builder.stream("input-text", Consumed.with(Serdes.String(), Serdes.String()))

    val sparse = input
        .flatMapValues { value ->
            val l = value.split(Regex("(?<!\\\\)[|]")).toMutableList()
            val ts = OffsetDateTime.parse(l.removeAt(0)).toInstant()
            val pairs = if (l[0] == "message") listOf(Pair(l[0], l[2])) else l.chunked(2)
                    .map { Pair(it[0], it[1]) }
                    .filter { it.first != "" }
            pairs.map { Pair(ts, it) }
        }

    val sampleKeySerde = ProtoMessageSerde(SerialMonitoring.SampleKey.parser())
    val sampleValueSerde = ProtoMessageSerde(SerialMonitoring.SampleValue.parser())

    // val paired = sparse.map { key, value -> KeyValue(
    //         SerialMonitoring.SampleKey.newBuilder().setMachineID(key).setProperty(value.second.first).build(),
    //         SerialMonitoring.SampleValue.newBuilder().setTimestamp(value.first.toProtoTimestamp()).setValue(value.second.second).build())
    //     }
    sparse.map { key, value ->
            KeyValue("${key}.${value.second.first}",
                gson.toJson(ConnectSchemaAndPayload(
                    ConnectSchema(
                        "struct",
                        listOf(
                                ConnectSchemaField(
                                        "string",
                                        false,
                                        "machine_id"
                                ),
                                ConnectSchemaField(
                                        "string",
                                        false,
                                        "property"
                                ),
                                ConnectSchemaField(
                                        "int64",
                                        false,
                                        "timestamp"
                                ),
                                ConnectSchemaField(
                                        "string",
                                        false,
                                        "value"
                                )
                        ),
                        false,
                        "key-value"
                    ),
                    mapOf<String, Any>(
                        "machine_id" to key,
                        "property" to value.second.first,
                        "timestamp" to value.first.toEpochMilli(),
                        "value" to value.second.second
                    )
                ))
            )
        }
        .to("machine_state_execution", Produced.with(Serdes.String(), Serdes.String()))



    sparse.foreach { key, value ->
            logger.info("key: $key, value: $value")
        }

    val topology = builder.build()
    val streams = KafkaStreams(topology, props)
    val latch = CountDownLatch(1)

    Runtime.getRuntime().addShutdownHook(object : Thread() {
        override fun run() {
            streams.close()
            latch.countDown()
        }
    })

    try {
        streams.start()
        latch.await()
    } catch (e: Throwable) {
        streams.cleanUp()
        exitProcess(1)
    }
    exitProcess(0)
}

fun Timestamp.toInstant(): Instant = Instant.ofEpochSecond(seconds, nanos.toLong())
fun Instant.toProtoTimestamp(): Timestamp = Timestamp.newBuilder().setSeconds(epochSecond).setNanos(nano).build()
fun Timestamp.toISOString(): String = ZonedDateTime.ofInstant(Instant.ofEpochSecond(seconds, nanos.toLong()), ZoneId.of("UTC")).toOffsetDateTime().toString()
