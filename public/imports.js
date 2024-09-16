/* Hosted on Cloudflare, source at https://github.com/jevawin/silent-cdn */
/* Email 07tropes.galleys@icloud.com for access */

// local dev
const host = window.localStorage.getItem("js_host") || "https://silent-cdn.pages.dev";

// newrelic error monitoring
const nrscript = document.createElement("script");
nrscript.src = `${host}/newrelic.js`;
document.head.appendChild(nrscript);

(async () => {
  // import path-specific script
  try {
    const url = `${host}${document.location.pathname}/index.js`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const scriptTag = document.createElement("script");
    scriptTag.src = url;
    document.head.appendChild(scriptTag);
  } catch (error) {
    console.log(error.message);
  }

  // import path-specific stylesheet
  try {
    const url = `${host}${document.location.pathname}/index.css`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const styleTag = document.createElement("link");
    styleTag.rel = "stylesheet";
    styleTag.href = url;
    document.head.appendChild(styleTag);
  } catch (error) {
    console.log(error.message);
  }
})();
