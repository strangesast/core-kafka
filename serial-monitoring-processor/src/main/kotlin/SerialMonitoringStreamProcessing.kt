package main

import com.google.protobuf.Message
import com.google.protobuf.Parser
import com.google.protobuf.util.TimeUtil
import org.apache.kafka.clients.consumer.ConsumerConfig
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
import org.apache.kafka.streams.state.Stores
import org.slf4j.LoggerFactory
import proto.SerialMonitoring
import java.sql.DriverManager
import java.sql.ResultSet
import java.sql.Statement
import java.time.Duration
import java.time.Duration.between
import java.time.Instant
import java.util.*
import java.util.concurrent.CountDownLatch
import kotlin.system.exitProcess


fun main() {

    val logger = LoggerFactory.getLogger("test")

    val url = "jdbc:postgresql://localhost/test"
    // val url = "jdbc:postgresql://localhost/test?user=fred&password=secret&ssl=true"
    val psqlProps = Properties()
    psqlProps.setProperty("user", "fred")
    psqlProps.setProperty("password", "secret")
    psqlProps.setProperty("ssl", "true")
    val conn = DriverManager.getConnection(url, psqlProps)

    val st: Statement = conn.createStatement()
    val rs: ResultSet = st.executeQuery("SELECT * FROM mytable WHERE columnfoo = 500")
    while (rs.next()) {
        print("Column 1 returned ")
        logger.info("Column")
        logger.info(rs.getString(1))
    }
    rs.close()
    st.close()


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

    // create store
    val lastValueStore = "lastValueStore"
    val lastValueStoreSupplier = Stores.keyValueStoreBuilder(
        Stores.inMemoryKeyValueStore(lastValueStore),
        Serdes.Integer(),
        Serdes.Long()
    )

    // register store
    builder.addStateStore(lastValueStoreSupplier)

    val splitSamplePairSerde = ProtoMessageSerde(SerialMonitoring.SplitSamplePair.parser())

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

    // input.to("output", Produced.with(Serdes.String(), Serdes.ByteArray()))

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

class ProtoMessageSerde<T: Message>(private val parser: Parser<T>) : Serde<T> {

    override fun serializer(): Serializer<T> {
        return Serializer<T> { _, data -> data.toByteArray() }
    }

    override fun deserializer(): Deserializer<T> {
        return Deserializer<T> { _, data: ByteArray -> parser.parseFrom(data) }
    }
}