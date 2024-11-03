// button listeners for apply, refresh
const buttonListeners = (selector) => {
  // apply buttons
  let buttons = document.querySelectorAll(selector);
  buttons.forEach((button) => {
    button.addEventListener("click", async (el) => {
      // set to applying state
      el.currentTarget.innerText = "On it...";
      // disable all buttons
      buttons.forEach((button) => {
        button.disabled = true;
        button.style.opacity = 0.5;
      });
      // get record, revoke, and apply in airtable
      const recordId = el.currentTarget.dataset.record;
      const revoke = el.currentTarget.dataset.revoke === "true";
      // check not already applied
      if ((await canApply(recordId)) === true) {
        // update button text to notify user
        updateAirtable(recordId, revoke)
          .then((response) => {
            el.target.innerText = "Success!";
            if (!revoke) {
              // highlight apply button
              document.querySelector("[data-w-tab='Applied']").classList.add("highlight");
              document
                .querySelector("[data-w-tab='Applied']")
                .addEventListener("click", (event) => {
                  event.currentTarget.classList.remove("highlight");
                });
            }
          })
          .catch((err) => {
            errorHandler(`Error applying for job: ${err}`);
            alert(
              "Something went wrong, please contact MDC to apply. We'll fix the error as soon as possible."
            );
          });
      } else {
        // tell user someone already applied
        alert("Sorry, this job is no longer available.");
      }
      // refresh records
      loadRecords();
    });
  });
};
