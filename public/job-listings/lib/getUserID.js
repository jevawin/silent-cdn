// three: pull user record id from airtable
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
          // save for later
          mdcUserData.airtable = {
            id: id,
          };
          // send to loadRecords
          resolve(id);
        }
      );
  });
};
