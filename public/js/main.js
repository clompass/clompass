/* Run on load */
async function init() {
  await getUser();
  await login();
  setTimetable();
}

function getUrl(path) {
  return location.origin + "/" + path;
}

/* Send login request to server */
function login() {
  return new Promise(resolve => {
    console.log("Loading...");
    $.get(getUrl("timetable"), {
      username: btoa($("#username")[0].value),
      password: btoa($("#password")[0].value),
    }, (res) => {
      console.log(res);
      resolve(res);
    });
  });
}

/* Get user details for testing */
function getUser() {
  return new Promise(resolve => {
    $.get(getUrl("user"), (res) => {
      $("#username")[0].value = res[0];
      $("#password")[0].value = res[1];
      resolve();
    });
  });
}

/* Format timetable in HTML */
function setTimetable(timetable) {
  console.log(timetable);
  if (!timetable) {
    timetable = Array.from({length: 4}, () => { });
  }

  ("#timetable").innerHTML = "";
  for (i = 0; i < timetable.length; i++) {
    ("#timetable").innerHTML += `
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