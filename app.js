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
/* Fetch Learning tasks */
app.get("/tasks", async (req, res) => {
  username = req.query.username;
  password = req.query.password;
  if (username && password) {
    tasks = await getTasks(username, password);
    res.send(tasks);
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
app.get("/test", async (req, res) => {
  console.log("Sending response");
  res.send("Response! " + Date.now());
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
    console.log("-".repeat(8));
    console.log("Request sent from user {0}****".format(username.s(0, 3)));

    /* Open browser in puppeteer and navigate to website */
    console.log("Opening Browser...");
    browser = await puppeteer.launch({
      headless: true,
      // headless: false, // Uncomment to see browser
      defaultViewport: null,
      args: [
        "--start-maximized",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--incognito",
        "--single-process",
        "--no-zygote",
      ]
    });
    console.log("Opening Page...");
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
    // await page.waitForNavigation();
    //! Not working?
    // await page.waitForNavigation({waitUntil: "networkidle2"});

    /* Get innerText of subject display elements */
    Loop: while (true) {
      F.sleep(4);
      console.log("Fetching subjects...");
      doBreak = true;
      try {
        texts = await page.evaluate(() => {
          // els = document.querySelectorAll(".ext-evt-bd");
          els = document.getElementsByClassName("custom-event ext-cal-evt ext-cal-evr activity-type-1");
          texts = [];
          for (i = 0; i < els.length; i++) {
            texts.push(els[i].innerText);
          }
          return (texts);
        });
      } catch (err) {
        console.error(err);
        doBreak = false;
      }
      if (doBreak) {
        break Loop;
      }
    }

    /* Format subjects */
    subjects = [];
    for (i = 0; i < texts.length; i++) {
      a = texts[i].split(": ");
      if (!a) {
        continue;
      }
      b = a[1].split(" - ");
      if (!b) {
        continue;
      }
      subjects.push({
        time: a[0],
        code: b[1],
        room: b[2],
        teacher: b[3],
      });
    }

    /* Finish */
    browser.close();
    console.log("Done. (Subject count: {0})".format(subjects.length));
    resolve(subjects);
  });
}

function getTasks(username, password) {
  return new Promise(async resolve => {
    /* 'Decrypt' username / password */
    username = atob(username);
    password = atob(password);
    console.log("-".repeat(8));
    console.log("Request sent from user {0}****".format(username.s(0, 3)));

    /* Open browser in puppeteer and navigate to website */
    console.log("Opening Browser...");
    browser = await puppeteer.launch({
      headless: true,
      // headless: false, // Uncomment to see browser
      defaultViewport: null,
      args: [
        "--start-maximized",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--incognito",
        "--single-process",
        "--no-zygote",
      ]
    });
    console.log("Opening Page...");
    [page] = await browser.pages();
    await page.goto("https://lilydaleheights-vic.compass.education/Records/User.aspx#learningTasks");

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
    // await page.waitForNavigation();
    //! Not working?
    // await page.waitForNavigation({waitUntil: "networkidle2"});
    
    /* Get innerText of tasks display elements */
    Loop: while (true) {
      await F.sleep(4);
      console.log("Fetching tasks...");
      doBreak = true;
      try {
        tasks = await page.evaluate(async () => {
          document.querySelector("#ext-gen1728").click();
          document.querySelector("li.x-boundlist-item:nth-child(7)").click();
          await new Promise(resolve => {
            setTimeout(resolve, 2000);
          });
          table = document.querySelector("#gridview-1048-body");
          tasks = [];
          for (i = 0; i < table.childNodes.length; i++) {
            row = table.childNodes[i];
            tasks.push({
              code: row.childNodes[0].childNodes[0].innerText,
              name: row.childNodes[1].childNodes[0].childNodes[0].childNodes[0].innerText,
              date: row.childNodes[2].childNodes[0].childNodes[0].childNodes[1].innerText,
              status: row.childNodes[2].childNodes[0].childNodes[2].childNodes[1].innerText,
            });
          }
          return (tasks);
        });
      } catch (err) {
        console.error(err);
        doBreak = false;
      }
      if (doBreak) {
        break Loop;
      }
    }

    /* Finish */
    console.log("Done. (Task count: {0})".format(tasks.length));
    browser.close();
    resolve(tasks);
  });
}