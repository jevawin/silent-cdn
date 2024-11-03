// check application status
const canApply = (id) => {
  return new Promise((resolve, reject) => {
    base("Jobs").find(id, function (err, record) {
      if (err) {
        errorHandler(err);
        reject("Error, please call MDC");
      }
      if (
        record.get("Status") === "Booking posted" ||
        record.get("Airtable: applications").includes(mdcUserData.airtable.id)
      )
        resolve(true);
    });
  });
};
