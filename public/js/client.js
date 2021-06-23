/* Run on load */
var then;
var table;
async function init() {
  await getUser();
  then = Date.now();
  console.log(1);
  table = await login();
  console.log(table);
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
function setTimetable() {
  // timetable = null;
  if (!table) {
    table = Array.from({length: 4}, () => ({
      time: "--:--",
      code: "-----",
      room: "--",
      teacher: "---",
    }));
  }
  console.log(table);

  str = "";
  for (i = 0; i < table.length; i++) {
    let {time, code, room, teacher} = table[i];
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
  console.log(`Loaded (${table.length}) subjects in ${(Date.now() - then) / 1000}s`);
}