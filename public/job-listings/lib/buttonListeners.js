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
      const revokeBtn = el.currentTarget.dataset.revoke === "true";

      // revoke if revoke is true
      if (revokeBtn) await revoke(recordId, el);

      // otherwise apply
      if (!revokeBtn) await apply(recordId, el);

      // refresh records
      loadRecords();
    });
  });
};

const apply = async (recordId, el) => {
  // check not already applied
  try {
    const record = await canApply(recordId);

    // handle unavailable jobs
    if (record === "unavailable") alert("Sorry, this job is no longer available");

    // if not already applied, apply
    if (record !== "applied") await airtableApply(record);

    // successfully applied so update button text to notify user
    el.target.innerText = "Success!";

    // highlight apply button
    document.querySelector("[data-w-tab='Applied']").classList.add("highlight");
    document.querySelector("[data-w-tab='Applied']").addEventListener("click", (event) => {
      event.currentTarget.classList.remove("highlight");
    });
  } catch {
    // notify user to call mdc
    alert(
      "Something went wrong, please contact MDC to apply. We'll fix the error as soon as possible."
    );
  }
};

const revoke = async (recordId, el) => {
  try {
    // revoke
    await airtableRevoke(recordId);

    // successfully revoked so update button text to notify user
    el.target.innerText = "Success!";
  } catch (error) {
    // log error
    errorHandler(`Error in revoke: ${error}`);

    // notify user
    alert(
      "Something went wrong, please contact MDC to revoke. We'll fix the error as soon as possible."
    );
  }
};
