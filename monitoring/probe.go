package main

import (
	"encoding/xml"
	"io/ioutil"
	"net/url"
)

func probe() MTConnectDevices {
	u, err := url.Parse(baseUrl + "/probe")

	handleErr(err)

	resp, err := makeRequest(u)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	var devices MTConnectDevices

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	handleErr(err)

	err = xml.Unmarshal(body, &devices)
	handleErr(err)

	return devices
}
