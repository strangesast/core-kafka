package main

import SampleKey
import SplitSample
import com.google.gson.Gson
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.common.serialization.Serdes
import org.apache.kafka.streams.KafkaStreams
import org.apache.kafka.streams.KeyValue
import org.apache.kafka.streams.StreamsBuilder
import org.apache.kafka.streams.StreamsConfig
import org.apache.kafka.streams.kstream.*
import org.apache.kafka.streams.processor.ProcessorContext
import org.slf4j.LoggerFactory
import java.time.OffsetDateTime
import java.util.*
import java.util.concurrent.CountDownLatch
import kotlin.system.exitProcess


fun main() {

    val logger = LoggerFactory.getLogger("streams")

    val props = Properties()
    props[StreamsConfig.APPLICATION_ID_CONFIG] = System.getenv("STREAMS_APPLICATION_ID") ?: "alt-streams-monitoring"
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
    val splitSamples = raw.flatTransform(TransformerSupplier { SampleTransformer() })

    // val splitSampleSerde = AvroMessageSerde(SplitSample.getEncoder(), SplitSample.getDecoder())
    val sampleKeySerde = AvroMessageSerde(SampleKey.getEncoder(), SampleKey.getDecoder())
    val sampleValueSerde = AvroMessageSerde(SampleValue.getEncoder(), SampleValue.getDecoder())

    val (tabledStream, streamed) = splitSamples.branch(
            Predicate { _, sample -> sample.getKey() in setOf("execution", "part_count", "avail", "estop", "mode", "active_axis", "tool_id", "program", "program_comment",
                    "line", "block" /* ehhhh */, "Fovr", "message", "servo", "comms", "logic", "motion", "system", "Xtravel",
                    "Xoverheat", "Xservo", "Ztravel", "Zoverheat", "Zservo", "Ctravel", "Coverheat", "Cservo", "S1servo", "S2servo") },
            Predicate { _, sample -> sample.getKey() in setOf("Xload", "Zload", "Cload", "S1load", "S2load", "Zact", "Xact", "Cact", "S2speed", "S1speed", "path_position", "path_feedrate") }
    )

    val tabled = tabledStream
        .map { key, value ->
            KeyValue(
                    SampleKey.newBuilder().setMachineID(key).setProperty(value.getKey()).build(),
                    SampleValue.newBuilder().setValue(value.getValue()).setOffset(value.getOffset()).setTimestamp(value.getTimestamp()).build()
            )
        }
        .toTable(Materialized.with(sampleKeySerde, sampleValueSerde))

    /*
    val (executionState, partCountState, programCommentState) = tabled.toStream().branch(
            Predicate { key, _ -> key.getProperty() == "execution" },
            Predicate { key, _ -> key.getProperty() == "part_count" },
            Predicate { key, _ -> key.getProperty() == "program_comment"}
    )
     */

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
                mapOf("machine_id" to k.getMachineID(), "property" to k.getProperty(), "offset" to v.getOffset())
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
                mapOf("value" to v.getValue(), "timestamp" to v.getTimestamp())
            ))
        )
    }.to("machine_state", Produced.with(Serdes.String(), Serdes.String()))

    streamed.map { machineId, record ->
        KeyValue("$machineId-${record.getKey()}", gson.toJson(ConnectSchemaAndPayload(
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
                        "property" to record.getKey(),
                        "timestamp" to record.getTimestamp(),
                        "value" to record.getValue(),
                        "offset" to record.getOffset()
                )
        )))
    }.to("machine_values", Produced.with(Serdes.String(), Serdes.String()))
}

// convert List<String> to List<[String, String]> to List<SplitSample>
class SampleTransformer : Transformer<String, String, Iterable<KeyValue<String, SplitSample>>> {
    private lateinit var context: ProcessorContext

    override fun init(context: ProcessorContext) {
        this.context = context
    }

    override fun transform(
            key: String?,
            value: String
    ): Iterable<KeyValue<String, SplitSample>> {
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
                    val eachValue = SplitSample.newBuilder()
                            .setTimestamp(ts.toEpochMilli())
                            .setOffset(offset)
                            .setKey(it[0])
                            .setValue(it[1])
                            .build()
                    KeyValue(eachKey, eachValue)
                }
    }

    override fun close() {
    }
}
