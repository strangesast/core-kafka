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

type value struct {
	XMLName   xml.Name
	Timestamp string `xml:"timestamp,attr"`
	Sequence  int    `xml:"sequence,attr"`
	Value     string `xml:",chardata"`
}

// receive xml tokens
// if start of component, take until end of component

func getXMLAttr(el xml.StartElement, key string) string {
	for _, val := range el.Attr {
		if val.Name.Local == key {
			return val.Value
		}
	}
	return ""
}

func outer(ch1 chan xml.Token, decoder *xml.Decoder) chan interface{} {
	ch0 := make(chan interface{})
	// defer close(ch0)
	go func() {
		var t xml.Token
		for {
			t = <-ch1
			if t == nil {
				break
			}
			ch2 := filter(ch1, "ComponentStream") // get children of ComponentStream, start with parent
			t = <-ch2
			if t != nil { // if parent found
				name := getXMLAttr(t.(xml.StartElement), "name") // get parent name attr
				fmt.Printf("name: '%s'\n", name)
				ch3 := filter(ch2, "Samples") // get any children with parent "Sample"
				t = <-ch3
				if t != nil { // Sample found
					// could get sample attributes
					for {
						t = <-ch3
						if t == nil {
							break
						}
						if se, ok := t.(xml.StartElement); ok {
							fmt.Println(se.Name.Local)
							// var val value
							// err := decoder.DecodeElement(&val, &se)
							// if err != nil {
							// 	fmt.Println(err)
							// }
						}
					}
				}
			}
		}
	}()
	return ch0
}

func filter(ch0 chan xml.Token, name string) chan xml.Token {
	var t xml.Token
	ch1 := make(chan xml.Token)
	// defer close(ch1)
	go func() {
		for {
			t = <-ch0
			if t == nil {
				break
			}
			if se, ok := t.(xml.StartElement); ok && se.Name.Local == name {
				break
			}
		}
		for t != nil {
			if ee, ok := t.(xml.EndElement); ok && ee.Name.Local == name {
				break
			}
			ch1 <- t
			t = <-ch0
		}
		ch1 <- nil
	}()
	return ch1
}

func main() {
	log.Println("Starting...")

	var u *url.URL
	query := make(url.Values)

	if os.Getenv("dev") == "true" {
		u, _ = url.Parse("https://smstestbed.nist.gov/vds/GFAgie01/sample")
		// query.Set("path", "//Components//Path")
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

	var state int = 0
	var name string

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
		if se, ok := t.(xml.StartElement); ok && se.Name.Local == "ComponentStream" {
			state = 1
			name = getXMLAttr(se, "name")
		} else if se, ok := t.(xml.StartElement); ok && se.Name.Local == "Samples" {
			state = 2
		} else if se, ok := t.(xml.StartElement); ok && state == 2 {
			var val value
			err := decoder.DecodeElement(&val, &se)
			if err == nil {
				fmt.Println(name, val.XMLName.Local, val.Timestamp, val.Sequence, val.Value)
			}
		} else if ee, ok := t.(xml.EndElement); ok && ee.Name.Local == "Samples" {
			state = 1
		} else if ee, ok := t.(xml.StartElement); ok && ee.Name.Local == "ComponentStream" {
			state = 0
		}
	}
}
