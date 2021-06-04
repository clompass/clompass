/* Import dependencies */
const F = require("fnct");
const fs = require("fs");
const path = require("path");
const express = require("express");
const WebSocketServer = require("ws").Server
const atob = require("atob");

const app = express();
const port = process.env.PORT || 3000;

/* Allow access to files */
app.use("/public", express.static(path.join(__dirname, "public")));

/* Redirect to index file */
app.get("/", (req, res) => {
  res.send(fs.readFileSync(path.join(__dirname, "public/html/home.html")).toString());
});

/* Set up server */
app.listen(port, () => {
  console.log("Listening at {0}".format(F.url.online ? "https://clompass.herokuapp.com" : "http://localhost:" + port));
});


/* Websocket communication */
const wss = new WebSocketServer({port: 8081}); wss.on('connection', (ws) => {
  ws.on("message", async (msg) => {
    msg = JSON.parse(msg);
    if (msg.type == "GET") {
      if (msg.name == "timetable") {
        timetable = await getTimetable(msg.username, msg.password);
        ws.send(JSON.stringify({
          type: "RETURN",
          name: "timetable",
          time: Date.now(),
          data: timetable,
        }));
      }
    }
  });
  ws.on("end", () => {
    console.error("Connection ended...");
  });
});


/* Get timetable from browser */
function getTimetable(username, password) {
  username = atob(username);
  password = atob(password);
  console.log("Request sent for user {0}****".format(username.s(0, 3).upper()));
  /* API Stuff */

}