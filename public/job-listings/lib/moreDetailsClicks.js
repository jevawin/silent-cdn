// remove :focus from more details link on click
const moreDetailsClicks = () => {
  document.querySelectorAll(".job-more-details-link").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.currentTarget.classList.toggle("active");
    });
  });
};
