# Spec 001 — Mapa de calor

Estado: implementada

## Contexto y objetivo
La racha solo cuenta días seguidos: no enseña la constancia de las últimas semanas ni cuánto se estudió cada día. Un mapa de calor tipo GitHub de las últimas 12 semanas permite ver de un vistazo qué días se estudió y con qué intensidad, y motiva a no dejar huecos.

## Usuarios
- La persona que usa el Diario de Estudio para registrar sus sesiones (un solo usuario, en su propio navegador).

## Historias de usuario
- HU-1. Como estudiante, quiero ver qué días de las últimas 12 semanas estudié para detectar huecos y mantener la constancia.
- HU-2. Como estudiante, quiero que el color de cada día sea más intenso cuantos más minutos estudié para distinguir los días flojos de los fuertes.
- HU-3. Como estudiante, quiero consultar con el ratón o con un lector de pantalla la fecha y los minutos exactos de un día del mapa para no tener que buscarlo en la lista de sesiones.

## Definiciones
- **Hoy**: la fecha local del usuario.
- **Semana**: de lunes a domingo, igual que en "minutos de esta semana".
- **Rango del mapa**: desde el lunes de hace 11 semanas hasta hoy, ambos incluidos (la semana actual más las 11 anteriores). Tiene entre 78 días (si hoy es lunes) y 84 días (si hoy es domingo).
- **Fecha válida**: texto con formato "AAAA-MM-DD" que corresponde a un día real del calendario (p. ej. "2026-02-30" no es válida).
- **Minutos válidos**: valor que, convertido a número, es un número finito mayor que 0. El texto "45" vale 45; los decimales se cuentan tal cual (12.5 vale 12.5). Cualquier otro valor (vacío, texto no numérico, 0 o negativo) vale 0.
- **Minutos de un día**: la suma de los minutos válidos de todas las sesiones con esa fecha.
- **Nivel de intensidad** de un día según sus minutos:
  - Nivel 0: 0 min.
  - Nivel 1: más de 0 y menos de 30 min.
  - Nivel 2: de 30 a menos de 60 min.
  - Nivel 3: de 60 a menos de 120 min.
  - Nivel 4: 120 min o más.

## Requisitos funcionales
- RF-1: EL SISTEMA muestra el mapa de calor en una sección propia, con título, justo después de la racha, la mejor racha y los minutos de la semana.
- RF-2: EL SISTEMA muestra una casilla por cada día del rango del mapa, organizadas en columnas de semanas (la más antigua a la izquierda y la actual a la derecha) y filas de días de la semana (lunes arriba, domingo abajo).
- RF-3: EL SISTEMA colorea cada casilla según el nivel de intensidad de sus minutos, con 5 colores en los que cada nivel es más oscuro (menor luminancia relativa) que el anterior, del nivel 0 al nivel 4.
- RF-4: EL SISTEMA muestra una leyenda "Menos … Más" con los 5 colores de nivel en orden, y cada color de la leyenda tiene como texto accesible su tramo de minutos ("0 min", "1-29 min", "30-59 min", "60-119 min", "120 min o más").
- RF-5: EL SISTEMA asigna a cada casilla un texto con su fecha y sus minutos (p. ej. "mié, 30 sept 2026: 45 min"; un día sin estudio dice "0 min"), que leen los lectores de pantalla y que aparece como información emergente al pasar el ratón.
- RF-14: EL SISTEMA da al mapa un nombre accesible ("Mapa de calor de las últimas 12 semanas"), que anuncian los lectores de pantalla antes de las casillas.
- RF-6: CUANDO el usuario guarda una sesión, EL SISTEMA actualiza el mapa sin recargar la página.
- RF-7: SI hay varias sesiones el mismo día, ENTONCES EL SISTEMA suma sus minutos y las muestra como una sola casilla.
- RF-8: SI una sesión tiene fecha posterior a hoy, ENTONCES EL SISTEMA no la tiene en cuenta en el mapa.
- RF-9: SI una sesión tiene fecha anterior al rango del mapa, ENTONCES EL SISTEMA no la tiene en cuenta en el mapa.
- RF-10: MIENTRAS la semana actual no ha terminado, EL SISTEMA no dibuja casilla para los días posteriores a hoy (el mapa termina en hoy).
- RF-11: SI no hay ninguna sesión en el rango, ENTONCES EL SISTEMA muestra el mapa completo con todas las casillas en nivel 0.
- RF-12: SI los minutos de una sesión no son minutos válidos, ENTONCES EL SISTEMA los cuenta como 0 en el mapa.
- RF-13: SI una sesión no tiene fecha válida, ENTONCES EL SISTEMA no la tiene en cuenta en el mapa y el resto del mapa y de la página siguen funcionando con normalidad (la sesión no se borra).

## Requisitos no funcionales
- En una pantalla de 375 px de ancho el mapa completo se ve sin scroll horizontal.
- El color no es la única forma de conocer los minutos de un día: el texto de RF-5 da el dato exacto.
- La casilla de nivel 0 tiene un contorno con contraste de al menos 3:1 frente al fondo de la página (criterio de contraste de elementos no textuales de WCAG).
- Textos en español. Sin emojis ni iconos decorativos.
- No cambia el formato de los datos guardados: las sesiones ya registradas se ven en el mapa.

## Casos límite
- Sin sesiones registradas: mapa completo en nivel 0 (RF-11).
- Hoy es lunes: la columna de la semana actual tiene una sola casilla.
- Hoy es domingo: la columna de la semana actual está completa.
- Rango que cruza un cambio de mes o de año.
- Rango que cruza el cambio de hora (marzo u octubre): ningún día se duplica ni se pierde.
- Un día con exactamente 29, 29.5, 30, 59, 60, 119 o 120 min (límites entre niveles), o con menos de 1 min (p. ej. 0.5 → nivel 1).
- Varias sesiones el mismo día que juntas cambian de nivel (p. ej. 20 + 20 = 40 → nivel 2).
- Sesiones con fecha futura o anterior al rango (RF-8, RF-9).
- Minutos guardados como texto numérico ("45" vale 45), vacíos, no numéricos, 0, negativos o con decimales (RF-12).
- Fechas vacías, sin campo de fecha, con otro formato o imposibles como "2026-13-45" (RF-13).

## Fuera de alcance
- Etiquetas de meses y de días de la semana en el mapa.
- Elegir el rango (siempre 12 semanas) o cambiar los tramos de intensidad.
- Hacer clic o tocar un día para ver su detalle, filtrar la lista o editar sesiones (en pantallas táctiles el detalle de un día no es consultable en esta versión).
- Actualizar el mapa al cambiar de día con la página abierta (pasada la medianoche): se actualiza al recargar o al guardar una sesión, igual que la racha.
- Animaciones del mapa.

## Criterios de finalización
- Todos los RF de lógica (niveles, minutos por día, rango, fechas futuras y antiguas, minutos y fechas inválidos) cubiertos por tests con `node --test` en verde.
- RF de interfaz (RF-1 a RF-6, RF-10, RF-13, RF-14) verificados en el navegador, incluida la vista móvil de 375 px, con la consola sin errores.
- Los tests que ya existían siguen en verde.

## Dudas abiertas
- Ninguna.
