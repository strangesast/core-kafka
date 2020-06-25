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
import org.apache.kafka.streams.processor.ProcessorContext
import org.slf4j.LoggerFactory
import proto.SerialMonitoring
import java.time.Instant
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.*
import java.util.concurrent.CountDownLatch
// import java.util.regex.Pattern
import kotlin.system.exitProcess


fun main() {

    val logger = LoggerFactory.getLogger("streams")

    val props = Properties()
    props[StreamsConfig.APPLICATION_ID_CONFIG] = System.getenv("STREAMS_APPLICATION_ID") ?: "streams-monitoring"
    props[StreamsConfig.BOOTSTRAP_SERVERS_CONFIG] = System.getenv("KAFKA_HOSTS") ?: "kafka:9092"
    props[StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG] = Serdes.ByteArray().javaClass
    props[StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG] = Serdes.ByteArray().javaClass

    props[ConsumerConfig.AUTO_OFFSET_RESET_CONFIG] = "earliest"
    props[StreamsConfig.CACHE_MAX_BYTES_BUFFERING_CONFIG] = 0

    val builder = StreamsBuilder()

    logger.info("starting...")

    val rawInput = builder
            .stream("input-text", Consumed.with(Serdes.String(), Serdes.String()))

    buildStreamsTopology(rawInput)

    val topology = builder.build()
    logger.info(topology.describe().toString())
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
        exitProcess(1)
    }
    exitProcess(0)
}

fun buildStreamsTopology(raw: KStream<String, String>) {
    val input = raw.flatTransform(TransformerSupplier { SampleTransformer() })

    val splitSamples = input.mapValues { bytes -> SerialMonitoring.SplitSample.parseFrom(bytes) }

    val (tabledStream, streamed) = splitSamples.branch(
            Predicate { _, sample -> sample.key in setOf("execution", "part_count", "avail", "estop", "mode", "active_axis", "tool_id", "program", "program_comment",
                    "line", "block" /* ehhhh */, "Fovr", "message", "servo", "comms", "logic", "motion", "system", "Xtravel",
                    "Xoverheat", "Xservo", "Ztravel", "Zoverheat", "Zservo", "Ctravel", "Coverheat", "Cservo", "S1servo", "S2servo") },
            Predicate { _, sample -> sample.key in setOf("Xload", "Zload", "Cload", "S1load", "S2load", "Zact", "Xact", "Cact", "S2speed", "S1speed", "path_position", "path_feedrate") }
    )

    val sampleValueSerde = ProtoMessageSerde(SerialMonitoring.SampleValue.parser())

    val tabled = tabledStream
        .map { key, value ->
            KeyValue(
                    SerialMonitoring.SampleKey.newBuilder().setMachineID(key).setProperty(value.key).build(),
                    SerialMonitoring.SampleValue.newBuilder().setValue(value.value).setOffset(value.offset).setTimestamp(value.timestamp).build()
            )
        }
        .toTable(Materialized.with(ProtoMessageSerde(SerialMonitoring.SampleKey.parser()), sampleValueSerde))

    val (executionState, partCountState, programCommentState) = tabled.toStream().branch(
            Predicate { key, _ -> key.property == "execution" },
            Predicate { key, _ -> key.property == "part_count" },
            Predicate { key, _ -> key.property == "program_comment"}
    )

    val gson = Gson()

    // program comment regex
    // val pat0 = Pattern.compile("^(%\\s{0,2})?(?<num>O[0-9]{3,6})\\s*(?<notes>(\\([\\s\\w\\- \\.\\/]+\\)\\s{0,3})+)")
    // val pat1 = Pattern.compile("\\([\\s\\w\\-\\.\\/]+\\)")

    tabled.toStream().map { k, v ->
        KeyValue(
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
                            "offset"
                        )
                    ),
                    false,
                    "machine_state_key"
                ),
                mapOf("machine_id" to k.machineID, "property" to k.property, "offset" to v.offset)
            )),
            gson.toJson(ConnectSchemaAndPayload(
                ConnectSchema(
                    "struct",
                    listOf(
                        ConnectSchemaField(
                            "string",
                            true,
                            "value"
                        ),
                        ConnectSchemaField(
                            "int64",
                            true,
                            "timestamp"
                        )
                    ),
                    false,
                    "machine_state_value"
                ),
                mapOf("value" to v.value, "timestamp" to v.timestamp.toInstant().toEpochMilli())
            ))
        )
    }.to("machine_state", Produced.with(Serdes.String(), Serdes.String()))

    streamed.map { machineId, record ->
        KeyValue("$machineId-${record.key}", gson.toJson(ConnectSchemaAndPayload(
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
                                ),
                                ConnectSchemaField(
                                        "int64",
                                        false,
                                        "offset"
                                )
                        ),
                        false,
                        "machine_values_value"
                ),
                mapOf(
                        "machine_id" to machineId,
                        "property" to record.key,
                        "timestamp" to record.timestamp.toInstant().toEpochMilli(),
                        "value" to record.value,
                        "offset" to record.offset
                )
        )))
    }.to("machine_values", Produced.with(Serdes.String(), Serdes.String()))
}

// convert List<String> to List<[String, String]> to List<SplitSample>
class SampleTransformer : Transformer<String, String, Iterable<KeyValue<String, ByteArray>>> {
    private lateinit var context: ProcessorContext

    override fun init(context: ProcessorContext) {
        this.context = context
    }

    override fun transform(
            key: String?,
            value: String
    ): Iterable<KeyValue<String, ByteArray>> {
        // val value = SerialMonitoring.Sample.parseFrom(bytes)
        val offset = context.offset()
        val values = value.split(Regex("(?<!\\\\)[|]")).toMutableList()
        val ts = OffsetDateTime.parse(values.removeAt(0)).toInstant()
        val stringValues =
                if (values[0] == "message") listOf(listOf(values[0], values[2])) else values.chunked(2)
        val eachKey = key ?: "unknown"
        return stringValues
                .filter { it[0] != "" }
                .map {
                    val eachValue = SerialMonitoring.SplitSample.newBuilder()
                            .setTimestamp(ts.toProtoTimestamp())
                            .setOffset(offset)
                            .setKey(it[0])
                            .setValue(it[1])
                            .build().toByteArray()
                    KeyValue(eachKey, eachValue)
                }
    }

    override fun close() {
    }
}

fun stringifyTimestamp(timestamp: Timestamp): String {
    return ZonedDateTime.ofInstant(
            Instant.ofEpochSecond(timestamp.seconds, timestamp.nanos.toLong()),
            ZoneId.of("UTC")
    ).toOffsetDateTime().toString()
}
