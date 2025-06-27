"use client";

const dateIsValid = (date) => {
  return !Number.isNaN(new Date(date).getTime());
};

/**
 * Converts a given date into a formatted string based on the provided options.
 * @param {Object} options - The options for formatting the date.
 * @param {Date} options.date - The date to be formatted.
 * @param {boolean} [options.year=true] - Whether to include the year in the formatted string.
 * @param {boolean} [options.month=true] - Whether to include the month in the formatted string.
 * @param {boolean} [options.day=true] - Whether to include the day in the formatted string.
 * @param {boolean} [options.hour=false] - Whether to include the hour in the formatted string.
 * @param {boolean} [options.minute=false] - Whether to include the minute in the formatted string.
 * @param {boolean} [options.numericDay=true] - Whether to use numeric representation for the day.
 * @param {string} [options.timeZone] - The time zone to be used for formatting the date.
 * @returns {string|null} The formatted date string or null if the date is not defined.
 */
export const showDatetime = (options) => {
  if (options.date) {
  } else {
    // console.error('Date is not defined');
    return null;
  }

  const {
    date: _date,
    year = true,
    month = true,
    day = true,
    hour = false,
    minute = false,
    numericDay = true,
    timeZone,
  } = options;

  let date = dateControl(_date);

  if (date === null) return null;

  const NewDate = new Date(date)
    .toLocaleDateString(timeZone ?? navigator?.language, {
      ...(year && { year: "numeric" }),
      ...(month && { month: numericDay ? "numeric" : "long" }),
      ...(day && { day: "numeric" }),
      ...(hour && { hour: "numeric" }),
      ...(minute && { minute: "numeric" }),
    })
    .replace(/:/g, ".")
    .replace(/\//g, ".");

  return NewDate;
};

export const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const date = new Date(dateString);

  const lang = window.localStorage.getItem("i18nextLng");

  return date.toLocaleDateString(
    lang.startsWith("en") ? "en-GB" : lang,
    options
  );
};

export const GetDayName = (options) => {
  const { Date: date } = options;

  const Days = [
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
  ];

  return Days[new Date(date).getDay()];
};

export const getClockTime = (options) => {
  const { date } = options;

  const hours = new Date(date).getHours();
  const minutes = new Date(date).getMinutes();

  return `${hours < 10 ? `0${hours}` : hours}.${
    minutes ? (minutes < 10 ? `0${minutes}` : minutes) : "00"
  }`;
};

export const dateControl = (date) => {
  if (
    date === null ||
    date === undefined ||
    date === "" ||
    date === "0000-00-00" ||
    date === "0000-00-00 00:00:00" ||
    date === "0000-00-00T00:00:00.000Z" ||
    date === "0001-01-01T00:00:00Z" ||
    date === "1970-01-01" ||
    date === "1970-01-01 00:00:00" ||
    date === "1970-01-01T00:00:00.000Z" ||
    date === 0
  )
    return null;

  if (dateIsValid(date)) return date;
  else return null;
};

export const howLongAgo = ({ date, short }) => {
  if (dateControl(date)) {
    const now = new Date();
    const past = new Date(date);

    const diff = now.getTime() - past.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) return short ? `${years}y` : `${years} yıl önce`;
    else if (months > 0) return short ? `${months}a` : `${months} ay önce`;
    else if (days > 0) return short ? `${days}g` : `${days} gün önce`;
    else if (hours > 0) return short ? `${hours}sa` : `${hours} saat önce`;
    else if (minutes > 0)
      return short ? `${minutes}d` : `${minutes} dakika önce`;
    else if (seconds > 0)
      return short ? `${seconds}s` : `${seconds} saniye önce`;
    else return "şimdi";
  } else return null;
};

export const convertToISO = (date) => {
  if (dateControl(date)) {
    const ISODate = new Date(date)?.toISOString();

    return ISODate;
  } else return null;
};

export const calculateDayDifference = (date) => {
  const today = new Date();
  const activityDate = new Date(date);

  const diffTime = Math.abs(today - activityDate);

  const difference = diffTime / (1000 * 60 * 60 * 24);
  const diffDays = Math.floor(difference);

  return diffDays;
};
