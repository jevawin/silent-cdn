const buildJobsTables = (open, approved, received, aID, records) => {
  // hide loading row
  document.querySelectorAll(".loading").forEach((node) => (node.style.display = "none"));

  // hide empty row
  document.querySelectorAll(".empty").forEach((node) => (node.style.display = "none"));

  // loop through returned records
  records.forEach(function (record) {
    const status = (() => {
      const airtableStatus = record.get("Status");
      const airtableApplications = record.get("Airtable: applications");
      const hasApplied = airtableApplications && airtableApplications.includes(aID);
      const isApproved = hasApplied && airtableStatus === "Appointment booked";

      // no applications received
      if (airtableStatus === "Booking posted") return "open";

      // applications received - not this interpreter
      if (airtableStatus === "Applications received" && !hasApplied) return "waitlist";

      // applications received - this interpreter - not approved
      if (hasApplied && !isApproved) return "applied";

      // applications received - this interpreter - approved
      if (hasApplied && isApproved) return "approved";

      // new requests
      return null;
    })();

    // ignore new requests
    if (!status) errorHandler(`Error, this status is unknown: ${record.get("Status")}`);

    // set friendly appointment date and times
    // returns {date, start, end, atc: { buttonDate, buttonStart, buttonEnd }}
    const dateTimes = getDateTimes(
      record.get("Appointment: date"),
      record.get("Appointment: duration")
    );

    // status-dependent cta at end of row
    const button = (() => {
      switch (status) {
        case "approved":
          return buildAddToCalButton(dateTimes, record);
        case "applied":
          return `<button class="bsl-cta is-small job-apply-cta job-revoke is-red" data-revoke="true" data-record="${record.id}">✗ Revoke</button>`;
        default:
          return `<button class="bsl-cta is-small job-apply-cta" data-record="${record.id}">✎ Apply</button>`;
      }
    })();

    // generate row content
    const lookups = {
      "job-number": record.get("Request ID"),
      "job-service": record.get("Appointment: service"),
      "job-kind": record.get("Appointment: specialism"),
      "job-date": dateTimes.date,
      "job-time": `${dateTimes.start}-${dateTimes.end}`,
      "job-location": record.get("Appointment: city"),
      "job-notes": record.get("Appointment: notes"),
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
    switch (status) {
      case "applied":
        received.appendChild(newRow);
        break;
      case "approved":
        approved.appendChild(newRow);
        break;
      default:
        open.appendChild(newRow);
    }

    // show empty row if empty
    [open, approved, received].forEach((el) => {
      if (el.querySelectorAll("div.job-row").length === 4)
        el.querySelector(".job-row.empty").style.display = "block";
    });
  });
};

const buildAddToCalButton = (dateTimes, record) => {
  try {
    // buidl single line address with optional address 2
    // prettier-ignore
    const addressLine = "" +
      record.get("Appointment: address1") +
      record.get("Appointment: address 2") ? ", " + record.get("Appointment: address 2") : "" +
      ", " +
      record.get("Appointment: city") +
      ", " +
    record.get("Appointment: post code");

    // address with maps URL
    // prettier-ignore
    const address = `${addressLine} [url]https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}|(Open in Google Maps)[/url]`;

    // event description
    // prettier-ignore
    let description =
      "" +
      "[strong]Contact:[/strong] " +
      record.get("Contact: name") +
      "[br][strong]Contact number:[/strong] " +
      record.get("Contact: number") +
      "[br][strong]Address:[/strong] " +
      address;

    // append appointment notes to description if available
    if (record.get("Appointment: notes"))
      description += "[br][strong]Notes from MDC:[/strong][br]" + record.get("Appointment: notes");

    // prettier-ignore
    return `
    <add-to-calendar-button 
      name="MDC Interpreting: ${record.get("Request ID")}" 
      options="'Apple','Google', 'Outlook.com', 'iCal'" 
      location="${addressLine}" 
      startDate="${dateTimes.atc.buttonDate}" 
      endDate="${dateTimes.atc.buttonDate}" 
      startTime="${dateTimes.atc.buttonStart}" 
      endTime="${dateTimes.atc.buttonEnd}" 
      organizer="Manchester Deaf Centre|bookings@manchesterdeafcentre.com" 
      description="${description}"
      timeZone="Europe/London"
      iCalFileName="${record.get("Request ID").toLowerCase()}"
      size="6|5|4"
    ></add-to-calendar-button>`;
  } catch (error) {
    errorHandler(`Error in building addToCalButton: ${error}`);
  }
};
