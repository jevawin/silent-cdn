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

// initalise
const init = async () => {
  // set up airtable
  Airtable = require("airtable");
  base = new Airtable({
    apiKey: "patXGH9KFBe0KbA4w.fbd74bf1f061b8085eb679cbfe7a8bee445d3dda86181d75ff5281681bccce59",
  }).base("appVvBBcXMR0P1Lo6");

  // copy buttons
  copyHandler();
};

// copy handler
const copyHandler = () => {
  // grab copy buttons
  const copyButtons = document.querySelectorAll("[data-copy-from-to");

  // loop through, add listener to copy every "from" to every "to"
  // from and to dictated by value of data-copy-from-to as comma-separated list
  copyButtons.forEach((button) => {
    // listen for clicks
    button.addEventListener("click", (button) => {
      // get array of "from" and "to"s
      const copyFromTos = button.currentTarget.dataset.copyFromTo.split(",");

      // loop through and copy from "from" to "to"
      copyFromTos.forEach((fromTo) => {
        // trim in case comma-separated with spaces
        const ft = fromTo.trim();

        // get from element
        const from = document.querySelector(`[data-copy-from="${ft}"]`);

        // get to element
        const to = document.querySelector(`[data-copy-to="${ft}"]`);

        // copy paste
        to.value = from.value;
      });
    });
  });
};

// submit handler
const submitHandler = async () => {
  let recordID = null;
  let success = false;
  // get form data
  let formData = getFormData();
  // create job
  if (formData) recordID = await createJobRecord(formData);
  // check job
  if (recordID) success = await validateJobRecord(recordID);
  // set response message
  if (success) {
    successHandler();
  } else {
    errorHandler("Sucess = false");
  }
};

// errors? show error message
const successHandler = () => {
  // hide form
  document.querySelector("#wf-form-interpreter-booking-form").style.display = "none";
  // show success
  document.querySelector(".success-message").style.display = "block";
};

// errors? show error message
const errorHandler = (error) => {
  // hide form
  document.querySelector("#wf-form-interpreter-booking-form").style.display = "none";
  // show error message
  document.querySelector(".error-message").style.display = "block";
  // senderror to New Relic
  nrError(error);
};

// get form data
const getFormData = () => {
  // form fields
  // prettier-ignore
  const fields = {
    "Booker: name": "text",
    "Appointment: service": "radio",
    "Appointment: specialism": "radio",
    "Appointment: details": "text",
    "Appointment: client name": "text",
    "Appointment: contact name": "text",
    "Appointment: contact number": "text",
    "Appointment: access to work": "radio",
    "Appointment: interpreter gender": "radio",
    "Appointment: date": "text",
    "Appointment: duration": "special",
    "Appointment: address 1": "text",
    "Appointment: address 2": "text",
    "Appointment: city": "text",
    "Appointment: post code": "text",
    "Booker: number": "text",
    "Booker: email": "text",
    "Finance: department": "radio",
    "Finance: SIU department": "text",
    "Finance: company name": "text",
    "Finance: address 1": "text",
    "Finance: address 2": "text",
    "Finance: city": "text",
    "Finance: post code": "text",
    "Finance: email address": "text",
    "Finance: PO / cost centre code": "text",
    "Finance: additional info": "text",
  }

  // initialise form data object
  const formData = {};

  // loop through formdata and collect value
  for (const field in fields) {
    try {
      switch (fields[field]) {
        case "text":
          formData[field] = document.querySelector(`[data-name="${field}"]`).value;
          break;
        case "radio":
          formData[field] = document.querySelector(`input[data-name='${field}']:checked`).value;
          break;
        case "special":
          if (field === "Appointment: duration") {
            formData[field] =
              document.querySelector("select[data-name='Appointment: duration hours']").value +
              "h" +
              document.querySelector("select[data-name='Appointment: duration minutes']").value +
              "m";
          }
          break;
        default:
          // uh oh, this field type isn't recognised
          throw new Error("Unknown field type");
      }
    } catch (error) {
      errorHandler(`Error in field: ${field}. Error: ${error}]`);
      return false;
    }
  }

  // return collected form data
  return formData;
};

// create job record
const createJobRecord = (formData) => {
  return new Promise((resolve, reject) => {
    let recordID = "";
    base("Jobs").create([{ fields: formData }], (error, records) => {
      if (error) {
        errorHandler(error);
        resolve(null);
      }
      records.forEach((record) => {
        recordID = record.getId();
      });
      resolve(recordID);
    });
  });
};

// create job record
const validateJobRecord = (recordID) => {
  return new Promise((resolve, reject) => {
    base("Jobs").find(recordID, (error, record) => {
      if (error) {
        errorHandler("Record does not exist in Airtable");
        resolve(false);
      }
      resolve(true);
    });
  });
};

// override webflow submission
var Webflow = Webflow || [];
Webflow.push(function () {
  // unbind webflow form handling
  $(document).off("submit");
  // new form handling
  $("#wf-form-interpreter-booking-form").submit((event) => {
    // disable submit button
    let submitBtn = document.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.style.opacity = 0.6;
    submitBtn.value = "Submitting...";

    // manually send form to airtable
    event.preventDefault();
    submitHandler();
  });
});

// update airtable values when ready
ready(init);
