// Lógica del Diario de Estudio: funciones puras, sin DOM ni localStorage.
// Las que dependen del día reciben "hoy" (today, "AAAA-MM-DD") como parámetro,
// así los tests pueden fijar la fecha y dar siempre el mismo resultado.

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

// ---------- Racha ----------
// Días consecutivos con al menos una sesión que terminan hoy.
// Si hoy aún no hay sesión pero ayer sí, la racha sigue viva y se cuenta desde ayer.
function calculateStreak(sessions, today) {
  // Un Set elimina duplicados: varias sesiones el mismo día cuentan una vez.
  const studiedDays = new Set(sessions.map(function (session) {
    return session.date;
  }));

  const day = fromDateKey(today);
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
function calculateBestStreak(sessions, today) {
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
function calculateWeekMinutes(sessions, today) {
  const monday = fromDateKey(today);
  // getDay() da 0 para el domingo y 1 para el lunes: así contamos los días desde el lunes.
  const daysSinceMonday = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - daysSinceMonday);

  const mondayKey = toDateKey(monday);

  let total = 0;
  sessions.forEach(function (session) {
    // Las fechas "AAAA-MM-DD" se pueden comparar como texto.
    if (session.date >= mondayKey && session.date <= today) {
      total += Number(session.minutes) || 0;
    }
  });
  return total;
}

// Permite usar estas funciones en los tests con Node (node --test).
// En el navegador `module` no existe y este bloque se ignora.
if (typeof module !== "undefined") {
  module.exports = {
    toDateKey: toDateKey,
    fromDateKey: fromDateKey,
    calculateStreak: calculateStreak,
    calculateBestStreak: calculateBestStreak,
    calculateWeekMinutes: calculateWeekMinutes
  };
}
