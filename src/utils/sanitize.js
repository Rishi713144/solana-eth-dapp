export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>"']/g, '').trim();
}

export function isValidNumber(val) {
  const num = parseFloat(val);
  return !isNaN(num) && isFinite(num);
}
