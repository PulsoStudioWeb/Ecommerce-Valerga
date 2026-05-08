// Días en el mismo orden que getDay() de JavaScript
// 0 = domingo, 1 = lunes, ..., 6 = sábado
const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// Convierte "08:30" a minutos desde medianoche para comparar fácil
function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// Devuelve los minutos actuales dentro del día
function getCurrentMinutes(date) {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Determina si el local está abierto en este momento
 * @param {object} businessHours - viene de store_config.business_hours
 * @param {Date} now - fecha/hora actual (útil para testear)
 * @returns {{ isOpen: boolean, currentSlot: string|null }}
 */
export function isStoreOpen(businessHours, now = new Date()) {
  const dayKey = DAY_KEYS[now.getDay()];
  const todayHours = businessHours[dayKey];

  // Día cerrado (ej: domingo = null)
  if (!todayHours) {
    return { isOpen: false, currentSlot: null };
  }

  const currentMinutes = getCurrentMinutes(now);

  const openMorning = timeToMinutes(todayHours.open);
  const closeMorning = timeToMinutes(todayHours.close_noon);
  const openAfternoon = timeToMinutes(todayHours.open_afternoon);
  const closeAfternoon = timeToMinutes(todayHours.close);

  // Turno mañana
  if (
    openMorning !== null &&
    closeMorning !== null &&
    currentMinutes >= openMorning &&
    currentMinutes < closeMorning
  ) {
    return { isOpen: true, currentSlot: "morning" };
  }

  // Turno tarde
  if (
    openAfternoon !== null &&
    closeAfternoon !== null &&
    currentMinutes >= openAfternoon &&
    currentMinutes < closeAfternoon
  ) {
    return { isOpen: true, currentSlot: "afternoon" };
  }

  return { isOpen: false, currentSlot: null };
}

/**
 * Devuelve un mensaje legible de cuándo abre próximamente
 * @param {object} businessHours
 * @param {Date} now
 * @returns {string}
 */
export function getNextOpeningMessage(businessHours, now = new Date()) {
  const dayKey = DAY_KEYS[now.getDay()];
  const todayHours = businessHours[dayKey];
  const currentMinutes = getCurrentMinutes(now);

  // Si hoy tiene turno tarde y todavía no llegó
  if (todayHours?.open_afternoon) {
    const openAfternoon = timeToMinutes(todayHours.open_afternoon);
    if (currentMinutes < openAfternoon) {
      return `Volvemos hoy a las ${todayHours.open_afternoon}hs`;
    }
  }

  // Si hoy tiene turno mañana y todavía no llegó
  if (todayHours?.open) {
    const openMorning = timeToMinutes(todayHours.open);
    if (currentMinutes < openMorning) {
      return `Abrimos hoy a las ${todayHours.open}hs`;
    }
  }

  // Buscar el próximo día con horario
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (now.getDay() + i) % 7;
    const nextDayKey = DAY_KEYS[nextDayIndex];
    const nextDayHours = businessHours[nextDayKey];

    if (nextDayHours?.open) {
      const dayName = getDayNameInSpanish(nextDayKey, i);
      return `Abrimos ${dayName} a las ${nextDayHours.open}hs`;
    }
  }

  return "Consultar horarios";
}

/**
 * Devuelve nombre del día en español según cuántos días faltan
 */
function getDayNameInSpanish(dayKey, daysFromNow) {
  if (daysFromNow === 1) return "mañana";

  const names = {
    monday: "el lunes",
    tuesday: "el martes",
    wednesday: "el miércoles",
    thursday: "el jueves",
    friday: "el viernes",
    saturday: "el sábado",
    sunday: "el domingo",
  };

  return names[dayKey] || "";
}

/**
 * Verifica si una fecha/hora está dentro del horario comercial
 * Útil para marcar pedidos que se hicieron fuera de horario
 * @param {object} businessHours
 * @param {Date} date
 * @returns {boolean}
 */
export function wasPlacedDuringBusinessHours(businessHours, date = new Date()) {
  const { isOpen } = isStoreOpen(businessHours, date);
  return isOpen;
}

/**
 * Devuelve los horarios del día actual formateados para mostrar en UI
 * @param {object} businessHours
 * @param {Date} now
 * @returns {string} ej: "8:30 a 12:30 y 17:00 a 21:00"
 */
export function getTodayHoursFormatted(businessHours, now = new Date()) {
  const dayKey = DAY_KEYS[now.getDay()];
  const todayHours = businessHours[dayKey];

  if (!todayHours) return "Hoy no abrimos";

  const { open, close_noon, open_afternoon, close } = todayHours;

  if (open && close_noon && open_afternoon && close) {
    return `${open} a ${close_noon}hs y ${open_afternoon} a ${close}hs`;
  }

  if (open && close_noon) {
    return `${open} a ${close_noon}hs`;
  }

  return "Consultar horarios";
}
