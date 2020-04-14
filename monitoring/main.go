package main

import (
	"fmt"
	"github.com/Shopify/sarama"
	"github.com/golang/protobuf/jsonpb"
	ptypes "github.com/golang/protobuf/ptypes"
	"net/http"
	"time"
)

// const baseURL = `https://smstestbed.nist.gov/vds`

const baseURL = `http://localhost:5000`

func main() {

	onRegister := make(chan *Client)

	hub := newHub(onRegister)

	go hub.run()
	http.HandleFunc("/", serveHome)
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})

	config := sarama.NewConfig()
	// config.Producer.Return.Successes = true

	producer, err := sarama.NewAsyncProducer([]string{"localhost:9092"}, config)
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

		message := &sarama.ProducerMessage{Topic: "input", Value: sarama.StringEncoder("testing 123")}
		producer.Input() <- message
		marshaller := jsonpb.Marshaler{}
		// b, _ := json.MarshalIndent(printStreams(init), "", "  ")
		b, _ := marshaller.MarshalToString(&SampleGroup{Samples: printStreams(init)})
		hub.broadcast <- []byte(b)

		seq := init.Header.NextSequence
		fmt.Printf("seq: %v\n", seq)

		// , streams.Header.FirstSequence
		samples := sample(device.Name, seq)

		for {
			select {
			case s := <-samples:
				fmt.Println("got samples")
				// message := &sarama.ProducerMessage{Topic: "input", Value: sarama.StringEncoder("testing 123")}
				// producer.Input() <- message
				// b, _ := json.MarshalIndent(printStreams(s), "", "  ")
				b, _ := marshaller.MarshalToString(&SampleGroup{Samples: printStreams(s)})
				hub.broadcast <- []byte(b)
			case c := <-onRegister:
				fmt.Println("sending init")
				b, _ := marshaller.MarshalToString(&SampleGroup{Samples: printStreams(init)})
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
	ts, err := time.Parse("2006-01-02T15:04:05.999999Z", item.Timestamp)
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
