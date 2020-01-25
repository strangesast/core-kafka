package main

import (
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
)

type Result struct {
	Samples []string `xml:"Streams>DeviceStream>ComponentStream>Samples>PathPosition"`
}

func main() {
	log.Println("Starting...")

	//url := "https://smstestbed.nist.gov/vds/GFAgie01/sample?interval=5000&path=//Components/Path"
	u, _ := url.Parse("https://smstestbed.nist.gov/vds/GFAgie01/sample")
	query := u.Query()
	query.Set("interval", "1000")
	query.Set("path", "//Components/Path//*[@name='path_pos']")
	u.RawQuery = query.Encode()
	fmt.Println(u)

	req, _ := http.NewRequest("GET", u.String(), nil)
	resp, err := http.DefaultClient.Do(req)

	if err != nil {
		log.Fatal(err)
	}

	if resp.StatusCode != http.StatusOK {
		log.Fatalf("Status code is not OK: %v (%s)", resp.StatusCode, resp.Status)
	}

	decoder := xml.NewDecoder(resp.Body)

	// var el string
	for {
		t, err := decoder.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatal(err)
		}
		if t == nil {
			break
		}
		switch se := t.(type) {
		case xml.StartElement:
			if se.Name.Local == "MTConnectStreams" {
				fmt.Println(se.Name.Local)
				var p Result
				decoder.DecodeElement(&p, &se)
				for i, val := range p.Samples {
					fmt.Println(i, val)
					break
				}
			}
		}
	}
}
