const STORAGE_KEY = "diario-estudio-sesiones";

// ---------- Fechas ----------
// Siempre usamos la fecha LOCAL. Nunca toISOString() ni new Date("AAAA-MM-DD"),
// porque se interpretan en UTC y pueden mover la fecha un día.

// Convierte un Date en texto "AAAA-MM-DD" usando la fecha local.
function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// Convierte "AAAA-MM-DD" en un Date a medianoche en hora local.
function fromDateKey(dateKey) {
  const parts = dateKey.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

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

// ---------- Racha ----------
// Días consecutivos con al menos una sesión que terminan hoy.
// Si hoy aún no hay sesión pero ayer sí, la racha sigue viva y se cuenta desde ayer.
function calculateStreak(sessions) {
  // Un Set elimina duplicados: varias sesiones el mismo día cuentan una vez.
  const studiedDays = new Set(sessions.map(function (session) {
    return session.date;
  }));

  const day = fromDateKey(todayKey());
  if (!studiedDays.has(toDateKey(day))) {
    day.setDate(day.getDate() - 1);
  }

  // Contamos hacia atrás, así las fechas futuras nunca suman.
  let streak = 0;
  while (studiedDays.has(toDateKey(day))) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

// ---------- Mejor racha ----------
// La secuencia más larga de días consecutivos con sesión en todo el historial.
// Se calcula a partir de las sesiones (no se guarda). Las fechas futuras no suman.
function calculateBestStreak(sessions) {
  const today = todayKey();
  const studiedDays = new Set();
  sessions.forEach(function (session) {
    // Las fechas "AAAA-MM-DD" se pueden comparar como texto.
    if (session.date <= today) {
      studiedDays.add(session.date);
    }
  });

  // De más antiguo a más reciente.
  const sortedDays = Array.from(studiedDays).sort();

  let best = 0;
  let current = 0;
  let previousDay = null;
  sortedDays.forEach(function (dateKey) {
    // ¿Es este día justo el siguiente al anterior?
    let nextDayKey = null;
    if (previousDay) {
      const nextDay = fromDateKey(previousDay);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDayKey = toDateKey(nextDay);
    }

    current = dateKey === nextDayKey ? current + 1 : 1;
    best = Math.max(best, current);
    previousDay = dateKey;
  });
  return best;
}

// ---------- Minutos de la semana ----------
// Suma los minutos desde el lunes de esta semana hasta hoy (fecha local).
// Las sesiones con fecha futura no suman.
function calculateWeekMinutes(sessions) {
  const monday = fromDateKey(todayKey());
  // getDay() da 0 para el domingo y 1 para el lunes: así contamos los días desde el lunes.
  const daysSinceMonday = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - daysSinceMonday);

  const mondayKey = toDateKey(monday);
  const today = todayKey();

  let total = 0;
  sessions.forEach(function (session) {
    // Las fechas "AAAA-MM-DD" se pueden comparar como texto.
    if (session.date >= mondayKey && session.date <= today) {
      total += Number(session.minutes) || 0;
    }
  });
  return total;
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

function renderStreak(sessions) {
  const streak = calculateStreak(sessions);
  streakNumber.textContent = streak;
  streakLabel.textContent = streak === 1 ? "día seguido" : "días seguidos";
}

function renderBestStreak(sessions) {
  const best = calculateBestStreak(sessions);
  bestStreakNumber.textContent = best;
  bestStreakLabel.textContent = best === 1 ? "día" : "días";
}

function renderWeekMinutes(sessions) {
  weekMinutesNumber.textContent = calculateWeekMinutes(sessions);
}

function renderSessions(sessions) {
  sessionList.innerHTML = "";
  emptyMessage.hidden = sessions.length > 0;

  // Las más recientes primero. Las fechas "AAAA-MM-DD" se pueden comparar como texto.
  const sorted = sessions.slice().sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });

  sorted.forEach(function (session) {
    const item = document.createElement("li");
    item.className = "session";

    // La fecha va primero: en pantallas anchas se escribe en el margen.
    const date = document.createElement("span");
    date.className = "session-date";
    date.textContent = formatDate(session.date);

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
  renderStreak(sessions);
  renderBestStreak(sessions);
  renderWeekMinutes(sessions);
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
