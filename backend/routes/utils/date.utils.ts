export const formatTime = (date: Date) => new Date(date).toLocaleString("en-IN").split(",")[1];
export const formatDate = (date: Date) => new Date(date).toLocaleDateString("en-IN");
export const formatDateTime = (date: Date) => new Date(date).toLocaleString("en-IN");
export const formatTimeOnly = (date: Date) => new Date(date).toLocaleTimeString("en-IN");

export function parseExcelSerialDate(serial: number | string): Date {
  if (typeof serial === "string") {
    const d = new Date(serial);
    if (!isNaN(d.getTime())) return d;
    console.warn(`Invalid DOB string: ${serial}, defaulting to now`);
    return new Date();
  }
  const excelEpoch = new Date(1899, 11, 30);
  const days = Math.floor(serial);
  const ms = (serial - days) * 86400000;
  const date = new Date(excelEpoch.getTime() + days * 86400000 + ms);
  if (isNaN(date.getTime())) {
    console.warn(`Invalid DOB serial: ${serial}, defaulting to now`);
    return new Date();
  }
  return date;
}
