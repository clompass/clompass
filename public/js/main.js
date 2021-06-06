/* Communicate with server */
var HOST = location.origin.includes("localhost") ? "ws://127.0.0.1:8081" : location.origin.replace(/^http/, "ws").replace(/^wss/, "ws");
var ws = new WebSocket(HOST);
ws.onerror = function (err) {
  console.error(err);
};
ws.onmessage = function (event) {
  event = JSON.parse(event.data);
  if (event.type && event.name) {
    switch (event.type.upper()) {
      case "RETURN": {
        switch (event.name.lower()) {
          case "timetable": {
            if (event.data) {
              setTimetable(event.data);
            }
          }; break;
          case "user": {
            if (event.data) {
              $("#username")[0].value = event.data[0];
              $("#password")[0].value = event.data[1];
              login();
            }
          }; break;
        }
      }; break;
    }
  }
};
ws.onclose = function () {
  console.error("Connection is closed...");
}
ws.onopen = getUser;

/* Send login request to server */
function login() {
  console.log("Loading...");
  ws.send(JSON.stringify({
    type: "GET",
    name: "timetable",
    time: Date.now(),
    username: btoa(doc.id("username").value),
    password: btoa(doc.id("password").value),
  }));
}

/* Get user details for testing */
function getUser() {
  ws.send(JSON.stringify({
    type: "GET",
    name: "user",
    time: Date.now(),
  }));
}

/* Run on load */
function init() {
  // setTimetable();
}

/* Format timetable in HTML */
function setTimetable(timetable) {
  console.log(timetable);
  if (!timetable) {
    timetable = Array.from({length: 4}, () => { });
  }
  doc.id("timetable").innerHTML = "";
  for (i = 0; i < timetable.length; i++) {
    doc.id("timetable").innerHTML += `
    <article>
      <h1>Time: {time}</h1>
      <h1>Code: {code}</h1>
      <h1>Room: {room}</h1>
      <h1>Teacher: {teacher}</h1>
    </article>
    `.format({
      time: "Unknown",
      code: "Unknown",
      room: "Unknown",
      teacher: "Unknown",
    });
  }
}