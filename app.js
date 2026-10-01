// Interfaz y datos del Diario de Estudio. Los cálculos están en logic.js,
// que se carga antes que este archivo (ver index.html).
const STORAGE_KEY = "diario-estudio-sesiones";

// Fecha de hoy en hora local, "AAAA-MM-DD". Se pasa a las funciones de logic.js.
function todayKey() {
  return toDateKey(new Date());
}

// ---------- Datos ----------

function loadSessions() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

// ---------- Interfaz ----------

const form = document.getElementById("session-form");
const dateInput = document.getElementById("date");
const topicInput = document.getElementById("topic");
const minutesInput = document.getElementById("minutes");
const streakNumber = document.getElementById("streak-number");
const streakLabel = document.getElementById("streak-label");
const bestStreakNumber = document.getElementById("best-streak-number");
const bestStreakLabel = document.getElementById("best-streak-label");
const weekMinutesNumber = document.getElementById("week-minutes-number");
const heatMap = document.getElementById("heatmap");
const sessionList = document.getElementById("session-list");
const emptyMessage = document.getElementById("empty-message");

function formatDate(dateKey) {
  return fromDateKey(dateKey).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function renderStreak(sessions, today) {
  const streak = calculateStreak(sessions, today);
  streakNumber.textContent = streak;
  streakLabel.textContent = streak === 1 ? "día seguido" : "días seguidos";
}

function renderBestStreak(sessions, today) {
  const best = calculateBestStreak(sessions, today);
  bestStreakNumber.textContent = best;
  bestStreakLabel.textContent = best === 1 ? "día" : "días";
}

function renderWeekMinutes(sessions, today) {
  weekMinutesNumber.textContent = calculateWeekMinutes(sessions, today);
}

// Una casilla por día de las últimas 12 semanas. El CSS las coloca en columnas
// de lunes a domingo; el texto (fecha y minutos) lo leen los lectores de pantalla
// y aparece al pasar el ratón.
function renderHeatMap(sessions, today) {
  heatMap.innerHTML = "";
  buildHeatMap(sessions, today).forEach(function (day) {
    const cell = document.createElement("span");
    cell.className = "heat-cell level-" + day.level;
    cell.setAttribute("role", "img");
    const label = formatDate(day.date) + ": " + day.minutes + " min";
    cell.setAttribute("aria-label", label);
    cell.title = label;
    heatMap.append(cell);
  });
}

function renderSessions(sessions) {
  sessionList.innerHTML = "";
  emptyMessage.hidden = sessions.length > 0;

  // Las más recientes primero. Las fechas "AAAA-MM-DD" se pueden comparar como texto.
  // String(... || "") evita que una sesión guardada sin fecha rompa la lista.
  const sorted = sessions.slice().sort(function (a, b) {
    return String(b.date || "").localeCompare(String(a.date || ""));
  });

  sorted.forEach(function (session) {
    const item = document.createElement("li");
    item.className = "session";

    // La fecha va primero: en pantallas anchas se escribe en el margen.
    const date = document.createElement("span");
    date.className = "session-date";
    // Si la fecha guardada no es válida, se avisa en su lugar y la sesión no se borra.
    date.textContent = isValidDateKey(session.date) ? formatDate(session.date) : "Fecha no válida";

    const topic = document.createElement("span");
    topic.className = "session-topic";
    topic.textContent = session.topic;

    const minutes = document.createElement("span");
    minutes.className = "session-minutes";
    minutes.textContent = session.minutes + " min";

    item.append(date, topic, minutes);
    sessionList.append(item);
  });
}

function render() {
  const sessions = loadSessions();
  const today = todayKey();
  renderStreak(sessions, today);
  renderBestStreak(sessions, today);
  renderWeekMinutes(sessions, today);
  renderHeatMap(sessions, today);
  renderSessions(sessions);
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const topic = topicInput.value.trim();
  const minutes = Number(minutesInput.value);
  if (!dateInput.value || !topic || minutes < 1) {
    return;
  }

  const sessions = loadSessions();
  sessions.push({ date: dateInput.value, topic: topic, minutes: minutes });
  saveSessions(sessions);

  // Dejamos la fecha puesta por si se registran varias sesiones del mismo día.
  topicInput.value = "";
  minutesInput.value = "";
  topicInput.focus();

  render();
});

dateInput.value = todayKey();
render();
