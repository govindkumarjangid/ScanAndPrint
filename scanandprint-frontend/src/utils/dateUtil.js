

/**
 * Formats a date string, timestamp, or Date object with date and time.
 * Output example: "05 Sep 2026, 10:15 am" / "05 Sep 2026, 10:15"
 *
 * @param {string|number|Date|null|undefined} dateInput - The date value to format
 * @param {string} [fallback='—'] - Fallback text if date is missing or invalid
 * @param {Intl.DateTimeFormatOptions} [customOptions] - Optional custom Intl options
 * @returns {string} Formatted date & time string or fallback
 */
export function formatDateTime(dateInput, fallback = '—', customOptions = {}) {
  if (!dateInput) return fallback

  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
    if (isNaN(date.getTime())) return fallback

    const defaultOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...customOptions,
    }

    return date.toLocaleString('en-IN', defaultOptions)
  } catch {
    return fallback
  }
}

/**
 * Formats a date string, timestamp, or Date object with date only.
 * Output example: "05 Sep 2026"
 *
 * @param {string|number|Date|null|undefined} dateInput - The date value to format
 * @param {string} [fallback='—'] - Fallback text if date is missing or invalid
 * @param {Intl.DateTimeFormatOptions} [customOptions] - Optional custom Intl options
 * @returns {string} Formatted date string or fallback
 */
export function formatDate(dateInput, fallback = '—', customOptions = {}) {
  if (!dateInput) return fallback

  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
    if (isNaN(date.getTime())) return fallback

    const defaultOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...customOptions,
    }

    return date.toLocaleDateString('en-IN', defaultOptions)
  } catch {
    return fallback
  }
}

export default formatDateTime
