// local dev
const host = document.querySelector("[data-js-imports-host]").dataset.jsImportsHost;

// import airtable browser
let airtableBrowser = document.createElement("script");
airtableBrowser.src = `${host}/airtable.browser.js`;
document.head.appendChild(airtableBrowser);

// import add to calendar button
let addToCal = document.createElement("script");
addToCal.src = "https://cdn.jsdelivr.net/npm/add-to-calendar-button@2";
document.head.appendChild(addToCal);

let Airtable = null;
let base = null;
let mdcUserData = {};

// run when ready
const ready = (fn) => {
  // dom ready
  const dom = new Promise((resolve) => {
    if (document.readyState !== "loading") {
      resolve();
    } else {
      document.addEventListener("DOMContentLoaded", resolve);
    }
  });

  // check airtable loaded
  const airtable = new Promise((resolve, reject) => {
    let counter = 0;
    const checker = setInterval(() => {
      if (typeof require === "function") resolve();
      if (++counter === 50) reject("Unable to load Airtable");
    }, 100);
  });

  // run when all ready
  Promise.all([dom, airtable]).then(fn);
};

// run on ready
ready(async () => {
  Airtable = require("airtable");
  base = new Airtable({
    apiKey: "patXGH9KFBe0KbA4w.fbd74bf1f061b8085eb679cbfe7a8bee445d3dda86181d75ff5281681bccce59",
  }).base("appVvBBcXMR0P1Lo6");
  // track more details clicks
  moreDetailsClicks();
  // inject iframe to user account
  let iframe = await userAccount();
  // get user email
  let email = await getEmail(iframe);
  // get id from airtable
  let airtableID = await getUserID(email);
  // run with user ID
  loadRecords(airtableID);
});

// remove :focus from more details link on click
const moreDetailsClicks = () => {
  document.querySelectorAll(".job-more-details-link").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.currentTarget.classList.toggle("active");
    });
  });
};

// check application status
const canApply = (id) => {
  return new Promise((resolve, reject) => {
    base("Jobs").find(id, function (err, record) {
      if (err) {
        console.error(err);
        reject("Error, please call MDC");
      }
      if (
        record.get("Status") === "Booking posted" ||
        record.get("Applications").includes(mdcUserData.airtable.id)
      )
        resolve(true);
    });
  });
};

// send application to airtable
const updateAirtable = (id, revoke) => {
  return new Promise((resolve, reject) => {
    base("Jobs").update(
      [
        {
          id: id,
          fields: {
            Status: revoke ? "Booking posted" : "Applications received",
            Applications: revoke ? [] : [mdcUserData.airtable.id],
          },
        },
      ],
      function (err, records) {
        if (err) {
          console.error(err);
          reject("Error, please call MDC");
        }
        resolve(true);
      }
    );
  });
};

// button listeners for apply, refresh
const buttonListeners = (selector) => {
  // apply buttons
  let buttons = document.querySelectorAll(selector);
  buttons.forEach((button) => {
    button.addEventListener("click", async (el) => {
      // set to applying state
      el.currentTarget.innerText = "On it...";
      el.currentTarget.style.opacity = 0.5;
      el.currentTarget.disabled = true;
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
          .catch((err) => alert("Application error, please contact MDC to apply."));
      } else {
        // tell user someone already applied
        alert("Sorry, this job is no longer available.");
      }
      // refresh records
      loadRecords();
    });
  });
  // refresh link
  let refresh = document.querySelector("[data-refresh-jobs]");
  refresh.addEventListener("click", () => {
    loadRecords();
  });
};

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

// one: inject user account iframe
const userAccount = () => {
  return new Promise((resolve, reject) => {
    document.body.insertAdjacentHTML(
      "beforeend",
      "<iframe style='display:none;' data-user src='/user-account'/>"
    );
    let iframe = document.querySelector("[data-user]");
    iframe.addEventListener("load", resolve(iframe));
  });
};

// two: pull email address from /user-account
const getEmail = (iframe) => {
  return new Promise((resolve, reject) => {
    let pollForEmail = setInterval(() => {
      let user = iframe.contentDocument || iframe.contentWindow.document;
      if (!user) {
        throw "iframe couldn't be found in DOM.";
      }
      let email = user.querySelector("input[name='Email']");
      if (email && email.value) {
        clearInterval(pollForEmail);
        // return email
        resolve(email.value);
      }
    }, 300); // polls every 300ms for email address
  });
};

// three: pull user record id from airtable
const getUserID = (email) => {
  return new Promise((resolve, reject) => {
    let id = "";
    base("Interpreters")
      .select({
        fields: ["Email"],
        filterByFormula: `{Email}="${email}"`,
      })
      .eachPage(
        function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.
          records.forEach(function (record) {
            id = record.id;
          });
          // To fetch the next page of records, call `fetchNextPage`.
          // If there are more records, `page` will get called again.
          // If there are no more records, `done` will get called.
          // MUST BE INCLUDED or done() never called
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            console.error(err);
            reject();
          }
          // save for later
          mdcUserData.airtable = {
            id: id,
          };
          // send to loadRecords
          resolve(id);
        }
      );
  });
};

// four: load records from airtable
const loadRecords = async (aID) => {
  try {
    aID = aID || mdcUserData.airtable.id;
    // error if email not available
    if (!aID || aID === "") throw new Error(`interpreter not found`);
    // get table to replace html
    let open = document.querySelector("[data-open-for-applications]");
    let received = document.querySelector("[data-applications-received]");
    let approved = document.querySelector("[data-applications-approved]");
    // remove previous records
    document
      .querySelectorAll(".jobs-container .job-row.job-record")
      .forEach((node) => node.remove());
    // set loading state
    document.querySelectorAll(".loading").forEach((node) => (node.style.display = "flex"));
    // delay for 1s to limit airtable hits
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve();
      }, 1000)
    );
    // query airtable
    base("Jobs")
      .select({
        fields: [
          "Request ID",
          "Appointment date",
          "Duration",
          "Service",
          "Appointment kind",
          "City",
          "Postcode",
          "Status",
          "Applications",
          "Address line 1",
          "Address line 2",
          "Booking for",
          "Email",
          "Phone number",
          "Notes",
        ],
      })
      .eachPage(
        function page(records, fetchNextPage) {
          try {
            // hide loading row
            document.querySelectorAll(".loading").forEach((node) => (node.style.display = "none"));
            // loop through returned records
            records.forEach(function (record) {
              const isOpen = record.get("Status") === "Booking posted";
              const hasApplied =
                typeof record.get("Applications") !== "undefined" &&
                record.get("Applications").includes(aID);
              const isApproved = hasApplied && record.get("Status") === "Appointment booked";
              // if applied but not current user, ignore (TODO: waitlist)
              if (isOpen || hasApplied) {
                // set friendly appointment date and times
                // returns {date, start, end, atc: { buttonDate, buttonStart, buttonEnd }}
                const dateTimes = getDateTimes(
                  record.get("Appointment date"),
                  record.get("Duration")
                );
                const addressLine = `${record.get("Address line 1")}${
                  record.get("Address line 2") ? ", " + record.get("Address line 2") : ""
                }, ${record.get("City")}, ${record.get("Postcode")}`;
                const address = `${addressLine} [url]https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  addressLine
                )}|(Open in Google Maps)[/url]`;
                const description = `[strong]Contact:[/strong] ${record.get(
                  "Booking for"
                )}[br][strong]Contact number:[/strong] ${record.get(
                  "Phone number"
                )}[br][strong]Address:[/strong] ${address}${
                  record.get("Notes")
                    ? "[br][strong]Notes from MDC:[/strong][br]" + record.get("Notes")
                    : ""
                }`;
                const button = isApproved
                  ? `
                  <add-to-calendar-button 
                    name="MDC Interpreting: ${record.get("Request ID")}" 
                    options="'Apple','Google', 'Outlook.com', 'iCal'" 
                    location="${record.get("Address line 1")}, ${record.get("City")}, ${record.get(
                      "Postcode"
                    )}" 
                    startDate="${dateTimes.atc.buttonDate}" 
                    endDate="${dateTimes.atc.buttonDate}" 
                    startTime="${dateTimes.atc.buttonStart}" 
                    endTime="${dateTimes.atc.buttonEnd}" 
                    organizer="${record.get("Booking for")}|${record.get("Email")}" 
                    description="${description}"
                    timeZone="Europe/London"
                    iCalFileName="${record.get("Request ID").toLowerCase()}"
                    size="6|5|4"
                  ></add-to-calendar-button>`
                  : isOpen
                  ? `<button class="bsl-cta is-small job-apply-cta" data-record="${record.id}">✎ Apply</button>`
                  : `<button class="bsl-cta is-small job-apply-cta job-revoke is-red" data-revoke="true" data-record="${record.id}">✗ Revoke</button>`;
                // generate row content
                const lookups = {
                  "job-number": record.get("Request ID"),
                  "job-service": record.get("Service"),
                  "job-kind": record.get("Appointment kind"),
                  "job-date": dateTimes.date,
                  "job-time": `${dateTimes.start}-${dateTimes.end}`,
                  "job-location": record.get("City"),
                  "job-notes": record.get("Notes"),
                };
                // get template row
                const templateRow = document.querySelector(".job-row.editor-only");
                // clone template row
                const newRow = templateRow.cloneNode(true);
                // set class of job-record
                newRow.classList.add("job-record");
                // make it visible
                newRow.classList.remove("editor-only");
                // edit content
                for (const [key, value] of Object.entries(lookups)) {
                  newRow.querySelector(`.${key}`).innerText = value ? value : "Not provided";
                }
                // replace apply button
                newRow.querySelector(".job-apply-cta").outerHTML = button;
                // append job
                if (isOpen) {
                  open.appendChild(newRow);
                } else if (hasApplied && isApproved) {
                  approved.appendChild(newRow);
                } else {
                  received.appendChild(newRow);
                }
              }
            });
          } catch (error) {
            console.error(`Error in building jobs table: ${error}`);
          }
          // To fetch the next page of records, call `fetchNextPage`.
          // If there are more records, `page` will get called again.
          // If there are no more records, `done` will get called.
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            console.error(`Error in Airtable: ${err}`);
            return;
          }
          // add button listeners
          buttonListeners(".job-apply-cta");
          // add more details listeners
          moreDetailsClicks();
          // update last updated
          document.querySelector("[data-last-updated]").innerText = new Date().toLocaleString(
            "en-GB",
            {
              timeZone: "Europe/London",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour12: "true",
              hour: "numeric",
              minute: "2-digit",
            }
          );
        }
      );
  } catch (error) {
    console.log(`Table update error: ${error}`);
  }
};
