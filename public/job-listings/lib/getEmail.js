// two: pull email address from /user-account
const getEmail = (iframe) => {
  return new Promise((resolve, reject) => {
    let pollForEmail = setInterval(() => {
      let user = iframe.contentDocument || iframe.contentWindow.document;
      if (!user) {
        errorHandler("iframe couldn't be found in DOM.");
      }
      let email = user.querySelector("input[name='Email']");
      if (email && email.value) {
        clearInterval(pollForEmail);
        // return email
        resolve(email.value);
      }
    }, 300); // polls every 300ms for email address
  });
};
