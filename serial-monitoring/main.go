package main

import (
	"bufio"
	"context"
	"github.com/Shopify/sarama"
	"github.com/gogo/protobuf/proto"
	ptypes "github.com/golang/protobuf/ptypes"
	pb "github.com/strangesast/core/serial-monitoring/proto"
	"log"
	"net"
	"os"
	"strings"
	"time"
)

const timestampFormat = "2006-01-02T15:04:05.999Z"

func main() {
	kafkaVersion, err := sarama.ParseKafkaVersion(getEnv("KAFKA_VERSION", "2.4.1"))
	if err != nil {
		log.Fatalln("failed to parse kafka version string")
	}

	config := sarama.NewConfig()
	config.Net.DialTimeout = 5 * time.Minute
	config.Version = kafkaVersion
	config.ClientID = "golang-serial-monitoring-producer"

	kafkaHosts := strings.Split(getEnv("KAFKA_HOSTS", "localhost:9092"), ",")
	log.Printf("using KAFKA_VERSION='%v', KAFKA_HOSTS='%v'\n", kafkaVersion, kafkaHosts)

	kafkaClient, err := sarama.NewClient(kafkaHosts, config)

	if err != nil {
		log.Fatalf("failed to create sarama kafka client: %+v", err)
	}
	producer, err := sarama.NewAsyncProducerFromClient(kafkaClient)

	var d net.Dialer
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	adapterHost := getEnv("ADAPTER_HOST", "localhost:7878")
	conn, err := d.DialContext(ctx, "tcp", adapterHost)
	if err != nil {
		log.Fatalf("Failed to dial: %v", err)
	}
	defer conn.Close()

	reader := bufio.NewReader(conn)
	for {
		buf, err := reader.ReadBytes('\n')
		if err != nil {
			log.Fatalf("Error while reading: %v", err)
		}

		line := strings.TrimSuffix(string(buf), "\n")
		log.Println(line)
		values := strings.Split(line, "|")
		timestampString, values := values[0], values[1:]

		timestamp, err := time.Parse(timestampFormat, timestampString)
		if err != nil {
			log.Printf("failed to parse timestamp: %s (%s)\n", timestampString, timestampFormat)
			continue
		}

		timestampProto, err := ptypes.TimestampProto(timestamp)
		if err != nil {
			log.Printf("failed to parse proto timestamp: %+v\n", timestamp)
			continue
		}

		msg := &pb.Sample{
			Timestamp: timestampProto,
			Values:    values,
		}

		bytes, err := proto.Marshal(msg)
		if err != nil {
			log.Printf("failed to marshall proto: %+v\n", msg)
			continue
		}

		kMessage := &sarama.ProducerMessage{Topic: "input", Value: sarama.ByteEncoder(bytes)}
		producer.Input() <- kMessage
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
