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
};

// submitHandler
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
  // console log for debugging
  console.error(error);
  // TODO 2. email self MAILGUN
};

// get form data
const getFormData = () => {
  let formData = {};
  try {
    formData.status = "New request";
    formData.service = document.querySelector("input[name='Service']:checked").value;
    formData.appointmentKind = document.querySelector(
      "input[name='appointment-kind']:checked"
    ).value;
    formData.appointmentDetails = document.querySelector(
      "textarea[name='Appointment-details']"
    ).value;
    formData.duration = `${document.querySelector("select[name='Duration-Hours']").value}h${
      document.querySelector("select[name='Duration-Minutes']").value
    }m`;
    formData.accessToWork = document.querySelector("input[name='Access-to-work']:checked").value;
    formData.gender = document.querySelector("input[name='Interpreter-gender']:checked").value;
    formData.appointmentDate = document.querySelector("input[name='Appointment-Date']").value;
    formData.addressOne = document.querySelector("input[name='Address-line-1']").value;
    formData.addressTwo = document.querySelector("input[name='Address-line-2']").value;
    formData.city = document.querySelector("input[name='City-Town']").value;
    formData.postCode = document.querySelector("input[name='Postcode']").value;
    formData.bookingFor = `${document.querySelector("input[name='First-Name']").value} ${
      document.querySelector("input[name='Last-Name']").value
    }`;
    formData.phoneNumber = document.querySelector("input[name='Phone-number']").value;
    formData.emailAddress = document.querySelector("input[name='Email']").value;
    formData.bookingType = "MDC";
    return formData;
  } catch (error) {
    errorHandler(error);
    return false;
  }
};

// create job record
const createJobRecord = (formData) => {
  return new Promise((resolve, reject) => {
    let recordID = "";
    base("Jobs").create(
      [
        {
          fields: {
            Status: formData.status,
            "Booking for": formData.bookingFor,
            Service: formData.service,
            "Appointment kind": formData.appointmentKind,
            "Appointment details": formData.appointmentDetails,
            "Access to work": formData.accessToWork,
            "Interpreter gender": formData.gender,
            "Appointment date": formData.appointmentDate,
            Duration: formData.duration,
            "Address line 1": formData.addressOne,
            "Address line 2": formData.addressTwo,
            City: formData.city,
            Postcode: formData.postCode,
            "Phone number": formData.phoneNumber,
            Email: formData.emailAddress,
            "Booking type": formData.bookingType,
          },
        },
      ],
      (error, records) => {
        if (error) {
          errorHandler(error);
          resolve(null);
        }
        records.forEach((record) => {
          recordID = record.getId();
        });
        resolve(recordID);
      }
    );
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
