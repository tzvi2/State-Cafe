export function getCurrentDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getESTDate() {
  const now = new Date();

  // Get the current time in EST
  const estTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", // Set timezone to Eastern Time
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = estTime.find((part) => part.type === "year").value;
  const month = estTime.find((part) => part.type === "month").value;
  const day = estTime.find((part) => part.type === "day").value;

  // Construct a new Date object representing the start of the day in EST
  return new Date(`${year}-${month}-${day}T00:00:00-05:00`);
}

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
