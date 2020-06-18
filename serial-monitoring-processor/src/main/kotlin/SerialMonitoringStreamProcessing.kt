package main

import com.google.gson.Gson
import com.google.protobuf.InvalidProtocolBufferException
import com.google.protobuf.Message
import com.google.protobuf.Parser
import com.google.protobuf.Timestamp
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.common.errors.SerializationException
import org.apache.kafka.common.serialization.Deserializer
import org.apache.kafka.common.serialization.Serde
import org.apache.kafka.common.serialization.Serdes
import org.apache.kafka.common.serialization.Serializer
import org.apache.kafka.streams.KafkaStreams
import org.apache.kafka.streams.KeyValue
import org.apache.kafka.streams.StreamsBuilder
import org.apache.kafka.streams.StreamsConfig
import org.apache.kafka.streams.kstream.*
import org.apache.kafka.streams.processor.ProcessorContext
import org.slf4j.LoggerFactory
import proto.SerialMonitoring
import java.lang.NumberFormatException
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.*
import java.util.concurrent.CountDownLatch
import java.util.regex.Pattern
import kotlin.system.exitProcess


fun main() {

    val logger = LoggerFactory.getLogger("test")

    val props = Properties()
    props[StreamsConfig.APPLICATION_ID_CONFIG] = "streams-monitoring"
    props[StreamsConfig.BOOTSTRAP_SERVERS_CONFIG] = "localhost:9092"
    props[StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG] = Serdes.ByteArray().javaClass
    props[StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG] = Serdes.ByteArray().javaClass

    props[ConsumerConfig.AUTO_OFFSET_RESET_CONFIG] = "earliest"
    props[StreamsConfig.CACHE_MAX_BYTES_BUFFERING_CONFIG] = 0

    val builder = StreamsBuilder()


    logger.info("starting...")

    val input = builder
            .stream("input", Consumed.with(Serdes.String(), Serdes.ByteArray()))
            .flatTransform(TransformerSupplier { SampleTransformer() })

    /*
    // create store
    val lastValueStore = "lastValueStore"
    val lastValueStoreSupplier = Stores.keyValueStoreBuilder
        Stores.inMemoryKeyValueStore(lastValueStore),
        Serdes.Integer(),
        Serdes.Long()
    )

    // register store
    // builder.addStateStore(lastValueStoreSupplier)

    // val splitSamplePairSerde = ProtoMessageSerde(SerialMonitoring.SplitSamplePair.parser())

    input
        .filter { key, _ -> key == "execution" }
        .groupByKey(Grouped.with(Serdes.String(), Serdes.ByteArray()))
        .aggregate(
            { SerialMonitoring.SplitSamplePair.newBuilder().build() },
            { _, bytes, aggregate ->
                val value = SerialMonitoring.SplitSample.parseFrom(bytes)
                val b = SerialMonitoring.SplitSamplePair.newBuilder()
                b.first = aggregate.second
                b.second = value
                b.build()
            },
            Materialized.with(Serdes.String(), splitSamplePairSerde)
        )
        .toStream()
        .flatMapValues { value ->
            // val value = SerialMonitoring.SplitSamplePair.parseFrom(bytes)
            var first = value.first
            val second = value.second
            if (value.first.isInitialized and value.second.isInitialized) {
                val firstInstant =
                    Instant.ofEpochSecond(value.first.timestamp.seconds, value.first.timestamp.nanos.toLong())
                val secondInstant =
                    Instant.ofEpochSecond(value.second.timestamp.seconds, value.second.timestamp.nanos.toLong())
                val duration = between(firstInstant, secondInstant).toMillis()
                first = first.toBuilder().setDuration(duration).build()
            }
            listOf(first, second)
                .filter { it.isInitialized }
                .map { it.toByteArray() }
        }
        .peek { _, bytes ->
            val value = SerialMonitoring.SplitSample.parseFrom(bytes)
            val duration = Duration.ofMillis(value.duration)
            val ts = TimeUtil.toString(value.timestamp)
            if (duration == Duration.ZERO) {
                logger.info("at $ts value ${value.value} started")
            } else {
                logger.info("at $ts value was ${value.value} for ${duration.toMinutes()} minutes")
            }
        }
        //.transformValues(ValueTransformerSupplier {
        //    object: ValueTransformer<SerialMonitoring.SplitSample, String> {
        //        private lateinit var state: KeyValueStore<Int, Long>

        //        override fun init(context: ProcessorContext) {
        //            state = context.getStateStore(lastValueStore) as KeyValueStore<Int, Long>
        //        }

        //        override fun transform(value: SerialMonitoring.SplitSample): String {
        //            val timestamp = value.timestamp
        //            val last = state.get(1)
        //            val thisInstant = Instant.ofEpochSecond(timestamp.seconds, timestamp.nanos.toLong())
        //            val dur = if (last != null) {
        //                val lastInstant = Instant.ofEpochMilli(last)
        //                between(lastInstant, thisInstant)
        //            } else {
        //                Duration.ZERO
        //            }
        //            state.put(1, thisInstant.toEpochMilli())
        //            return "delta was ${dur.toMinutes()} minutes"
        //        }

        //        override fun close() {
        //            TODO("Not yet implemented")
        //        }
        //    }
        //}, lastValueStore)
        .mapValues { _ -> byteArrayOf() }
        .to("filtered", Produced.with(Serdes.String(), Serdes.ByteArray()))
    */



    /*
    val schema = ConnectSchema(
            "struct",
            listOf(
                    ConnectSchemaField(
                            "string",
                            true,
                            "timestamp"
                    ),
                    ConnectSchemaField(
                            "string",
                            true,
                            "key"
                    ),
                    ConnectSchemaField(
                            "string",
                            true,
                            "value"
                    )
            ),
            false,
            "sample"
    )

    val schema1 = ConnectSchema(
            "struct",
            listOf(
                    ConnectSchemaField(
                            "string",
                            true,
                            "timestamp"
                    ),
                    ConnectSchemaField(
                            "string",
                            true,
                            "value"
                    )
            ),
            false,
            "execution"
    )

    val schema2 = ConnectSchema(
            "struct",
            listOf(
                    ConnectSchemaField(
                            "json",
                            true,
                            "properties"
                    )
            ),
            false,
            "machine_state"
    )
    */

    // key categories


    val splitSamples = input.mapValues { bytes -> SerialMonitoring.SplitSample.parseFrom(bytes) }

    val (tabledStream, streamed) = splitSamples.branch(
        Predicate { _, sample -> sample.key in setOf("execution", "part_count", "avail", "estop", "mode", "active_axis", "tool_id", "program", "program_comment",
                    "line", "block" /* ehhhh */, "Fovr", "message", "servo", "comms", "logic", "motion", "system", "Xtravel",
                    "Xoverheat", "Xservo", "Ztravel", "Zoverheat", "Zservo", "Ctravel", "Coverheat", "Cservo", "S1servo", "S2servo") },
        Predicate { _, sample -> sample.key in setOf("Xload", "Zload", "Cload", "S1load", "S2load", "Zact", "Xact", "Cact", "S2speed", "S1speed", "path_position", "path_feedrate") }
    )

    val sampleValueSerde = ProtoMessageSerde(SerialMonitoring.SampleValue.parser())

    val tabled = tabledStream.map { key, value ->
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


    //         Predicate { _, sample ->
    //             setOf("avail", "estop", "mode").contains(sample.key)
    //         },
    //         Predicate { _, sample ->
    //             setOf("active_axis", "tool_id", "program", "program_comment", "line", "block", "Fovr").contains(sample.key)
    //         },
    //         Predicate { _, sample ->
    //             setOf("message").contains(sample.key)
    //         },
    //         Predicate { _, sample ->
    //             setOf("Xload", "Zload", "Cload", "S1load", "S2load").contains(sample.key)
    //         },
    //         Predicate { _, sample ->
    //             setOf("Zact", "Xact", "Cact", "S2speed", "S1speed", "path_position", "path_feedrate").contains(sample.key)
    //         },
    //         // states (NORMAL, WARNING?, etc)
    //         Predicate { _, sample ->
    //             setOf("servo", "comms", "logic", "motion", "system", "Xtravel", "Xoverheat", "Xservo", "Ztravel",
    //                     "Zoverheat", "Zservo", "Ctravel", "Coverheat", "Cservo", "S1servo", "S2servo").contains(sample.key)
    //         }
    //     )

    val gson = Gson()

    executionState.filter { _, record -> record != null }
        .map { key, record ->
            // val key = SerialMonitoring.SampleKey.parseFrom(keyBytes)
            // val record = SerialMonitoring.SampleValue.parseFrom(valueBytes)
            KeyValue("", gson.toJson(ConnectSchemaAndPayload(ConnectSchema(
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
                            "value"
                        ),
                        ConnectSchemaField(
                            "string",
                            false,
                            "timestamp"
                        )
                    ),
                    false,
                    "machine_execution_state"
                ),
                mapOf("value" to record.value, "timestamp" to stringifyTimestamp(record.timestamp), "machine_id" to key.machineID)
            )))
        }
        .to("machine_execution_state", Produced.with(Serdes.String(), Serdes.String()))

    val pat0 = Pattern.compile("^(%\\s{0,2})?(?<num>O[0-9]{3,6})\\s*(?<notes>(\\([\\s\\w\\- \\.\\/]+\\)\\s{0,3})+)")
    val pat1 = Pattern.compile("\\([\\s\\w\\-\\.\\/]+\\)")

    val programCommentSerde = ProtoMessageSerde(SerialMonitoring.ProgramComment.parser())

    val programCommentTable = programCommentState
            // .mapValues { value ->
            //     val mat = pat0.matcher(value.value)
            //     if (mat.matches()) {
            //         val b = SerialMonitoring.ProgramComment.newBuilder()
            //         val mat1 = pat1.matcher(mat.group("notes"))
            //         while (mat1.find()) {
            //             b.addNotes(mat1.group(0))
            //         }
            //         b.num = mat.group("num")
            //         b.originalText = value.value
            //         b.timestamp = value.timestamp
            //         b.build()
            //     } else {
            //         null
            //     }
            // }
            // .filter { _, value -> value != null }
            .selectKey { key, _ -> key.machineID }
            .toTable(Materialized.with(Serdes.String(), sampleValueSerde))

    val partCountTable = partCountState
            .selectKey { key, _ ->  key.machineID }
            .toTable(Materialized.with(Serdes.String(), sampleValueSerde))

    val sampleValueArraySerde = ProtoMessageSerde(SerialMonitoring.SampleValueArray.parser())
    val stringPairSerde = ProtoMessageSerde(SerialMonitoring.StringPair.parser())

    programCommentState
            .selectKey { key, _ -> key.machineID }
            .join(partCountTable, { programComment, partCount ->
                SerialMonitoring.SampleValuePair.newBuilder().setFirst(programComment).setSecond(partCount).build()
            }, Joined.with(Serdes.String(), sampleValueSerde, sampleValueSerde))
            .selectKey { machineID, pair -> SerialMonitoring.StringPair.newBuilder().setFirst(machineID).setSecond(pair.second.value).build() }
            .mapValues { pair -> pair.first }
            .groupByKey(Grouped.with(stringPairSerde, sampleValueSerde))
            .aggregate(
                    { SerialMonitoring.SampleValueArray.getDefaultInstance() },
                    { _, programComment, aggValue ->
                        if (aggValue.samplesList.find { it.value == programComment.value } != null) {
                            aggValue
                        } else {
                            SerialMonitoring.SampleValueArray.newBuilder().addAllSamples(aggValue.samplesList.plus(programComment)).build()
                        }
                    },
                    Materialized.with(stringPairSerde, sampleValueArraySerde)
            )
            .toStream()
            .flatMap { key, value ->
                val machineID = key.first;
                val partCount = key.second;
                value.samplesList.map {
                    KeyValue("${key.first}-${key.second}", gson.toJson(ConnectSchemaAndPayload(
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
                                                "part_count"
                                        ),
                                        ConnectSchemaField(
                                                "string",
                                                false,
                                                "program_comment"
                                        ),
                                        ConnectSchemaField(
                                                "string",
                                                false,
                                                "program_comment_timestamp"
                                        )
                                ),
                                false,
                                "machine_part_count_program_comment"
                        ),
                        mapOf(
                                "machine_id" to machineID,
                                "part_count" to partCount,
                                "program_comment" to it.value,
                                "program_comment_timestamp" to stringifyTimestamp(it.timestamp)
                        )
                    )))
                }
            }
            .to("machine_part_count_program_comment", Produced.with(Serdes.String(), Serdes.String()))

    partCountState
        .map { key, value -> KeyValue(key.machineID, value) }
        .join(programCommentTable, ValueJoiner<SerialMonitoring.SampleValue, SerialMonitoring.SampleValue?, String> { value1, value2 ->
            gson.toJson(ConnectSchemaAndPayload(
                    ConnectSchema(
                            "struct",
                            listOf(
                                    ConnectSchemaField(
                                            "string",
                                            false,
                                            "part_count"
                                    ),
                                    ConnectSchemaField(
                                            "string",
                                            true,
                                            "timestamp"
                                    ),
                                    ConnectSchemaField(
                                            "string",
                                            true,
                                            "comment_timestamp"
                                    ),
                                    ConnectSchemaField(
                                            "string",
                                            true,
                                            "comment"
                                    )
                            ),
                            false,
                            "part_count_comment"
                    ),
                    mapOf(
                        "part_count" to value1.value,
                        "timestamp" to stringifyTimestamp(value1.timestamp),
                        "comment" to value2?.value,
                        "comment_timestamp" to if (value2 != null) stringifyTimestamp(value2.timestamp) else null
                    )
            ))
        }, Joined.with(Serdes.String(), ProtoMessageSerde(SerialMonitoring.SampleValue.parser()), sampleValueSerde))
        .to("machine_part_count_comment", Produced.with(Serdes.String(), Serdes.String()))

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
                                        "string",
                                        true,
                                        "timestamp"
                                )
                        ),
                        false,
                        "machine_state_value"
                ),
                mapOf("value" to v.value, "timestamp" to stringifyTimestamp(v.timestamp))
            ))
        )
    }.to("machine_state", Produced.with(Serdes.String(), Serdes.String()))

    
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

// convert List<String> to List<[String, String]> to List<SplitSample>
class SampleTransformer : Transformer<String, ByteArray, Iterable<KeyValue<String, ByteArray>>> {
    private lateinit var context: ProcessorContext

    override fun init(context: ProcessorContext) {
        this.context = context
    }

    override fun transform(
            key: String?,
            bytes: ByteArray
    ): Iterable<KeyValue<String, ByteArray>> {
        val value = SerialMonitoring.Sample.parseFrom(bytes)
        val offset = context.offset()
        val values = value.valuesList
        val stringValues =
                if (values[0] == "message") listOf(listOf(values[0], values[2])) else values.chunked(2)
        val eachKey = key ?: "unknown"
        return stringValues
                .filter { it[0] != "" }
                .map {
                    val eachValue = SerialMonitoring.SplitSample.newBuilder()
                            .setTimestamp(value.timestamp)
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

fun stringifyTimestamp(timestamp: Timestamp): String {
    return ZonedDateTime.ofInstant(
            Instant.ofEpochSecond(timestamp.seconds, timestamp.nanos.toLong()),
            ZoneId.of("UTC")
    ).toOffsetDateTime().toString()
}

data class ConnectSchemaField(
        val type: String,
        val optional: Boolean,
        val field: String
)

data class ConnectSchema(
        val type: String,
        val fields: List<ConnectSchemaField>,
        val optional: Boolean,
        val name: String
)

data class ConnectSchemaAndPayload(
        val schema: ConnectSchema,
        val payload: Any
)

data class ExecutionSample(
        val timestamp: String,
        val value: String
)

data class SplitSample(
        val timestamp: String,
        val key: String,
        val value: String
)

data class ProgramComment(
        val num: String,
        val notes: List<String>,
        val originalText: String
)