package main

import (
	"encoding/json"
	"encoding/xml"
	"flag"
	"fmt"
	"github.com/fasthttp/websocket"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"
)

// like 2020-01-29T23:07:28.706Z
const (
	timestampLayout = "2006-01-02T15:04:05.999Z"
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second
	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second
	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10
	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

type result struct {
	// Samples []string `xml:"Streams>DeviceStream>ComponentStream>Samples>PathPosition"`
	Components []string `xml:"Streams>DeviceStream>ComponentStream>Samples>Position"`
}

type state map[string]map[string]string

type value struct {
	XMLName   xml.Name
	Timestamp string `xml:"timestamp,attr"`
	Sequence  int    `xml:"sequence,attr"`
	Value     string `xml:",chardata"`
}

type update struct {
	Timestamp time.Time
	Sequence  int
	Value     string
	Key       string
	Name      string
}

type updates map[string]update

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

func getData() chan updates {
	var u *url.URL
	query := make(url.Values)

	if os.Getenv("dev") == "true" {
		u, _ = url.Parse("https://smstestbed.nist.gov/vds/GFAgie01/sample")
		// query.Set("path", "//Components//Path")
		// query.Set("path", "//Components/Path//*[@name='path_pos']")
	} else {
		u, _ = url.Parse("http://10.0.0.101:5000/Fanuc-0id-01/sample")
		//query.Set("path", "//Components//Path")
		query.Set("path", "//Components//Linear//*[@name='Xact' or @name='Yact' or @name='Zact']")
		// query.Set("path", "//Components//Linear//*[@name='execution']")
	}

	query.Set("interval", "1000")
	u.RawQuery = query.Encode()

	log.Println(u.String())

	req, _ := http.NewRequest("GET", u.String(), nil)
	resp, err := http.DefaultClient.Do(req)

	if err != nil {
		log.Fatal(err)
	} else if resp.StatusCode != http.StatusOK {
		log.Fatalf("Status code is not OK: %v (%s)", resp.StatusCode, resp.Status)
	}

	data := make(chan updates)
	go func() {
		decoder := xml.NewDecoder(resp.Body)

		var decoderState int = 0
		var name string

		var u updates

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
				decoderState = 1
				u = make(updates)
				name = getXMLAttr(se, "name")
			} else if se, ok := t.(xml.StartElement); ok && se.Name.Local == "Samples" {
				decoderState = 2
			} else if se, ok := t.(xml.StartElement); ok && decoderState == 2 {
				var val value
				err := decoder.DecodeElement(&val, &se)
				if err == nil {
					ts, err := time.Parse(timestampLayout, val.Timestamp)
					if err == nil {
						ui := update{ts, val.Sequence, val.Value, name, val.XMLName.Local}
						u[ui.Key] = ui
					} else {
						log.Println("failed to parse date")
					}
				}
			} else if ee, ok := t.(xml.EndElement); ok && ee.Name.Local == "Samples" {
				decoderState = 1
			} else if ee, ok := t.(xml.EndElement); ok && ee.Name.Local == "ComponentStream" {
				decoderState = 0
				data <- u
			}
		}
	}()
	return data
}

var addr = flag.String("addr", "localhost:8080", "http service address")
var upgrader = websocket.Upgrader{}

type client struct {
	hub *Hub

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte
}

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	clients map[*client]bool

	// Inbound messages from the clients.
	broadcast chan []byte

	// Register requests from the clients.
	register chan *client

	// Unregister requests from clients.
	unregister chan *client

	state state
}

func newHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *client),
		unregister: make(chan *client),
		clients:    make(map[*client]bool),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

func echo(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Print("upgrade:", err)
		return
	}

	defer c.Close()
	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		log.Printf("recv: %s", message)
		err = c.WriteMessage(mt, message)
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}

func (c *client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &client{hub: hub, conn: conn, send: make(chan []byte, 256)}
	client.hub.register <- client
	client.send <- hub.state

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	// go client.readPump()
}

func getUpdates() chan state {
	s := make(state)
	// rate := time.Second
	// throttle := time.Tick(rate)
	ch0 := make(chan state, 1)
	// ch1 := make(chan state)
	go func() {
		for u := range getData() {
			for _, record := range u {
				si := make(map[string]string)
				si["date"] = record.Timestamp.Format(time.RFC3339)
				si["key"] = record.Key
				si["value"] = record.Value
				si["sequence"] = strconv.Itoa(record.Sequence)
				si["type"] = record.Name
				s[record.Key] = si
			}
			ch0 <- s
		}
	}()
	return ch0
	// go func() {
	// 	for s := range ch0 {
	// 		<-throttle
	// 		ch1 <- s
	// 	}
	// }()
	// return ch1
}

func main() {
	flag.Parse()

	log.Println("Starting...")

	hub := newHub()
	go hub.run()

	http.HandleFunc("/echo", echo)
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})

	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}

	// for s := range getUpdates() {
	// 	b, _ := json.MarshalIndent(s, "", "  ")
	// 	fmt.Println(string(b))
	// }
}
