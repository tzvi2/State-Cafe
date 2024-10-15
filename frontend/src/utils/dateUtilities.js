export function getCurrentDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const getESTDate = () => {
  const now = new Date();
  const utcDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const estDate = new Date(utcDate.getTime() - (5 * 60 * 60 * 1000));
  return estDate;
};

export const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateToMDYYYY = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}-${day}-${year}`;
};

export const YMDtoDMY = (str) => {
  const [year, month, day] = str.split('-');
  const monthNumber = parseInt(month, 10);
  const dayNumber = parseInt(day, 10);
  return `${monthNumber}-${dayNumber}-${year}`;
}
