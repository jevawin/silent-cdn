// imports
let imports = [
  `${host}/airtable.browser.js`, // airtable browser
  "https://cdn.jsdelivr.net/npm/add-to-calendar-button@2", // add to calendar button
  `${host}/job-listings/lib/refreshNowClicks.js`, // refresh link click handler
  `${host}/job-listings/lib/moreDetailsClicks.js`, // more details click handler
  `${host}/job-listings/lib/canApply.js`, // checks if interpreter can apply for job
  `${host}/job-listings/lib/airtableApply.js`, // apply
  `${host}/job-listings/lib/airtableRevoke.js`, // revoke applications
  `${host}/job-listings/lib/buttonListeners.js`, // listens for apply / revoke buttons
  `${host}/job-listings/lib/dateTimeFunctions.js`, // formats dates and times
  `${host}/job-listings/lib/userAccount.js`, // inject user account iframe
  `${host}/job-listings/lib/getEmail.js`, // get email from user account
  `${host}/job-listings/lib/getUserID.js`, // get user ID from airtable
  `${host}/job-listings/lib/buildJobsTables.js`, // build tables from airtable response
  `${host}/job-listings/lib/cleanUpAfterBuild.js`, // refresh listeners, update last refresh
];

let Airtable = null;
let base = null;
let mdcUserData = {};

// run when ready
const ready = (fn) => {
  // promises
  promises = [];

  // imports
  imports.forEach((ref) => {
    promises.push(
      new Promise((resolve, reject) => {
        let script = document.createElement("script");
        // resolve on script load
        script.onload = resolve;
        script.src = ref;
        document.head.appendChild(script);
      })
    );
  });

  // dom ready
  promises.push(
    new Promise((resolve) => {
      if (document.readyState !== "loading") {
        resolve();
      } else {
        document.addEventListener("DOMContentLoaded", resolve);
      }
    })
  );

  // check airtable loaded
  promises.push(
    new Promise((resolve, reject) => {
      let counter = 0;
      const checker = setInterval(() => {
        if (typeof require === "function") resolve();
        if (++counter === 50) reject("Unable to load Airtable");
      }, 100);
    })
  );

  // run when all ready
  Promise.all(promises).then(fn);
};

// run on ready
ready(async () => {
  Airtable = require("airtable");
  base = new Airtable({
    apiKey: "patXGH9KFBe0KbA4w.fbd74bf1f061b8085eb679cbfe7a8bee445d3dda86181d75ff5281681bccce59",
  }).base("appVvBBcXMR0P1Lo6");
  // // track refresh
  // refreshNowClicks();
  // // track more details clicks
  // moreDetailsClicks();
  // inject iframe to user account
  let iframe = await userAccount();
  // get user email
  let email = await getEmail(iframe);
  // get id from airtable
  let airtableID = await getUserID(email);
  // run with user ID
  loadRecords(airtableID);
});

// errors to New Relic
const errorHandler = (error) => {
  nrError(error);
};

// load records from airtable
const loadRecords = async (aID) => {
  try {
    aID = aID || mdcUserData.airtable.id;
    // error if email not available
    if (!aID || aID === "") errorHandler(`Interpreter not found`);
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
          "Appointment: date",
          "Appointment: duration",
          "Appointment: service",
          "Appointment: specialism",
          "Appointment: city",
          "Appointment: post code",
          "Status",
          "Airtable: applications",
          "Airtable: assigned interpreters",
          "Appointment: address 1",
          "Appointment: address 2",
          "Appointment: contact name",
          "Appointment: contact number",
          "Appointment: notes",
        ],
        filterByFormula: "NOT({Status} = 'New request')",
        sort: [{ field: "Appointment: date", direction: "asc" }],
      })
      .eachPage(
        function page(records, fetchNextPage) {
          try {
            buildJobsTables(open, approved, received, aID, records);
          } catch (error) {
            errorHandler(`Error in building jobs table: ${error}`);
          }
          // To fetch the next page of records, call `fetchNextPage`.
          // If there are more records, `page` will get called again.
          // If there are no more records, `done` will get called.
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            errorHandler(`Error loading records: ${err}`);
            return;
          }
          cleanUpAfterBuild();
        }
      );
  } catch (error) {
    errorHandler(`Table update error: ${error}`);
  }
};
