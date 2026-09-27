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
 * Format a Date object or ISO string to a clean time string: "10:00" or "10:00 AM"
 */
export function formatTime(dateInput, lang = 'uz') {
  if (!dateInput) return '';
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');

  if (lang === 'en') {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  }

  // Uzbek 24-hour standard: "10:00", "14:30"
  const h24 = String(hours).padStart(2, '0');
  return `${h24}:${minutes}`;
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
