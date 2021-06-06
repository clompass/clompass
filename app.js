/* Import dependencies */
const fs = require("fs");
const path = require("path");
const express = require("express");
const puppeteer = require("puppeteer");
const atob = require("atob");
const F = require("fnct");
const bodyParser = require("body-parser");

/* Start electron program */
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

/* Allow access to files */
app.use("/public", express.static(path.join(__dirname, "public")));

/* Redirect to index file */
app.get("/", (req, res) => {
  res.send(fs.readFileSync(path.join(__dirname, "public/html/home.html")).toString());
});

/* Client communication */
/* Fetch timetable */
app.get("/timetable", async (req, res) => {
  username = req.query.username;
  password = req.query.password;
  if (username && password) {
    timetable = await getTimetable(username, password);
    res.send(timetable);
    return;
  }
  res.sendStatus(403);
});
/* Get user details (Debug) */
app.get("/user", async (req, res) => {
  filepath = path.join(__dirname, "user.txt");
  if (fs.existsSync(filepath)) {
    res.send(fs.readFileSync(filepath).toString().split("\r\n"));
    return;
  }
  res.sendStatus(405);
});

/* Set up server */
app.listen(port, () => {
  console.log("Listening at {0}".format(process.env.PORT ? "https://clompass.herokuapp.com" : "http://localhost:" + port));
});

/* Get timetable */
function getTimetable(username, password) {
  return new Promise(async resolve => {
    /* 'Decrypt' username / password */
    username = atob(username);
    password = atob(password);
    console.log("Request sent from user {0}****".format(username.s(0, 3)));

    /* Open browser in puppeteer and navigate to website */
    console.log("Opening Browser...");
    /* Change headless to true to see browser */
    browser = await puppeteer.launch({headless: true, defaultViewport: null, args: ["--start-maximized", "--no-sandbox"]});
    [page] = await browser.pages();
    await page.goto("https://lilydaleheights-vic.compass.education/");

    console.log("Filling username and password...");
    /* Complete inputs */
    await page.$$eval("#username", (el, username) => {
      el[0].value = username;
    }, username);
    await page.$$eval("#password", (el, password) => {
      el[0].value = password;
    }, password);

    /* Click login button */
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

    /* Get innerText of subject display elements */
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

    /* Format subjects */
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

    /* Finish */
    browser.close();
    console.log("Done.");
    resolve(subjects);
  });
}