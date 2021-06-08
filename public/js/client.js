/* Run on load */
var then;
async function init() {
  await getUser();
  then = Date.now();
  timetable = await login();
  setTimetable(timetable);
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
  // timetable = null;
  if (!timetable) {
    timetable = Array.from({length: 4}, () => ({
      time: "--:--",
      code: "-----",
      room: "--",
      teacher: "---",
    }));
  }

  str = "";
  for (i = 0; i < timetable.length; i++) {
    let {time, code, room, teacher} = timetable[i];
    str += `
    <article>
      <h1>Time: ${time}</h1>
      <h1>Code: ${code}</h1>
      <h1>Room: ${room}</h1>
      <h1>Teacher: ${teacher}</h1>
    </article>
    `;
  }
  $("#timetable").html(str);
  console.log(`Loaded (${timetable.length}) subjects in ${(Date.now() - then) / 1000}s`);
}