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
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.*
import java.util.concurrent.CountDownLatch
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

    val input = builder.stream("input", Consumed.with(Serdes.String(), Serdes.ByteArray()))
            .map { _, value -> KeyValue("", value) }
            .flatTransform(TransformerSupplier {
                // convert List<String> to List<[String, String]> to List<SplitSample>
                object : Transformer<String, ByteArray, Iterable<KeyValue<String, ByteArray>>> {
                    private lateinit var context: ProcessorContext

                    override fun init(context: ProcessorContext) {
                        this.context = context
                    }

                    override fun transform(
                            s: String,
                            bytes: ByteArray
                    ): Iterable<KeyValue<String, ByteArray>> {
                        val value = SerialMonitoring.Sample.parseFrom(bytes)
                        val offset = context.offset()
                        val values = value.valuesList
                        val stringValues =
                                if (values[0] == "message") listOf(listOf(values[0], values[2])) else values.chunked(2)
                        return stringValues
                                .filter { it[0] != "" }
                                .map {
                                    KeyValue(
                                            it[0], SerialMonitoring.SplitSample.newBuilder()
                                            .setTimestamp(value.timestamp)
                                            .setOffset(offset)
                                            .setKey(it[0])
                                            .setValue(it[1])
                                            .build()
                                            .toByteArray()
                                    )
                                }
                    }

                    override fun close() {
                    }
                }
            })

    /*
    // create store
    val lastValueStore = "lastValueStore"
    val lastValueStoreSupplier = Stores.keyValueStoreBuilder(
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


    val gson = Gson()

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

    val splitSamples = input
            .mapValues { bytes ->
                SerialMonitoring.SplitSample.parseFrom(bytes);
            }

    val splitSampleSerde = ProtoMessageSerde(SerialMonitoring.SplitSample.parser())
    val machineStateSerde = ProtoMessageSerde(SerialMonitoring.MachineState.parser())

    splitSamples
        .groupBy({ _, _ -> "machine_state" }, Grouped.with(Serdes.String(), splitSampleSerde))
        .aggregate(
                { SerialMonitoring.MachineState.newBuilder().build() },
                { _, sample, agg ->
                    val map = agg.propertiesMap.plus(Pair(sample.key, sample.value))
                    SerialMonitoring.MachineState.newBuilder().putAllProperties(map).build()
                },
                Materialized.with(Serdes.String(), machineStateSerde)
        )
        .toStream()
        .map { _, value -> KeyValue("machine_state", gson.toJson(value.propertiesMap)) }
        .to("machine_state", Produced.with(Serdes.String(), Serdes.String()))

//    splitSamples
//            .filter { _, value -> value.key == "execution" }
//            .map { _, sample -> KeyValue("machine_0_execution", gson.toJson(ConnectSchemaAndPayload(schema1, ExecutionSample(stringifyTimestamp(sample.timestamp), sample.value)))) }
//            .toTable(Named.`as`("machine_execution_table"), Materialized.with(Serdes.String(), Serdes.String()))
//            .toStream()
//            .to("machine_execution_stream")
//
//    splitSamples.mapValues { value ->
//        val timestamp = stringifyTimestamp(value.timestamp);
//        gson.toJson(ConnectSchemaAndPayload(schema, SplitSample(timestamp, value.key, value.value)))
//    }.to("output", Produced.with(Serdes.String(), Serdes.String()))

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