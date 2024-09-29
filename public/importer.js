// newrelic error monitoring
const nrScript = document.createElement("script");
let nrError = null;
nrScript.src = `${host}/newrelic.js`;
nrScript.onload = () => {
  nrError = (error) => {
    newrelic.noticeError(new Error(error));
  };
};
document.head.appendChild(nrScript);

(async () => {
  // import path-specific script and stylesheets
  try {
    ["index.js", "index.css"].forEach(async (file) => {
      const url = `${host}${document.location.pathname}/${file}`;

      // check if exists first
      const response = await fetch(url, { method: "HEAD" });

      // if exists, import
      if (response.ok) {
        const tag = document.createElement(`${file === "index.js" ? "script" : "link"}`);
        tag.src = url;
        document.head.appendChild(tag);
      }
    });
  } catch (error) {
    nrError(error.message);
  }
})();
