/**
 * Helper utility for handling dates, months, and formatting across GharKhata
 */

/**
 * Generates dynamic list of recent YYYY-MM months (e.g. 24 months back from current)
 */
export function getRecentMonthsList(count: number = 24): string[] {
  const months: string[] = [];
  const now = new Date();
  let currentYear = now.getFullYear();
  let currentMonth = now.getMonth() + 1; // 1-12

  // Force starting from 2026-09 if system date is in 2026-09, or current date
  for (let i = 0; i < count; i++) {
    const yyyy = currentYear;
    const mm = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
    months.push(`${yyyy}-${mm}`);

    currentMonth--;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
  }

  // Ensure 2026-09 is included at minimum
  if (!months.includes('2026-09')) {
    months.unshift('2026-09');
  }

  return months;
}

/**
 * Formats YYYY-MM string to human readable format (e.g. '2026-09' -> 'Sep 2026')
 */
export function formatMonthHuman(monthStr: string, full: boolean = false): string {
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [yearStr, monthNumStr] = monthStr.split('-');
  const monthNum = parseInt(monthNumStr, 10) - 1;
  const year = parseInt(yearStr, 10);

  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  if (monthNum >= 0 && monthNum < 12) {
    const name = full ? monthNamesFull[monthNum] : monthNamesShort[monthNum];
    return `${name} ${year}`;
  }
  return monthStr;
}

/**
 * Formats YYYY-MM-DD string to friendly date display (e.g. '2026-09-17' -> '17 Sep 2026' or 'Today')
 */
export function formatDateHuman(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length !== 3) return dateStr;

  const yyyy = parseInt(parts[0], 10);
  const mm = parseInt(parts[1], 10) - 1;
  const dd = parseInt(parts[2], 10);

  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = monthNamesShort[mm] || '';

  // Check if today or yesterday
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const cleanDateStr = `${parts[0]}-${parts[1]}-${parts[2]}`;

  if (cleanDateStr === todayStr) {
    return `Today, ${dd} ${monthName}`;
  }
  if (cleanDateStr === yesterdayStr) {
    return `Yesterday, ${dd} ${monthName}`;
  }

  return `${dd} ${monthName} ${yyyy}`;
}

/**
 * Given YYYY-MM returns previous YYYY-MM
 */
export function getPreviousMonthStr(currentMonthStr: string): string {
  if (!currentMonthStr || !currentMonthStr.includes('-')) return currentMonthStr;
  const [yearStr, monthNumStr] = currentMonthStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthNumStr, 10) - 1;

  if (month < 1) {
    month = 12;
    year -= 1;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Given YYYY-MM returns next YYYY-MM
 */
export function getNextMonthStr(currentMonthStr: string): string {
  if (!currentMonthStr || !currentMonthStr.includes('-')) return currentMonthStr;
  const [yearStr, monthNumStr] = currentMonthStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthNumStr, 10) + 1;

  if (month > 12) {
    month = 1;
    year += 1;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}
