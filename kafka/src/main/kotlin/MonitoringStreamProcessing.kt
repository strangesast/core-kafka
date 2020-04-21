import com.google.protobuf.util.JsonFormat
import main.MonitoringConsumerGrpc
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.common.serialization.Serdes
import org.apache.kafka.streams.KafkaStreams
import org.apache.kafka.streams.StreamsBuilder
import org.apache.kafka.streams.StreamsConfig
import org.apache.kafka.streams.kstream.Consumed
import org.apache.kafka.streams.kstream.Produced
import org.apache.kafka.streams.kstream.ValueTransformer
import org.apache.kafka.streams.kstream.ValueTransformerSupplier
import org.apache.kafka.streams.processor.ProcessorContext
import org.apache.kafka.streams.processor.StateStore
import org.apache.kafka.streams.state.Stores
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.CountDownLatch
import kotlin.system.exitProcess

import main.Monitoring.SampleGroup


fun main(args: Array<String>) {
    val props = Properties()
    props[StreamsConfig.APPLICATION_ID_CONFIG] = "streams-monitoring"
    props[StreamsConfig.BOOTSTRAP_SERVERS_CONFIG] = "localhost:9092"
    props[StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG] = Serdes.ByteArray().javaClass
    props[StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG] = Serdes.ByteArray().javaClass

    props[ConsumerConfig.AUTO_OFFSET_RESET_CONFIG] = "earliest"
    props[StreamsConfig.CACHE_MAX_BYTES_BUFFERING_CONFIG] = 0

    val builder = StreamsBuilder()

    val source = builder.stream("input", Consumed.with(Serdes.String(), Serdes.ByteArray()))


    val s1 = source.mapValues { value ->
        SampleGroup.parseFrom(value)
    }

    val s2 = s1.filter { _, value -> value.samplesCount > 0}

    val s3 = s2.mapValues {
        value -> JsonFormat.printer().print(value)
    }

    /*
    // create store
    val keyValueStoreBuilder =
        Stores.keyValueStoreBuilder(
            Stores.inMemoryKeyValueStore("myValueTransformState"),
            Serdes.String(),
            Serdes.String()
        )
    builder.addStateStore(keyValueStoreBuilder)
    */

    val s4 = s3.transformValues(ValueTransformerSupplier<String, String> {
        object : ValueTransformer<String, String> {
            // private lateinit var store: StateStore;
            private lateinit var context: ProcessorContext
            val format = SimpleDateFormat("yyyy.MM.dd HH:mm")

            override fun init(context: ProcessorContext) {
                this.context = context
                // this.store = context.getStateStore("myValueTransformState")
            }

            override fun transform(value: String?): String {
                val ts = context.timestamp()
                val date = Date(ts)
                val s = format.format(date)
                return "$s - $value"
            }

            override fun close() {
            }
        }
    })
    // }, "myValueTransformState")

    val s5 = s4.mapValues { value ->
        "toast $value"
    }

    s5.to("output", Produced.with(Serdes.String(), Serdes.String()))

    val streams = KafkaStreams(builder.build(), props)
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