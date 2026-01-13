/************ DATA *************/
let teachers = JSON.parse(localStorage.getItem("teachers")) || [
  "Mr. John Smith",
  "Ms. Rachel Adams",
  "Mr. Michael Lee",
  "Mrs. Grace Brown"
];

let attendanceRecords = JSON.parse(localStorage.getItem("attendanceRecords")) || {};

const teacherInput = document.getElementById("teacherInput");
const tableBody = document.getElementById("tableBody");
const absentList = document.getElementById("absentList");
const message = document.getElementById("message");

const totalTeachers = document.getElementById("totalTeachers");
const presentToday = document.getElementById("presentToday");
const absentToday = document.getElementById("absentToday");

document.getElementById("markBtn").onclick = markAttendance;

function markAttendance() {
  const name = teacherInput.value.trim();
  if (!name) return show("Enter name", "orange");

  const teacher = teachers.find(t => t.toLowerCase() === name.toLowerCase());

  if (!teacher) return show("Name not found", "red");

  const now = new Date();
  const date = now.toLocaleDateString();
  attendanceRecords[date] ??= [];

  if (attendanceRecords[date].some(r => r.name === teacher)) return show("Already marked", "orange");

  attendanceRecords[date].push({
    name: teacher,
    status: "Present",
    time: now.toLocaleTimeString(),
    day: now.toLocaleDateString("en-US", { weekday: "long" })
  });

  localStorage.setItem("attendanceRecords", JSON.stringify(attendanceRecords));

  teacherInput.value = "";
  render();
  show("Attendance marked", "green");
}

function render() {
  tableBody.innerHTML = "";
  let i = 1;

  Object.entries(attendanceRecords).forEach(([date, list]) => {
    list.forEach(r => {
      tableBody.innerHTML += `
        <tr>
          <td>${i++}</td>
          <td>${r.name}</td>
          <td>${r.status}</td>
          <td>${date}</td>
          <td>${r.time}</td>
          <td>${r.day}</td>
        </tr>`;
    });
  });
  summary();
}

function summary() {
  const today = new Date().toLocaleDateString();
  const todayList = attendanceRecords[today] || [];

  totalTeachers.textContent = teachers.length;
  presentToday.textContent = todayList.length;
  absentToday.textContent = teachers.length - todayList.length;

  absentList.innerHTML = "";
  teachers
    .filter(t => !todayList.some(r => r.name === t))
    .forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      absentList.appendChild(li);
    });
}

filterBtn.onclick = () => {
  const d = new Date(dateFilter.value).toLocaleDateString();
  if (!attendanceRecords[d]) return;

  tableBody.innerHTML = "";
  attendanceRecords[d].forEach((r, i) => {
    tableBody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${r.name}</td>
        <td>${r.status}</td>
        <td>${d}</td>
        <td>${r.time}</td>
        <td>${r.day}</td>
      </tr>`;
  });
};

resetBtn.onclick = render;

searchBtn.onclick = () => {
  const q = searchName.value.toLowerCase();
  tableBody.innerHTML = "";
  let i = 1;

  Object.entries(attendanceRecords).forEach(([d, list]) => {
    list.forEach(r => {
      if (r.name.toLowerCase().includes(q)) {
        tableBody.innerHTML += `
          <tr>
            <td>${i++}</td>
            <td>${r.name}</td>
            <td>${r.status}</td>
            <td>${d}</td>
            <td>${r.time}</td>
            <td>${r.day}</td>
          </tr>`;
      }
    });
  });
};

addTeacherBtn.onclick = () => (addTeacherModal.style.display = "flex");
cancelTeacherBtn.onclick = () => (addTeacherModal.style.display = "none");

saveTeacherBtn.onclick = () => {
  const n = newTeacherName.value.trim();
  if (!n) return;

  const exists = teachers.some(t => t.toLowerCase() === n.toLowerCase());

  if (!exists) {
    teachers.push(n);
    localStorage.setItem("teachers", JSON.stringify(teachers));
    render();
  }

  addTeacherModal.style.display = "none";
};

const ADMIN_USER = "admin";
const ADMIN_PASS = "12345";

openAdminBtn.onclick = () => {
  sessionStorage.getItem("isAdmin") ? openAdmin() : (adminLoginModal.style.display = "flex");
};

adminLoginBtn.onclick = () => {
  if (adminUsername.value === ADMIN_USER && adminPassword.value === ADMIN_PASS) {
    sessionStorage.setItem("isAdmin", true);
    adminLoginModal.style.display = "none";
    openAdmin();
  } else adminLoginMsg.textContent = "Invalid login";
};

cancelAdminLoginBtn.onclick = () => adminLoginModal.style.display = "none";

function openAdmin() {
  adminModal.style.display = "flex";
  renderAdmin();
}

closeAdminBtn.onclick = () => {
  adminModal.style.display = "none";
  sessionStorage.removeItem("isAdmin");
};

function renderAdmin() {
  adminTableBody.innerHTML = "";
  let i = 1;

  Object.entries(attendanceRecords).forEach(([d, list]) => {
    list.forEach(r => {
      adminTableBody.innerHTML += `
        <tr>
          <td>${i++}</td>
          <td>${r.name}</td>
          <td>${r.status}</td>
          <td>${d}</td>
          <td>${r.time}</td>
          <td>${r.day}</td>
        </tr>`;
    });
  });
}

adminFilterBtn.onclick = () => {
  const q = adminSearchName.value.toLowerCase();
  const d = adminDateFilter.value ? new Date(adminDateFilter.value).toLocaleDateString() : null;

  adminTableBody.innerHTML = "";
  let i = 1;

  Object.entries(attendanceRecords).forEach(([date, list]) => {
    if (d && date !== d) return;

    list.forEach(r => {
      if (q && !r.name.toLowerCase().includes(q)) return;

      adminTableBody.innerHTML += `
        <tr>
          <td>${i++}</td>
          <td>${r.name}</td>
          <td>${r.status}</td>
          <td>${date}</td>
          <td>${r.time}</td>
          <td>${r.day}</td>
        </tr>`;
    });
  });
};

adminResetBtn.onclick = renderAdmin;

adminExportBtn.onclick = () => {
  let csv = "Name,Status,Date,Time,Day\n";
  Object.entries(attendanceRecords).forEach(([d, list]) => {
    list.forEach(r => {
      csv += `${r.name},${r.status},${d},${r.time},${r.day}\n`;
    });
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "attendance.csv";
  a.click();
};

function show(text, color) {
  message.textContent = text;
  message.style.color = color;
  setTimeout(() => (message.textContent = ""), 3000);
}

setInterval(() => {
  liveClock.textContent = new Date().toLocaleString();
}, 1000);

render();
