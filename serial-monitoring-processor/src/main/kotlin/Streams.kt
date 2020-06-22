package main

import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.common.serialization.Serdes
import org.apache.kafka.streams.KafkaStreams
import org.apache.kafka.streams.StreamsBuilder
import org.apache.kafka.streams.StreamsConfig
import org.apache.kafka.streams.kstream.Consumed
import org.slf4j.LoggerFactory
import java.time.OffsetDateTime
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

    val builder = StreamsBuilder()

    val input = builder.stream("input-text", Consumed.with(Serdes.String(), Serdes.String()))

    input
        .flatMapValues { value ->
            val l = value.split(Regex("(?<!\\\\)[|]")).toMutableList()
            val ts = OffsetDateTime.parse(l.removeAt(0)).toInstant()
            val pairs = if (l[0] == "message") listOf(Pair(l[0], l[2])) else l.chunked(2)
                    .map { Pair(it[0], it[1]) }
                    .filter { it.first != "" }
            pairs.map { Pair(ts, it) }
        }
        .foreach { key, value ->
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