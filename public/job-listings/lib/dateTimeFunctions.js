// date time functions
const getDateTimes = (appointmentDate, appointmentDuration) => {
  const dateTime = new Date(appointmentDate);
  // friendly date
  const date = dateTime.toLocaleString("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    month: "short",
    year: "2-digit",
    day: "numeric",
  });
  // friendly start time
  const start = dateTime
    .toLocaleString("en-GB", {
      timeZone: "Europe/London",
      hour12: "true",
      hour: "numeric",
      minute: "numeric",
    })
    .replace(/[ apm]/gi, "")
    .replace(/:00/, "");
  // friendly finish time
  const duration = appointmentDuration.match(/(\d+)h(\d+)m/);
  let finish = new Date(dateTime.getTime());
  finish.setMinutes(finish.getMinutes() + parseInt(duration[2]));
  finish.setHours(finish.getHours() + parseInt(duration[1]));
  const end = finish
    .toLocaleString("en-GB", {
      timeZone: "Europe/London",
      hour12: "true",
      hour: "numeric",
      minute: "numeric",
    })
    .replace(/ /gi, "")
    .replace(/:00/, "");
  // add to calendar button dates
  const offset = dateTime.getTimezoneOffset();
  const buttonDate = new Date(dateTime.getTime() - offset * 60 * 1000).toISOString().split("T")[0];
  const buttonStart = dateTime.toLocaleString("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
  });
  const buttonEnd = finish.toLocaleString("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
  });
  // return as object
  return {
    date,
    start,
    end,
    atc: {
      buttonDate,
      buttonStart,
      buttonEnd,
    },
  };
};
