// import airtable browser
let airtableBrowser = document.createElement("script");
airtableBrowser.src = `${host}/airtable.browser.js`;
document.head.appendChild(airtableBrowser);

let Airtable = null;
let base = null;
/*
  
  */
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
  // notify user of error
  document.querySelector(".submit-message.error").style.display = "block";
  // send error to New Relic
  nrError(error);
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
            // Email: formData.email,
            Name: formData.name,
            "Job post emails": formData.job_notifications,
            "Job summary emails": formData.job_summary,
          },
        },
      ],
      (err) => {
        if (err) {
          errorHandler(err);
          reject(err);
        }
        // notify user of success
        document.querySelector(".submit-message.success").style.display = "block";
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
    document.querySelectorAll(".submit-message").forEach((el) => (el.style.display = "none"));
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
