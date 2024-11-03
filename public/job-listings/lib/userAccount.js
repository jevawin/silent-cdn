// one: inject user account iframe
const userAccount = () => {
  return new Promise((resolve, reject) => {
    document.body.insertAdjacentHTML(
      "beforeend",
      "<iframe style='display:none;' data-user src='/user-account'/>"
    );
    let iframe = document.querySelector("[data-user]");
    iframe.addEventListener("load", resolve(iframe));
  });
};
