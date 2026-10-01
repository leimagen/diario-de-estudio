// Tests del mapa de calor (spec 001-heat-map). Se ejecutan con: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isValidDateKey,
  validMinutes,
  heatLevel,
  startOfWeek,
  buildHeatMap
} = require("../logic.js");

// ---------- T1. Fechas y minutos válidos (RF-12, RF-13) ----------

test("isValidDateKey: acepta un día real con formato AAAA-MM-DD", function () {
  assert.equal(isValidDateKey("2026-10-01"), true);
});

test("isValidDateKey: acepta el 29 de febrero solo en años bisiestos", function () {
  assert.equal(isValidDateKey("2024-02-29"), true);
  assert.equal(isValidDateKey("2026-02-29"), false);
});

test("isValidDateKey: rechaza días que no existen", function () {
  assert.equal(isValidDateKey("2026-02-30"), false);
  assert.equal(isValidDateKey("2026-13-45"), false);
});

test("isValidDateKey: rechaza otros formatos y valores que no son texto", function () {
  assert.equal(isValidDateKey(""), false);
  assert.equal(isValidDateKey("1-10-2026"), false);
  assert.equal(isValidDateKey("2026-10-1"), false);
  assert.equal(isValidDateKey(undefined), false);
  assert.equal(isValidDateKey(null), false);
  assert.equal(isValidDateKey(123), false);
});

test("validMinutes: devuelve tal cual los números mayores que 0", function () {
  assert.equal(validMinutes(45), 45);
  assert.equal(validMinutes(12.5), 12.5);
});

test("validMinutes: convierte el texto numérico", function () {
  assert.equal(validMinutes("45"), 45);
});

test("validMinutes: devuelve 0 para valores no válidos", function () {
  assert.equal(validMinutes(""), 0);
  assert.equal(validMinutes("abc"), 0);
  assert.equal(validMinutes(0), 0);
  assert.equal(validMinutes(-30), 0);
  assert.equal(validMinutes(null), 0);
  assert.equal(validMinutes(undefined), 0);
  assert.equal(validMinutes(Infinity), 0);
});

// ---------- T2. Niveles de intensidad (RF-3) ----------

test("heatLevel: 0 min es nivel 0", function () {
  assert.equal(heatLevel(0), 0);
});

test("heatLevel: más de 0 y menos de 30 min es nivel 1", function () {
  assert.equal(heatLevel(0.5), 1);
  assert.equal(heatLevel(29), 1);
  assert.equal(heatLevel(29.5), 1);
});

test("heatLevel: de 30 a menos de 60 min es nivel 2", function () {
  assert.equal(heatLevel(30), 2);
  assert.equal(heatLevel(59), 2);
});

test("heatLevel: de 60 a menos de 120 min es nivel 3", function () {
  assert.equal(heatLevel(60), 3);
  assert.equal(heatLevel(119), 3);
});

test("heatLevel: 120 min o más es nivel 4", function () {
  assert.equal(heatLevel(120), 4);
  assert.equal(heatLevel(600), 4);
});

// ---------- T3. Lunes de la semana (RF-2) ----------

test("startOfWeek: un jueves devuelve el lunes de esa semana", function () {
  assert.equal(startOfWeek("2026-10-01"), "2026-09-28");
});

test("startOfWeek: un lunes se devuelve a sí mismo", function () {
  assert.equal(startOfWeek("2026-09-28"), "2026-09-28");
});

test("startOfWeek: un domingo devuelve el lunes anterior", function () {
  assert.equal(startOfWeek("2026-10-04"), "2026-09-28");
});

test("startOfWeek: cruza el cambio de año", function () {
  // Jueves 1 de enero de 2026: la semana empieza el lunes 29 de diciembre de 2025.
  assert.equal(startOfWeek("2026-01-01"), "2025-12-29");
});

// ---------- T4. Días del mapa (RF-2, RF-7 a RF-13) ----------

// "Hoy" fijo: jueves 1 de octubre de 2026. El mapa empieza el lunes 13 de julio
// (el lunes de esta semana, 28 de septiembre, menos 11 semanas).
const TODAY = "2026-10-01";
const FIRST_DAY = "2026-07-13";

function session(date, minutes) {
  return { date: date, topic: "Tema", minutes: minutes };
}

function findDay(days, date) {
  return days.find(function (day) {
    return day.date === date;
  });
}

function totalMinutes(days) {
  return days.reduce(function (sum, day) {
    return sum + day.minutes;
  }, 0);
}

// Día siguiente calculado en UTC, independiente de la hora local y del cambio de hora.
function nextDayUtc(dateKey) {
  const parts = dateKey.split("-").map(Number);
  const next = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + 1));
  const month = String(next.getUTCMonth() + 1).padStart(2, "0");
  const day = String(next.getUTCDate()).padStart(2, "0");
  return next.getUTCFullYear() + "-" + month + "-" + day;
}

test("buildHeatMap: si hoy es jueves hay 81 días, del lunes de hace 11 semanas a hoy", function () {
  const days = buildHeatMap([], TODAY);
  assert.equal(days.length, 81);
  assert.equal(days[0].date, FIRST_DAY);
  assert.equal(days[days.length - 1].date, TODAY);
});

test("buildHeatMap: si hoy es lunes hay 78 días y si es domingo, 84", function () {
  const monday = buildHeatMap([], "2026-09-28");
  assert.equal(monday.length, 78);
  assert.equal(monday[0].date, "2026-07-13");
  assert.equal(monday[monday.length - 1].date, "2026-09-28");

  const sunday = buildHeatMap([], "2026-10-04");
  assert.equal(sunday.length, 84);
  assert.equal(sunday[0].date, "2026-07-13");
  assert.equal(sunday[sunday.length - 1].date, "2026-10-04");
});

test("buildHeatMap: sin sesiones todos los días tienen 0 min y nivel 0", function () {
  const days = buildHeatMap([], TODAY);
  days.forEach(function (day) {
    assert.equal(day.minutes, 0);
    assert.equal(day.level, 0);
  });
});

test("buildHeatMap: suma las sesiones del mismo día", function () {
  const days = buildHeatMap([session("2026-09-30", 20), session("2026-09-30", 20)], TODAY);
  assert.deepEqual(findDay(days, "2026-09-30"), { date: "2026-09-30", minutes: 40, level: 2 });
});

test("buildHeatMap: cuenta el primer día del rango y hoy", function () {
  const days = buildHeatMap([session(FIRST_DAY, 10), session(TODAY, 120)], TODAY);
  assert.equal(findDay(days, FIRST_DAY).minutes, 10);
  assert.deepEqual(findDay(days, TODAY), { date: TODAY, minutes: 120, level: 4 });
});

test("buildHeatMap: no tiene en cuenta las fechas futuras", function () {
  const days = buildHeatMap([session("2026-10-02", 60), session("2026-12-25", 60)], TODAY);
  assert.equal(days.length, 81);
  assert.equal(totalMinutes(days), 0);
});

test("buildHeatMap: no tiene en cuenta las fechas anteriores al rango", function () {
  const days = buildHeatMap([session("2026-07-12", 60), session("2025-10-01", 60)], TODAY);
  assert.equal(totalMinutes(days), 0);
});

test("buildHeatMap: ignora fechas inválidas y cuenta 0 los minutos inválidos sin romperse", function () {
  const sessions = [
    { topic: "Sin fecha", minutes: 30 },
    session("", 30),
    session("2026-13-45", 30),
    session("2026-09-31", 30),
    session("2026-09-29", "abc"),
    session("2026-09-29", -15),
    session("2026-09-29", "45")
  ];
  const days = buildHeatMap(sessions, TODAY);
  assert.equal(days.length, 81);
  assert.equal(totalMinutes(days), 45);
  assert.deepEqual(findDay(days, "2026-09-29"), { date: "2026-09-29", minutes: 45, level: 2 });
});

test("buildHeatMap: cruza el cambio de hora de octubre sin repetir ni perder días", function () {
  // Hoy jueves 5 de noviembre de 2026: el rango incluye el 25 de octubre (cambio de hora en España).
  const days = buildHeatMap([session("2026-10-25", 30), session("2026-10-26", 30)], "2026-11-05");
  assert.equal(days.length, 81);
  for (let i = 1; i < days.length; i++) {
    assert.equal(days[i].date, nextDayUtc(days[i - 1].date));
  }
  assert.equal(findDay(days, "2026-10-25").minutes, 30);
  assert.equal(findDay(days, "2026-10-26").minutes, 30);
});
