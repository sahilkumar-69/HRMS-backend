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

// services/salaryCalculator.js
function calculateSalary({
  specialAllowance,
  basic = 0,
  hra = 0,
  allowances = [],
  deductions = [],
  tax = 0,
}) {
  // Basic assumes number inputs -> calculate HRA, gross, tax, net
  // const hra = +(basic * (hraPercent / 100));
  const allowancesTotal = allowances.reduce(
    (s, a) => s + (Number(a.amount) || 0),
    0
  );
  const deductionsTotal = deductions.reduce(
    (s, d) => s + (Number(d.amount) || 0),
    0
  );

  const gross = basic + hra + allowancesTotal + specialAllowance;
  // const tax = +(gross * tax);
  // const netPay = +(gross - tax - deductionsTotal);

  // return rounded values
  return {
    basic: +basic.toFixed(2),
    hra: +hra.toFixed(2),
    allowancesTotal: +allowancesTotal.toFixed(2),
    deductionsTotal: +deductionsTotal.toFixed(2),
    gross: +gross.toFixed(2),
    tax: +tax.toFixed(2),
    // netPay: +netPay.toFixed(2),
  };
}

export { daysBetween, calculateSalary };
