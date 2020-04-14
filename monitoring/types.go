package main

import (
	"encoding/xml"
)

type MTConnectStreams struct {
	XMLName xml.Name               `xml:"MTConnectStreams"`
	Header  MTConnectStreamsHeader `xml:"Header"`
	Streams []Stream               `xml:"Streams>DeviceStream"`
}

type MTConnectStreamsHeader struct {
	CreationTime  string `xml:"creationTime,attr"`
	Sender        string `xml:"sender,attr"`
	InstanceId    string `xml:"instanceId,attr"`
	Version       string `xml:"version,attr"`
	BufferSize    int    `xml:"bufferSize,attr"`
	NextSequence  int    `xml:"nextSequence,attr"`
	FirstSequence int    `xml:"lastSequence,attr"`
}

type Stream struct {
	XMLName    xml.Name          `xml:"DeviceStream"`
	DeviceName string            `xml:"name,attr"`
	Components []ComponentStream `xml:"ComponentStream"`
}

type ComponentStream struct {
	XMLName     xml.Name `xml:"ComponentStream"`
	Component   string   `xml:"component,attr"`
	Name        string   `xml:"name,attr"`
	ComponentId string   `xml:"componentId,attr"`
	Samples     Items    `xml:"Samples"`
	Events      Items    `xml:"Events"`
	Condition   Items    `xml:"Condition"`
}

type Items struct {
	XMLName xml.Name
	Items   []ComponentSample
}

func (e *Items) UnmarshalXML(d *xml.Decoder, start xml.StartElement) error {
	var items []ComponentSample
	var done bool
	for !done {
		t, err := d.Token()
		if err != nil {
			return err
		}
		switch t := t.(type) {
		case xml.StartElement:
			e := ComponentSample{}
			d.DecodeElement(&e, &t)
			items = append(items, e)
		case xml.EndElement:
			done = true
		}
	}
	e.XMLName = start.Name
	e.Items = items
	return nil
}

type ComponentSample struct {
	XMLName    xml.Name
	DataItemId string `xml:"dataItemId,attr"`
	Name       string `xml:"name,attr"`
	SubType    string `xml:"subType,attr"`
	Timestamp  string `xml:"timestamp,attr"`
	Sequence   string `xml:"sequence,attr"`
	Value      string `xml:",chardata"`
}

type MTConnectDevices struct {
	XMLName xml.Name               `xml:"MTConnectDevices"`
	Header  MTConnectDevicesHeader `xml:"Header"`
	Devices []Device               `xml:"Devices>Device"`
}

type MTConnectDevicesHeader struct {
	CreationTime    string `xml:"creationTime,attr"`
	Sender          string `xml:"sender,attr"`
	InstanceID      string `xml:"instanceId,attr"`
	Version         string `xml:"version,attr"`
	AssetBufferSize int    `xml:"assetBufferSize"`
	AssetCount      int    `xml:"assetCount,attr"`
	BufferSize      int    `xml:"bufferSize"`
}

type Device struct {
	XMLName     xml.Name    `xml:"Device"`
	Id          string      `xml:"id,attr"`
	Name        string      `xml:"name,attr"`
	Uuid        string      `xml:"uuid,attr"`
	Description Description `xml:"Description"`
	Components  Components  `xml:"Components"`
	DataItems   []DataItem  `xml:"DataItems>DataItem"`
}

type DataItem struct {
	XMLName xml.Name   `xml:"DataItem"`
	Attrs   []xml.Attr `xml:",any,attr"`
}

type Components struct {
	XMLName xml.Name
	Items   []Component
}

type Component struct {
	XMLName   xml.Name
	ID        string     `xml:"id,attr"`
	Name      string     `xml:"name,attr"`
	DataItems []DataItem `xml:"DataItems>DataItem"`
}

func (e *Components) UnmarshalXML(d *xml.Decoder, start xml.StartElement) error {
	var items []Component
	var done bool
	for !done {
		t, err := d.Token()
		if err != nil {
			return err
		}
		switch t := t.(type) {
		case xml.StartElement:
			e := Component{}
			d.DecodeElement(&e, &t)
			items = append(items, e)
		case xml.EndElement:
			done = true
		}
	}
	e.XMLName = start.Name
	e.Items = items
	return nil
}

type Description struct {
	Manufacturer string `xml:"manufacturer,attr"`
	Model        string `xml:"model,attr"`
	Description  string `xml:",chardata"`
}

// execution enum: READY, ACTIVE, INTERRUPTED, FEED_HOLD, STOPPED, OPTIONAL_STOP, PROGRAM_STOPPED, or PROGRAM_COMPLETED

type MTConnectError struct {
	Header MTConnectErrorHeader  `xml:"Header"`
	Errors []MTConnectErrorError `xml:"Errors>Error"`
}

type MTConnectErrorError struct {
	ErrorCode string `xml:"errorCode,attr"`
	Value     string `xml:",chardata"`
}

type MTConnectErrorHeader struct {
	CreationTime string `xml:"creationTime,attr"`
	Sender       string `xml:"sender,attr"`
	InstanceId   string `xml:"instanceId,attr"`
	Version      string `xml:"version,attr"`
	BufferSize   int    `xml:"bufferSize,attr"`
}
