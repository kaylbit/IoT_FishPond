// ═══════════════════════════════════════
// AquaWatch Frontend Script
// ═══════════════════════════════════════

const API_URL = "http://localhost:5000/data";

// ──────────────────────────────────────
// FETCH DATA FROM BACKEND
// ──────────────────────────────────────
async function fetchData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // Update sensor values
    updateSensorUI(data);

    // Update status colors
    updateStatusUI(data.status);

    // Notifications 🔔
    updateNotifications(data.alerts);

  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

// ──────────────────────────────────────
// UPDATE SENSOR VALUES
// ──────────────────────────────────────
function updateSensorUI(data) {
  // Water Quality Cards
  document.getElementById("val-ph").textContent = data.ph;
  document.getElementById("val-temp").textContent = data.temperature;
  document.getElementById("val-turb").textContent = data.turbidity;
  document.getElementById("val-wl").textContent = data.waterlevel;

  // Hero Stats
  document.getElementById("heroStatPh").textContent = data.ph;
  document.getElementById("heroStatTemp").textContent = data.temperature + "°";

  // Overall status
  const overall = getOverallStatus(data.status);
  document.getElementById("heroStatStatus").textContent = overall.toUpperCase();
}

// ──────────────────────────────────────
// DETERMINE OVERALL STATUS
// ──────────────────────────────────────
function getOverallStatus(status) {
  if (Object.values(status).includes("danger")) return "danger";
  if (Object.values(status).includes("warning")) return "warning";
  return "safe";
}

// ──────────────────────────────────────
// UPDATE STATUS COLORS (CARDS)
// ──────────────────────────────────────
function updateStatusUI(status) {
  for (let key in status) {
    const pill = document.getElementById(`pill-${key}`);
    const card = document.getElementById(`card-${key}`);

    if (!pill || !card) continue;

    // Reset
    pill.className = "wq-pill";
    card.classList.remove("state-warn", "state-danger");

    if (status[key] === "safe") {
      pill.classList.add("safe");
      pill.textContent = "Safe";
    }

    if (status[key] === "warning") {
      pill.classList.add("warn");
      pill.textContent = "Warning";
      card.classList.add("state-warn");
    }

    if (status[key] === "danger") {
      pill.classList.add("danger");
      pill.textContent = "Danger";
      card.classList.add("state-danger");
    }
  }
}

// ──────────────────────────────────────
// NOTIFICATION SYSTEM 🔔
// ──────────────────────────────────────
function updateNotifications(alerts) {
  const list = document.getElementById("notifList");
  const badge = document.getElementById("bellBadge");
  const bellBtn = document.getElementById("notifBtn");

  list.innerHTML = "";

  if (!alerts || alerts.length === 0) {
    list.innerHTML = `<li class="np-empty">All systems are running normally.</li>`;
    badge.hidden = true;
    bellBtn.classList.remove("ringing");
    return;
  }

  // Show badge count
  badge.hidden = false;
  badge.textContent = alerts.length;

  // Make bell ring if danger exists
  if (alerts.some(a => a.toLowerCase().includes("danger"))) {
    bellBtn.classList.add("ringing");
  } else {
    bellBtn.classList.remove("ringing");
  }

  alerts.forEach(alert => {
    const li = document.createElement("li");

    // Determine level
    let level = "lv-info";
    if (alert.toLowerCase().includes("danger")) level = "lv-danger";
    else if (alert.toLowerCase().includes("low") || alert.toLowerCase().includes("off"))
      level = "lv-warn";

    li.className = `np-item ${level}`;

    li.innerHTML = `
      <div class="np-item-icon">⚠️</div>
      <div class="np-item-body">
        <div class="np-item-title">Alert</div>
        <div class="np-item-desc">${alert}</div>
        <div class="np-item-ts">${new Date().toLocaleTimeString()}</div>
      </div>
    `;

    list.appendChild(li);
  });
}

// ──────────────────────────────────────
// NOTIFICATION PANEL TOGGLE
// ──────────────────────────────────────
const notifBtn = document.getElementById("notifBtn");
const notifPanel = document.getElementById("notifPanel");

notifBtn.addEventListener("click", () => {
  notifPanel.classList.toggle("open");
});

// Clear notifications
document.getElementById("notifClear").addEventListener("click", () => {
  document.getElementById("notifList").innerHTML =
    `<li class="np-empty">All systems are running normally.</li>`;
  document.getElementById("bellBadge").hidden = true;
});

// ──────────────────────────────────────
// CLOCK (HEADER)
// ──────────────────────────────────────
function updateClock() {
  const now = new Date();
  document.getElementById("sysTime").textContent =
    now.toLocaleTimeString();
}

setInterval(updateClock, 1000);
updateClock();

// ──────────────────────────────────────
// CAMERA TIMESTAMP
// ──────────────────────────────────────
function updateCameraTime() {
  const now = new Date();
  document.getElementById("camTimestamp").textContent =
    now.toLocaleTimeString();
}

setInterval(updateCameraTime, 1000);

// ──────────────────────────────────────
// AUTO REFRESH DATA
// ──────────────────────────────────────
setInterval(fetchData, 3000);
fetchData();