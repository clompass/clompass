/* Import dependencies */
const fs = require("fs");
const path = require("path");
const express = require("express");
const http = require("http");
const WebSocketServer = require("ws").Server
const puppeteer = require("puppeteer");
const atob = require("atob");
const F = require("fnct");

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
  console.log("Listening at {0}".format(process.env.PORT ? "https://clompass.herokuapp.com" : "http://localhost:" + port));
});


/* Websocket communication */
const httpServer = http.createServer(app);
const wss = new WebSocketServer({
  server: httpServer,
});
httpServer.listen(8081);
wss.on("connection", (ws) => {
  ws.on("message", async (msg) => {
    msg = JSON.parse(msg);
    if (msg.type && msg.name) {
      switch (msg.type.upper()) {
        case "GET": {
          switch (msg.name.lower()) {
            case "timetable": {
              timetable = await getTimetable(msg.username, msg.password);
              ws.send(JSON.stringify({
                type: "RETURN",
                name: "timetable",
                time: Date.now(),
                data: timetable,
              }));
            }; break;
            case "user": {
              filepath = path.join(__dirname, "user.txt");
              if (fs.existsSync(filepath)) {
                ws.send(JSON.stringify({
                  type: "RETURN",
                  name: "user",
                  time: Date.now(),
                  data: fs.readFileSync(filepath).toString().split("\r\n"),
                }));
              }
            }; break;
          }
        }; break;
      }
    }
  });
  ws.on("end", () => {
    console.error("Connection ended...");
  });
});

/* Get timetable */
async function getTimetable(username, password) {
  username = atob(username);
  password = atob(password);
  console.log("Request sent from user {0}****".format(username.s(0, 3)));

  console.log("Opening Browser...");
  browser = await puppeteer.launch({headless: true, defaultViewport: null, args: ["--start-maximized"]});
  [page] = await browser.pages();
  console.log("Opening Page...");
  await page.goto("https://lilydaleheights-vic.compass.education/");

  console.log("Filling username and password...");
  await page.$$eval("#username", (el, username) => {
    el[0].value = username;
  }, username);
  await page.$$eval("#password", (el, password) => {
    el[0].value = password;
  }, password);

  console.log("Logging in...");
  await page.$eval("#button1", el => {
    el.disabled = false;
    el.click();
  });
  while (true) {
    await page.waitForNavigation();
    try {
      break;
    } catch {
      console.error("Failed");
    }
  }

  console.log("Fetching subjects...");
  texts = await page.evaluate(() => {
    els = document.querySelectorAll(".ext-evt-bd");
    texts = [];
    for (i = 0; i < els.length; i++) {
      texts.push(els[i].innerText);
    }
    return (texts);
  });
  console.log(texts);

  subjects = [];
  for (i = 0; i < texts.length; i++) {
    a = texts[i].split(": ");
    b = a[1].split(" - ");
    subjects.push({
      time: a[0],
      code: b[1],
      room: b[2],
      teacher: b[3],
    });
  }
  browser.close();

  console.log("Done.");
  console.log(subjects);
  return subjects;
}