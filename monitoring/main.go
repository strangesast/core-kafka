package main

import (
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"net/http"
)

func main() {
	log.Println("Starting...")

	url := "https://smstestbed.nist.gov/vds/GFAgie01/sample?interval=5000&path=//Components/Path"

	req, err := http.NewRequest("GET", url, nil)

	if err != nil {
		log.Fatal(err)
	}

	resp, err := http.DefaultClient.Do(req)

	if err != nil {
		log.Fatal(err)
	}

	if resp.StatusCode != http.StatusOK {
		log.Fatalf("Status code is not OK: %v (%s)", resp.StatusCode, resp.Status)
	}

	decoder := xml.NewDecoder(resp.Body)

	var el string
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
			el = se.Name.Local
			fmt.Println(el)
			// if el == "MTConnectStream" {
			// 	fmt.Println(se)
			// }
		}
	}
}
