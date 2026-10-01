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

// ¿Es un texto "AAAA-MM-DD" que corresponde a un día real?
// Si el día no existe (p. ej. "2026-02-30"), Date lo mueve a otro día
// y al volver a convertirlo ya no coincide con el original.
function isValidDateKey(dateKey) {
  if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return false;
  }
  return toDateKey(fromDateKey(dateKey)) === dateKey;
}

// ---------- Minutos ----------

// Minutos de una sesión como número: el texto "45" vale 45 y cualquier valor
// que no sea un número mayor que 0 (vacío, texto, 0, negativo) vale 0.
function validMinutes(value) {
  const minutes = Number(value);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 0;
}

// Nivel de intensidad del mapa de calor (0 a 4) según los minutos de un día.
function heatLevel(minutes) {
  if (minutes <= 0) {
    return 0;
  }
  if (minutes < 30) {
    return 1;
  }
  if (minutes < 60) {
    return 2;
  }
  if (minutes < 120) {
    return 3;
  }
  return 4;
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

// ---------- Semanas ----------
// Las semanas van de lunes a domingo.

// Devuelve el lunes ("AAAA-MM-DD") de la semana a la que pertenece el día indicado.
function startOfWeek(dateKey) {
  const monday = fromDateKey(dateKey);
  // getDay() da 0 para el domingo y 1 para el lunes: así contamos los días desde el lunes.
  const daysSinceMonday = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - daysSinceMonday);
  return toDateKey(monday);
}

// ---------- Minutos de la semana ----------
// Suma los minutos desde el lunes de esta semana hasta hoy (fecha local).
// Las sesiones con fecha futura no suman.
function calculateWeekMinutes(sessions, today) {
  const mondayKey = startOfWeek(today);

  let total = 0;
  sessions.forEach(function (session) {
    // Las fechas "AAAA-MM-DD" se pueden comparar como texto.
    if (session.date >= mondayKey && session.date <= today) {
      total += Number(session.minutes) || 0;
    }
  });
  return total;
}

// ---------- Mapa de calor ----------
// Días de las últimas 12 semanas (la actual y las 11 anteriores), del lunes
// más antiguo hasta hoy. Cada día: { date, minutes, level }.
const HEAT_MAP_WEEKS = 12;

function buildHeatMap(sessions, today) {
  const firstDay = fromDateKey(startOfWeek(today));
  firstDay.setDate(firstDay.getDate() - (HEAT_MAP_WEEKS - 1) * 7);
  const firstDayKey = toDateKey(firstDay);

  // Minutos de cada día del rango. Se ignoran las fechas inválidas,
  // las futuras y las anteriores al rango.
  const minutesByDay = {};
  sessions.forEach(function (session) {
    const date = session.date;
    if (!isValidDateKey(date) || date < firstDayKey || date > today) {
      return;
    }
    minutesByDay[date] = (minutesByDay[date] || 0) + validMinutes(session.minutes);
  });

  // Recorremos día a día con setDate: así el cambio de hora no salta ni repite días.
  const days = [];
  const day = firstDay;
  while (toDateKey(day) <= today) {
    const dateKey = toDateKey(day);
    const minutes = minutesByDay[dateKey] || 0;
    days.push({ date: dateKey, minutes: minutes, level: heatLevel(minutes) });
    day.setDate(day.getDate() + 1);
  }
  return days;
}

// Permite usar estas funciones en los tests con Node (node --test).
// En el navegador `module` no existe y este bloque se ignora.
if (typeof module !== "undefined") {
  module.exports = {
    toDateKey: toDateKey,
    fromDateKey: fromDateKey,
    isValidDateKey: isValidDateKey,
    validMinutes: validMinutes,
    heatLevel: heatLevel,
    startOfWeek: startOfWeek,
    buildHeatMap: buildHeatMap,
    calculateStreak: calculateStreak,
    calculateBestStreak: calculateBestStreak,
    calculateWeekMinutes: calculateWeekMinutes
  };
}
