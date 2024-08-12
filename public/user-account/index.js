// import airtable browser
let airtableBrowser = document.createElement("script");
airtableBrowser.src = "https://silent-cdn.pages.dev/airtable.browser.js";
document.head.appendChild(airtableBrowser);

let Airtable = null;
let base = null;
/*
  
  */
// dom ready
const ready = (fn) => {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
};
/*
  
  */
// initalisation function
const init = async () => {
  Airtable = require("airtable");
  base = new Airtable({
    apiKey: "patXGH9KFBe0KbA4w.fbd74bf1f061b8085eb679cbfe7a8bee445d3dda86181d75ff5281681bccce59",
  }).base("appVvBBcXMR0P1Lo6");
  // get email from page
  let email = await getEmail();
  // get id from airtable
  let id = email ? await getUserID(email) : false;
  // update airtable record on submit
  if (id) watchForSubmit(id);
};
/*
  
  */
// get form data
const getFormData = () => {
  try {
    let formData = {
      email: document.querySelector("#email").value,
      name: document.querySelector("#name").value,
      job_notifications: document.querySelector("#job-notification-email").checked,
      job_summary: document.querySelector("#job-summary-email").checked,
    };
    return formData;
  } catch (error) {
    errorHandler(error);
    return null;
  }
};
/*
  
  */
// errors? show error message
const errorHandler = (error) => {
  // log for debugging
  console.error(error);
  // notify user of error
  document.querySelector(".submit-messages.error").style.visibility = "block";
  // TODO 2. email self AIRTABLE
};
/*
  
  */
// poll for email
const getEmail = () => {
  return new Promise((resolve, reject) => {
    let count = 0;
    let poll = setInterval(() => {
      let email = document.querySelector("#email").value;
      // return email
      if (email !== "") {
        clearInterval(poll);
        resolve(email);
      }
      // no email after 5s error
      if (++count === 50) {
        errorHandler("Unable to retrieve email address");
        reject();
      }
    }, 100);
  });
};
/*
  
  */
// get user id
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
            errorHandler(err);
            reject();
          }
          // return id
          resolve(id);
        }
      );
  });
};
/*
  
  */
// update user record
const updateAirtable = (id, formData) => {
  return new Promise((resolve, reject) => {
    base("Interpreters").update(
      [
        {
          id: id,
          fields: {
            Email: formData.email,
            Name: formData.name,
            "Job post emails": formData.job_notifications,
            "Job summary emails": formData.job_summary,
          },
        },
      ],
      (err, records) => {
        if (err) {
          errorHandler(err);
          reject(err);
        }
        // notify user of success
        document.querySelector(".submit-messages.success").style.visibility = "block";
        resolve;
      }
    );
  });
};
/*
  
  */
// watch submit
const watchForSubmit = async (id) => {
  document.forms[0].addEventListener("submit", async (event) => {
    // clear error messages
    document.querySelector(".submit-messages").style.visibility = "hidden";
    // get form data
    let formData = getFormData();
    let updated = formData === null ? false : await updateAirtable(id, formData);
    if (!updated) errorHandler("Error updating Airtable");
  });
};
/*
  
  */
// init on ready
ready(init);
