package main

import (
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
)

type result struct {
	// Samples []string `xml:"Streams>DeviceStream>ComponentStream>Samples>PathPosition"`
	Components []string `xml:"Streams>DeviceStream>ComponentStream>Samples>Position"`
}

type position struct {
	Timestamp string `xml:"timestamp,attr"`
	Sequence  int    `xml:"sequence,attr"`
	Value     string `xml:",chardata"`
}

func main() {
	log.Println("Starting...")

	var u *url.URL
	query := make(url.Values)

	if os.Getenv("dev") == "true" {
		u, _ = url.Parse("https://smstestbed.nist.gov/vds/GFAgie01/sample")
		query.Set("path", "//Components//Path")
		// query.Set("path", "//Components/Path//*[@name='path_pos']")
	} else {
		u, _ = url.Parse("http://10.0.0.101:5000/Fanuc-0id-01/sample")
		//query.Set("path", "//Components//Path")
		// query.Set("path", "//Components//Linear//*[@name='Xact' or @name='Yact' or @name='Zact']")
		query.Set("path", "//Components//Linear//*[@name='execution']")
	}

	// query.Set("interval", "1000")
	u.RawQuery = query.Encode()

	log.Println(u.String())

	req, _ := http.NewRequest("GET", u.String(), nil)
	resp, err := http.DefaultClient.Do(req)

	if err != nil {
		log.Fatal(err)
	} else if resp.StatusCode != http.StatusOK {
		log.Fatalf("Status code is not OK: %v (%s)", resp.StatusCode, resp.Status)
	}

	decoder := xml.NewDecoder(resp.Body)

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
			//if se.Name.Local == "MTConnectStreams" {
			//	var p Result
			//	decoder.DecodeElement(&p, &se)
			//	for i, val := range p.Components {
			//		fmt.Printf("%d - %s\n", i, val)
			//	}
			//}
			if se.Name.Local == "ComponentStream" {
				for _, val := range se.Attr {
					if val.Name.Local == "name" {
						fmt.Printf("name=%s\n", val.Value)
					}
				}
			}
			if se.Name.Local == "Position" {
				// fmt.Println(se)
				var p position
				decoder.DecodeElement(&p, &se)
				fmt.Println(p)
				// for _, val := range se.Attr {
				// 	if val.Name.Local == "name" {
				// 		fmt.Printf("name=%s\n", val.Value)
				// 	}
				// }
			}

		}
	}
}
