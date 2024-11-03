// track refresh clicks
const refreshNowClicks = () => {
  // refresh link
  let refresh = document.querySelector("[data-refresh-jobs]");
  refresh.addEventListener("click", () => {
    loadRecords();
  });
};
