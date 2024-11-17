// send application to airtable
const airtableApply = (record) => {
  return new Promise((resolve, reject) => {
    // get current applications
    const applications = record.get("Airtable: applications") || [];

    // push current user into current applications
    applications.push(mdcUserData.airtable.id);

    // update airtable
    base("Jobs").update(
      [
        {
          id: record.id,
          fields: {
            Status: "Applications received",
            "Airtable: applications": applications,
          },
        },
      ],
      (err, records) => {
        if (err) {
          errorHandler(`Error applying for job: ${err}`);
          reject();
        }
        resolve();
      }
    );
  });
};
