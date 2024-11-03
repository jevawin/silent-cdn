const cleanUpAfterBuild = () => {
  // add button listeners
  buttonListeners(".job-apply-cta");
  // add more details listeners
  moreDetailsClicks();
  // update last updated
  document.querySelector("[data-last-updated]").innerText = new Date().toLocaleString("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour12: "true",
    hour: "numeric",
    minute: "2-digit",
  });
};
