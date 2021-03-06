/* Run on load */
var then, table, tasks;
async function init() {
  await getUser();
  then = Date.now();
  table = await login();
  setTimetable();
  tasks = await getTasks();
  setTasks();
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
    }, res => {
      resolve(res);
    });
  });
}

function getTasks() {
  return new Promise(resolve => {
    $.get(getUrl("tasks"), {
      username: btoa($("#username")[0].value),
      password: btoa($("#password")[0].value),
    }, res => {
      resolve(res);
    });
  });
}

/* Get user details for testing */
function getUser() {
  return new Promise(resolve => {
    $.ajax({
      url: getUrl("user"),
      success: (res) => {
        $("#username")[0].value = res[0];
        $("#password")[0].value = res[1];
        resolve();
      },
      error: (err) => {
        console.error(err);
      },
      timeout: 60000,
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

function setTasks() {
  if (!tasks) {
    return;
  }

  str = "";
  for (i = 0; i < tasks.length; i++) {
    let {code, name, date, status} = tasks[i];
    statuses = [
      "receivedlate",
      "ontime",
      "pending",
    ];
    statusImage = "";
    if (statuses.includes(status.toLowerCase().split(" ").join(""))) {
      statusImage = `<img class="status" src="public/svg/task-status/${status.toLowerCase().split(" ").join("")}.svg" />`;
    }
    str += `
    <article>
      <p>${code} - ${name} - ${date} - ${status} <span>${statusImage}</span></p>
    </article>
    `;
  }
  $("#ltasks").html(str);
  console.log(`Loaded (${tasks.length}) tasks in ${(Date.now() - then) / 1000}s`);
}