// send application to airtable
const airtableRevoke = (id) => {
  return new Promise((resolve, reject) => {
    base("Jobs").find(id, async (error, record) => {
      if (error) {
        errorHandler(`Error finding application to revoke: ${error}`);
        reject();
      }

      // set applications to retrieved applications
      const airtableApplications = record.get("Airtable: applications");

      // remove user from applications
      airtableApplications.splice(airtableApplications.indexOf(mdcUserData.airtable.id), 1);

      // update job
      try {
        await updateJob(id, airtableApplications);
        resolve();
      } catch {
        reject();
      }
    });
  });
};

// send application to airtable
const updateJob = async (id, applications) => {
  return new Promise((resolve, reject) => {
    // update the job
    base("Jobs").update(
      [
        {
          id: id,
          fields: {
            Status: applications.length === 0 ? "Booking posted" : "Applications received",
            "Airtable: applications": applications,
          },
        },
      ],
      (error) => {
        if (error) {
          errorHandler(`Revoke error in Airtable update: ${error}`);
          reject();
        }
        resolve();
      }
    );
  });
};
