package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

func handleErr(err interface{}) {
	if err != nil {
		panic(err)
	}
}

func pprint(arg interface{}) {
	b, _ := json.MarshalIndent(arg, "", "  ")
	fmt.Println(string(b))
}

type HttpError struct {
	Url *url.URL
	Err error
}

func (e *HttpError) Error() string {
	return "http request failed for " + e.Url.String() + ": " + e.Err.Error()
}

func makeRequest(u *url.URL) (*http.Response, error) {
	req, err := http.NewRequest("GET", u.String(), nil)
	if err != nil {
		return nil, err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		fmt.Println(`bad response`)
		err = &HttpError{u, nil}
		return nil, err
	}
	return resp, nil
}
