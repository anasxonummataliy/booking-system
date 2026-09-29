/**
 * Utility to localize backend and network error messages into user-selected language.
 *
 * @param {Error|string|any} err - The error object or string
 * @param {string} lang - 'uz' or 'en'
 * @returns {string} User-friendly localized error message
 */
export function formatErrorMessage(err, lang = 'uz') {
  if (!err) return '';

  let message = '';
  let status = null;

  if (typeof err === 'string') {
    message = err;
  } else if (err instanceof Error || typeof err === 'object') {
    message = err.message || '';
    status = err.status || err.data?.status || null;
    if (err.data?.detail && typeof err.data.detail === 'string') {
      message = err.data.detail;
    }
  }

  // If the backend sent a dual-language message formatted as "Uzbek / English"
  if (message.includes(' / ')) {
    const parts = message.split(' / ');
    if (lang === 'uz') {
      return parts[0].trim();
    } else {
      return parts[1]?.trim() || parts[0].trim();
    }
  }

  const msgLower = message.toLowerCase();

  if (lang === 'uz') {
    // 1. Network & Offline Errors
    if (
      msgLower.includes('failed to fetch') ||
      msgLower.includes('network') ||
      msgLower.includes('load failed') ||
      status === 0
    ) {
      return "Internet yoki server bilan aloqa uzildi. Iltimos, ulanishni tekshiring.";
    }

    // 2. Generic Unexpected Error
    if (
      msgLower.includes('an unexpected error occurred') ||
      msgLower.includes('unexpected error')
    ) {
      return "Kutilmagan xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.";
    }

    // 3. Auth & Credentials
    if (
      msgLower.includes('incorrect email or password') ||
      msgLower.includes('invalid credentials') ||
      status === 401
    ) {
      return "Email manzili yoki parol noto‘g‘ri kiritildi.";
    }
    if (
      msgLower.includes('already exists') ||
      msgLower.includes('user with this email')
    ) {
      return "Ushbu email manziliga ega foydalanuvchi allaqachon ro‘yxatdan o‘tgan.";
    }
    if (msgLower.includes('deactivated')) {
      return "Ushbu hisob faolsizlantirilgan. Administratorga murojaat qiling.";
    }
    if (msgLower.includes('authentication failed')) {
      return "Tizimga kirishda xatolik yuz berdi. Ma'lumotlarni tekshiring.";
    }
    if (msgLower.includes('demo login failed')) {
      return "Demo hisobga kirishda xatolik yuz berdi.";
    }

    // 4. Password Changes
    if (msgLower.includes("joriy parol noto'g'ri") || msgLower.includes("current password")) {
      return "Joriy parol noto‘g‘ri kiritildi.";
    }
    if (msgLower.includes("kamida 6 ta") || msgLower.includes("at least 6")) {
      return "Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak.";
    }

    // 5. Booking & Race Conditions
    if (
      msgLower.includes('no longer available') ||
      msgLower.includes('already booked') ||
      status === 409
    ) {
      return "Tanlangan vaqt band qilingan. Boshqa bemor hozirgina ushbu vaqtni band qildi. Iltimos, boshqa vaqtni tanlang.";
    }
    if (msgLower.includes('cannot book appointments') || msgLower.includes('adminlar qabullarni')) {
      return "Administrator hisobidan qabulga yozilish mumkin emas. Buyurtmalarni boshqarish uchun Admin paneldan foydalaning.";
    }
    if (msgLower.includes('cannot cancel an already completed') || msgLower.includes('yakunlangan qabulni bekor')) {
      return "Yakunlangan qabulni bekor qilib bo‘lmaydi.";
    }
    if (msgLower.includes('failed to cancel booking')) {
      return "Qabulni bekor qilishda xatolik yuz berdi.";
    }
    if (msgLower.includes('failed to complete appointment reservation')) {
      return "Qabulga yozilishda xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.";
    }

    // 6. Admin Actions
    if (msgLower.includes('failed to save doctor')) {
      return "Shifokor ma'lumotlarini saqlashda xatolik yuz berdi.";
    }
    if (msgLower.includes('failed to save service')) {
      return "Xizmat ma'lumotlarini saqlashda xatolik yuz berdi.";
    }
    if (msgLower.includes('failed to save schedule')) {
      return "Ish jadvalini saqlashda xatolik yuz berdi.";
    }
    if (msgLower.includes('failed to delete')) {
      return "O‘chirishda xatolik yuz berdi.";
    }

    // 7. General HTTP status codes
    if (status === 403) {
      return "Sizda ushbu amalni bajarish uchun ruxsat yo‘q.";
    }
    if (status === 404) {
      return "So‘ralgan ma'lumot topilmadi.";
    }
    if (status >= 500) {
      return "Serverda ichki xatolik yuz berdi. Iltimos, birozdan so‘ng qayta urinib ko‘ring.";
    }

    return message;
  }

  // English localization
  if (
    msgLower.includes('failed to fetch') ||
    msgLower.includes('network') ||
    status === 0
  ) {
    return "Could not connect to the server. Please check your internet connection.";
  }
  if (
    msgLower.includes('an unexpected error occurred')
  ) {
    return "An unexpected error occurred. Please try again.";
  }
  if (status === 401) {
    return "Incorrect email or password.";
  }
  if (status === 409) {
    return "Selected slot is no longer available. Please choose another time.";
  }
  if (status >= 500) {
    return "Server error occurred. Please try again later.";
  }

  return message;
}
