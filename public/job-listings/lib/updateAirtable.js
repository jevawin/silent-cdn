// send application to airtable
const updateAirtable = (id, revoke) => {
  return new Promise((resolve, reject) => {
    base("Jobs").update(
      [
        {
          id: id,
          fields: {
            Status: revoke ? "Booking posted" : "Applications received",
            Applications: revoke ? [] : [mdcUserData.airtable.id],
          },
        },
      ],
      function (err, records) {
        if (err) {
          errorHandler(err);
          reject("Error, please call MDC");
        }
        resolve(true);
      }
    );
  });
};
