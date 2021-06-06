/* Send login request to server */
function login() {
  console.log("Loading...");
  $.post(location.origin + "/test", {
    type: "GET",
    name: "timetable",
    time: Date.now(),
    username: btoa($("#username")[0].value),
    password: btoa($("#password")[0].value),
  });
}

/* Get user details for testing */
function getUser() {
  // ws.send(JSON.stringify({
  //   type: "GET",
  //   name: "user",
  //   time: Date.now(),
  // }));
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

  /* doc.id("timetable").innerHTML = "";
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
  } */
}