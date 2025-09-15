/**
 * Find number of days between two dates
 * @param {string|Date} startDate - start date
 * @param {string|Date} endDate - end date
 * @returns {number} difference in days
 */
function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Get the difference in milliseconds
  const diffTime = end - start;

  // Convert ms → days
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export { daysBetween };
