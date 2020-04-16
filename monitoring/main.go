package main

import (
	"fmt"
	"github.com/Shopify/sarama"
	"github.com/gogo/protobuf/proto"
	"github.com/golang/protobuf/jsonpb"
	ptypes "github.com/golang/protobuf/ptypes"
	"net/http"
	"os"
	"time"
)

// const baseURL = `https://smstestbed.nist.gov/vds`

var baseURL = os.Getenv("BASE_URL")

func main() {

	onRegister := make(chan *Client)

	hub := newHub(onRegister)

	go hub.run()
	http.HandleFunc("/", serveHome)
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})

	config := sarama.NewConfig()
	config.Net.DialTimeout = 5 * time.Minute

	kafkaVersion, err := sarama.ParseKafkaVersion("2.4.1")
	handleErr(err)
	config.Version = kafkaVersion
	config.ClientID = "golang-monitoring-producer"
	// config.Producer.Return.Successes = true

	kafkaHost := os.Getenv("KAFKA_HOST")
	kafkaConn := fmt.Sprintf("%s:9092", kafkaHost)
	producer, err := sarama.NewAsyncProducer([]string{kafkaConn}, config)
	handleErr(err)

	go func() {
		devices := probe()
		if len(devices.Devices) == 0 {
			fmt.Println("no devices?")
			return
		}
		device := devices.Devices[0]

		// serve()
		fmt.Printf("Device %s\n", device.Name)
		init := current(device.Name)

		// pprint(init)

		fmt.Println("input messsage")

		msg := &SampleGroup{Samples: printStreams(init), LastSequence: int64(init.Header.LastSequence)}

		b0, err := proto.Marshal(msg)
		handleErr(err)

		kMessage := &sarama.ProducerMessage{Topic: "input", Value: sarama.ByteEncoder(b0)}
		producer.Input() <- kMessage

		marshaller := jsonpb.Marshaler{}
		b1, err := marshaller.MarshalToString(msg)
		handleErr(err)
		hub.broadcast <- []byte(b1)

		seq := init.Header.NextSequence
		fmt.Printf("seq: %v\n", seq)

		// , streams.Header.FirstSequence
		samples := sample(device.Name, seq)

		for {
			select {
			case s := <-samples:
				fmt.Println("got samples")

				msg := &SampleGroup{Samples: printStreams(s), LastSequence: int64(s.Header.LastSequence)}

				b0, err := proto.Marshal(msg)
				handleErr(err)

				b1, err := marshaller.MarshalToString(msg)
				handleErr(err)

				kMessage := &sarama.ProducerMessage{Topic: "input", Value: sarama.ByteEncoder(b0)}
				producer.Input() <- kMessage
				hub.broadcast <- []byte(b1)
			case c := <-onRegister:
				fmt.Println("sending init")

				kMessage := &SampleGroup{Samples: printStreams(init)}
				b, _ := marshaller.MarshalToString(kMessage)
				c.send <- []byte(b)
			}
		}
	}()

	err = http.ListenAndServe(*addr, nil)
	handleErr(err)
}

func printStreams(streams mMTConnectStreams) []*Sample {
	var samples []*Sample

	for _, stream := range streams.Streams {
		for _, component := range stream.Components {
			for _, item := range component.Samples.Items {
				sample := parseSample(item, stream, component, Sample_SAMPLE)
				samples = append(samples, &sample)
			}
			for _, item := range component.Events.Items {
				sample := parseSample(item, stream, component, Sample_EVENT)
				samples = append(samples, &sample)
			}
			for _, item := range component.Condition.Items {
				sample := parseSample(item, stream, component, Sample_CONDITION)
				samples = append(samples, &sample)
			}
		}
	}
	return samples
}

func parseSample(item mComponentSample, stream mStream, component mComponentStream, stype Sample_SampleType) Sample {
	attrs := make(map[string]string)

	for _, attr := range item.Attrs {
		n := attr.Name.Local
		switch n {
		case "dataItemId",
			"timestamp":
			continue
		default:
			attrs[n] = attr.Value
		}
	}
	// yeesh
	// format := "2006-01-02T15:04:05.999999Z"
	format := "2006-01-02T15:04:05.999999"
	ts, err := time.Parse(format, item.Timestamp)
	handleErr(err)
	t, err := ptypes.TimestampProto(ts)
	handleErr(err)

	return Sample{
		Device:    stream.DeviceName,
		Itemid:    item.DataItemID,
		Sequence:  int64(item.Sequence),
		Component: component.ComponentID,
		Type:      stype,
		Value:     item.Value,
		Timestamp: t,
		Tag:       item.XMLName.Local,
		Attrs:     attrs,
	}
}
