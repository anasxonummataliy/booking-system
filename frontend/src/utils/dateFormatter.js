/**
 * Date and Time formatting utility for Uzbek (uz) and English (en)
 * Solves browser ICU locale fallback issues (e.g. "2026 M09 29")
 * Provides clean, natural, human-friendly date & time representations.
 */

export const UZ_MONTHS_FULL = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

export const UZ_MONTHS_LOWER = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
];

export const EN_MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const EN_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const UZ_DAYS_FULL = [
  'Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'
];

export const EN_DAYS_FULL = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

/**
 * Format a Date object or ISO string to a clean 24-hour time string: "09:00", "14:30"
 */
export function formatTime(dateInput) {
  if (!dateInput) return '';
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format time slot strings ensuring 24-hour format: e.g. "09:00 AM" -> "09:00", "02:30 PM" -> "14:30"
 */
export function formatSlotTime(timeStr) {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (trimmed.includes('AM') || trimmed.includes('PM') || trimmed.includes('am') || trimmed.includes('pm')) {
    const parts = trimmed.split(' ');
    const timeParts = parts[0].split(':');
    let h = parseInt(timeParts[0], 10);
    const m = timeParts[1];
    const modifier = parts[1].toUpperCase();
    if (modifier === 'PM' && h < 12) h += 12;
    if (modifier === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  }
  if (trimmed.includes('T')) {
    const d = new Date(trimmed);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return trimmed;
}

/**
 * Format date for appointment cards, history, tables:
 * uz: "29-sentabr, 2026 • 10:00"
 * en: "Sep 29, 2026 • 10:00 AM"
 */
export function formatDateTime(dateInput, lang = 'uz') {
  if (!dateInput) return '';
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const day = d.getDate();
  const monthIdx = d.getMonth();
  const year = d.getFullYear();
  const timeStr = formatTime(d, lang);

  if (lang === 'uz') {
    const monthName = UZ_MONTHS_LOWER[monthIdx];
    return `${day}-${monthName}, ${year} • ${timeStr}`;
  }

  const monthShort = EN_MONTHS_SHORT[monthIdx];
  return `${monthShort} ${day}, ${year} • ${timeStr}`;
}

/**
 * Format date only:
 * uz: "29-sentabr, 2026"
 * en: "Sep 29, 2026"
 */
export function formatDateOnly(dateInput, lang = 'uz') {
  if (!dateInput) return '';
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const day = d.getDate();
  const monthIdx = d.getMonth();
  const year = d.getFullYear();

  if (lang === 'uz') {
    const monthName = UZ_MONTHS_LOWER[monthIdx];
    return `${day}-${monthName}, ${year}`;
  }

  const monthShort = EN_MONTHS_SHORT[monthIdx];
  return `${monthShort} ${day}, ${year}`;
}

/**
 * Format short day and month:
 * uz: "29-sentabr"
 * en: "Sep 29"
 */
export function formatDayMonth(dateInput, lang = 'uz') {
  if (!dateInput) return '';
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const day = d.getDate();
  const monthIdx = d.getMonth();

  if (lang === 'uz') {
    const monthName = UZ_MONTHS_LOWER[monthIdx];
    return `${day}-${monthName}`;
  }

  const monthShort = EN_MONTHS_SHORT[monthIdx];
  return `${monthShort} ${day}`;
}

/**
 * Month & Year header for calendars:
 * uz: "Sentabr 2026"
 * en: "September 2026"
 */
export function formatMonthYear(dateInput, lang = 'uz') {
  if (!dateInput) return '';
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const monthIdx = d.getMonth();
  const year = d.getFullYear();

  if (lang === 'uz') {
    return `${UZ_MONTHS_FULL[monthIdx]} ${year}`;
  }

  return `${EN_MONTHS_FULL[monthIdx]} ${year}`;
}

/**
 * Full date with Day of Week for Confirmation modals:
 * uz: "Seshanba, 29-sentabr, 2026"
 * en: "Tuesday, September 29, 2026"
 */
export function formatFullDateWithDay(dateInput, lang = 'uz') {
  if (!dateInput) return '';
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const dayOfWeek = d.getDay();
  const day = d.getDate();
  const monthIdx = d.getMonth();
  const year = d.getFullYear();

  if (lang === 'uz') {
    const dayName = UZ_DAYS_FULL[dayOfWeek];
    const monthName = UZ_MONTHS_LOWER[monthIdx];
    return `${dayName}, ${day}-${monthName}, ${year}`;
  }

  const dayName = EN_DAYS_FULL[dayOfWeek];
  const monthName = EN_MONTHS_FULL[monthIdx];
  return `${dayName}, ${monthName} ${day}, ${year}`;
}
