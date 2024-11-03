const buildJobsTables = (open, approved, received, aID, records) => {
  // hide loading row
  document.querySelectorAll(".loading").forEach((node) => (node.style.display = "none"));

  // hide empty row
  document.querySelectorAll(".empty").forEach((node) => (node.style.display = "none"));

  // loop through returned records
  records.forEach(function (record) {
    const isOpen = record.get("Status") === ("Booking posted" || "Applications received");
    const hasApplied =
      typeof record.get("Airtable: applications") !== "undefined" &&
      record.get("Airtable: applications").includes(aID);
    const isApproved = hasApplied && record.get("Status") === "Appointment booked";
    // if applied but not current user, ignore (TODO: waitlist)
    if (isOpen || hasApplied) {
      // set friendly appointment date and times
      // returns {date, start, end, atc: { buttonDate, buttonStart, buttonEnd }}
      const dateTimes = getDateTimes(
        record.get("Appointment: date"),
        record.get("Appointment: duration")
      );
      const addressLine = `${record.get("Appointment: address1")}${
        record.get("Appointment: address 2") ? ", " + record.get("Appointment: address 2") : ""
      }, ${record.get("Appointment: city")}, ${record.get("Appointment: post code")}`;
      const address = `${addressLine} [url]https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        addressLine
      )}|(Open in Google Maps)[/url]`;
      const description = `[strong]Contact:[/strong] ${record.get(
        "Contact: name"
      )}[br][strong]Contact number:[/strong] ${record.get(
        "Contact: number"
      )}[br][strong]Address:[/strong] ${address}${
        record.get("Appointment: notes")
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
                    organizer="Manchester Deaf Centre|bookings@manchesterdeafcentre.com" 
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
      if (isOpen) {
        open.appendChild(newRow);
      } else if (hasApplied && isApproved) {
        approved.appendChild(newRow);
      } else {
        received.appendChild(newRow);
      }
    }
  });

  // show empty row if empty
  [open, approved, received].forEach((el) => {
    if (el.querySelectorAll("div.job-row").length === 4)
      el.querySelector(".job-row.empty").style.display = "block";
  });
};
