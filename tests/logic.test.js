// Tests de la lógica del Diario de Estudio. Se ejecutan con: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  toDateKey,
  fromDateKey,
  calculateStreak,
  calculateBestStreak,
  calculateWeekMinutes
} = require("../logic.js");

// "Hoy" fijo para que los tests den siempre el mismo resultado (jueves).
const TODAY = "2026-10-01";

function session(date, minutes) {
  return { date: date, topic: "Tema", minutes: minutes || 30 };
}

// ---------- Fechas ----------

test("toDateKey usa la fecha local y rellena con ceros", function () {
  assert.equal(toDateKey(new Date(2026, 0, 5)), "2026-01-05");
});

test("fromDateKey crea la medianoche local del día indicado", function () {
  const date = fromDateKey("2026-03-29");
  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 2);
  assert.equal(date.getDate(), 29);
  assert.equal(date.getHours(), 0);
});

// ---------- Racha ----------

test("racha: sin sesiones es 0", function () {
  assert.equal(calculateStreak([], TODAY), 0);
});

test("racha: hoy, ayer y anteayer son 3", function () {
  const sessions = [session("2026-10-01"), session("2026-09-30"), session("2026-09-29")];
  assert.equal(calculateStreak(sessions, TODAY), 3);
});

test("racha: si hoy no hay sesión pero ayer sí, sigue viva desde ayer", function () {
  const sessions = [session("2026-09-30"), session("2026-09-29")];
  assert.equal(calculateStreak(sessions, TODAY), 2);
});

test("racha: si la última sesión es de anteayer, la racha es 0", function () {
  assert.equal(calculateStreak([session("2026-09-29")], TODAY), 0);
});

test("racha: un hueco corta la racha", function () {
  const sessions = [session("2026-10-01"), session("2026-09-29")];
  assert.equal(calculateStreak(sessions, TODAY), 1);
});

test("racha: varias sesiones el mismo día cuentan como un día", function () {
  const sessions = [session("2026-10-01"), session("2026-10-01"), session("2026-09-30")];
  assert.equal(calculateStreak(sessions, TODAY), 2);
});

test("racha: las fechas futuras no suman", function () {
  const sessions = [session("2026-10-01"), session("2026-10-02"), session("2026-10-03")];
  assert.equal(calculateStreak(sessions, TODAY), 1);
});

test("racha: cruza el cambio de mes", function () {
  const sessions = [session("2026-10-01"), session("2026-09-30")];
  assert.equal(calculateStreak(sessions, TODAY), 2);
});

// ---------- Mejor racha ----------

test("mejor racha: sin sesiones es 0", function () {
  assert.equal(calculateBestStreak([], TODAY), 0);
});

test("mejor racha: solo fechas futuras es 0", function () {
  assert.equal(calculateBestStreak([session("2026-10-02")], TODAY), 0);
});

test("mejor racha: una racha antigua más larga que la actual", function () {
  const sessions = [
    session("2026-10-01"),
    session("2026-08-10"), session("2026-08-11"), session("2026-08-12"), session("2026-08-13")
  ];
  assert.equal(calculateBestStreak(sessions, TODAY), 4);
});

test("mejor racha: no depende del orden ni de los duplicados", function () {
  const sessions = [session("2026-09-30"), session("2026-10-01"), session("2026-09-29"), session("2026-09-30")];
  assert.equal(calculateBestStreak(sessions, TODAY), 3);
});

test("mejor racha: cruza el cambio de año", function () {
  const sessions = [session("2025-12-30"), session("2025-12-31"), session("2026-01-01")];
  assert.equal(calculateBestStreak(sessions, TODAY), 3);
});

test("mejor racha: cruza el 29 de febrero de un año bisiesto", function () {
  const sessions = [session("2024-02-28"), session("2024-02-29"), session("2024-03-01")];
  assert.equal(calculateBestStreak(sessions, TODAY), 3);
});

test("mejor racha: cruza el cambio de hora de marzo", function () {
  const sessions = [session("2026-03-28"), session("2026-03-29"), session("2026-03-30")];
  assert.equal(calculateBestStreak(sessions, TODAY), 3);
});

test("mejor racha: nunca es menor que la racha actual", function () {
  const sessions = [session("2026-10-01"), session("2026-09-30"), session("2026-09-20")];
  assert.ok(calculateBestStreak(sessions, TODAY) >= calculateStreak(sessions, TODAY));
});

// ---------- Minutos de la semana ----------

test("semana: sin sesiones es 0", function () {
  assert.equal(calculateWeekMinutes([], TODAY), 0);
});

test("semana: suma desde el lunes hasta hoy", function () {
  // Hoy es jueves 1 de octubre: la semana empieza el lunes 28 de septiembre.
  const sessions = [session("2026-09-28", 20), session("2026-09-30", 45), session("2026-10-01", 30)];
  assert.equal(calculateWeekMinutes(sessions, TODAY), 95);
});

test("semana: no suma el domingo anterior ni las fechas futuras", function () {
  const sessions = [session("2026-09-27", 60), session("2026-10-01", 30), session("2026-10-02", 90)];
  assert.equal(calculateWeekMinutes(sessions, TODAY), 30);
});

test("semana: si hoy es domingo, la semana empieza el lunes anterior", function () {
  const sessions = [session("2026-09-28", 10), session("2026-10-04", 15), session("2026-10-05", 50)];
  assert.equal(calculateWeekMinutes(sessions, "2026-10-04"), 25);
});

test("semana: cruza el cambio de año", function () {
  // Jueves 1 de enero de 2026: la semana empieza el lunes 29 de diciembre de 2025.
  const sessions = [session("2025-12-28", 99), session("2025-12-29", 10), session("2026-01-01", 5)];
  assert.equal(calculateWeekMinutes(sessions, "2026-01-01"), 15);
});
