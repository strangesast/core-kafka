package main

import (
	"fmt"
	"net/http"
	"strings"
)

const baseUrl = `https://smstestbed.nist.gov/vds`

// cons baseUrl = `http://localhost:5000`

func main() {

	onRegister := make(chan *Client)
	hub := newHub(onRegister)
	go hub.run()
	http.HandleFunc("/", serveHome)
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})
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

		seq := init.Header.NextSequence
		fmt.Printf("seq: %v\n", seq)

		hub.broadcast <- []byte(strings.Join(printStreams(init), ""))

		// , streams.Header.FirstSequence
		samples := sample(device.Name, seq)

		for {
			select {
			case s := <-samples:
				hub.broadcast <- []byte(strings.Join(printStreams(s), ""))
			case c := <-onRegister:
				fmt.Println("sending init")
				c.send <- []byte(strings.Join(printStreams(init), ""))
			}
		}
	}()

	err := http.ListenAndServe(*addr, nil)
	handleErr(err)
}

func printStreams(streams MTConnectStreams) []string {
	var lines []string

	for _, stream := range streams.Streams {
		// stream.DeviceName
		for _, component := range stream.Components {
			// fmt.Printf("%s > %s\n", stream.DeviceName, component.Component)
			fmtString := "%s > %s > %s %s (%s): %s\n"
			if len(component.Samples.Items) > 0 {
				for _, item := range component.Samples.Items {
					line := fmt.Sprintf(fmtString, stream.DeviceName, component.Component, item.XMLName.Local, item.Name, "sample", item.Value)
					lines = append(lines, line)
				}
			}
			if len(component.Events.Items) > 0 {
				for _, item := range component.Events.Items {
					line := fmt.Sprintf(fmtString, stream.DeviceName, component.Component, item.XMLName.Local, item.Name, "event", item.Value)
					lines = append(lines, line)
				}
			}
			if len(component.Condition.Items) > 0 {
				for _, item := range component.Condition.Items {
					line := fmt.Sprintf(fmtString, stream.DeviceName, component.Component, item.XMLName.Local, item.Name, "condition", item.Value)
					lines = append(lines, line)
				}
			}
		}
	}
	return lines
}
