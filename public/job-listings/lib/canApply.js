// check application status
const canApply = (id) => {
  return new Promise((resolve, reject) => {
    try {
      base("Jobs").find(id, (error, record) => {
        // notify user to call if errors
        if (error) {
          errorHandler(`Error finding job in canApply: ${error}`);
          reject();
        }
        // check not already booked
        if (record.get("Status") === "Appointment booked") resolve("unavailable");

        // check user not already applied
        if (record.get("Airtable: applications")?.includes(mdcUserData.airtable.id))
          resolve("applied");

        // resolve and send record back
        resolve(record);
      });
    } catch (error) {
      errorHandler(`Error in canApply: ${error}`);
    }
  });
};
