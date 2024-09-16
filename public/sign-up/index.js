// import airtable browser
let airtableBrowser = document.createElement("script");
airtableBrowser.src = `${host}/airtable.browser.js`;
document.head.appendChild(airtableBrowser);

let Airtable = null;
let base = null;

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

// initalisation function
const init = async () => {
  Airtable = require("airtable");
  base = new Airtable({
    apiKey: "patXGH9KFBe0KbA4w.fbd74bf1f061b8085eb679cbfe7a8bee445d3dda86181d75ff5281681bccce59",
  }).base("appVvBBcXMR0P1Lo6");
  // update airtable record on submit
  watchForSubmit();
};

// errors? show error message
const errorHandler = (error) => {
  // log to newrelic
  nrError(error);
};

// get record names
const getFormData = () => {
  const airtableData = {};

  // get data from page
  const formData = document.querySelectorAll("[data-airtable-name]");
  formData.forEach(
    (field) =>
      (airtableData[field.dataset.airtableName] =
        field.type === "checkbox" ? field.checked : field.value)
  );

  // handle NRCPD
  if (
    airtableData["Registration organisation"] === "" &&
    airtableData["Registration number"] !== ""
  )
    airtableData["Registration organisation"] = "NRCPD";

  return airtableData;
};

// send user to airtable
const sendToAirtable = (formData) => {
  base("Interpreters").create(
    [
      {
        fields: formData,
      },
    ],
    (err) => {
      if (err) {
        errorHandler(err);
      }
      return;
    }
  );
};

// watch submit
const watchForSubmit = async (id) => {
  document.forms[0].addEventListener("submit", async (event) => {
    // get form data
    let formData = getFormData();
    sendToAirtable(formData);
  });
};
/*
  
  */
// init on ready
ready(init);
