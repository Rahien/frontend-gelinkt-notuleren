export function formatMandatarisDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
}

export function formatMandatarisPeriod(start, end) {
  const startDate = formatMandatarisDate(start);
  const endDate = formatMandatarisDate(end);

  if (startDate && endDate) {
    return `${startDate} - ${endDate}`;
  }
  return startDate || endDate;
}
