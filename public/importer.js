// newrelic error monitoring
const nrScript = document.createElement("script");
let nrError = null;
nrScript.src = `${host}/newrelic.js`;
nrScript.onload = () => {
  nrError = (error) => {
    if (window.localStorage.getItem("js_host")) {
      // dev mode, console log error
      console.error(error);
    } else {
      // send error to new relic
      newrelic.noticeError(new Error(error));
    }
  };
};
document.head.appendChild(nrScript);

(async () => {
  // import path-specific script and stylesheets
  ["index.js", "index.css"].forEach(async (file) => {
    const url = `${host}${document.location.pathname}/${file}`;

    try {
      // check if exists first
      const response = await fetch(url, { method: "HEAD" });
    } catch (error) {
      nrError(error.message);
    }

    // if exists, import
    if (response.ok) {
      const tag = document.createElement(`${file === "index.js" ? "script" : "link"}`);
      if (tag.nodeName === "SCRIPT") {
        // scripts
        tag.src = url;
      } else {
        // stylesheets
        tag.rel = "stylesheet";
        tag.href = url;
      }
      document.head.appendChild(tag);
    }
  });
})();
