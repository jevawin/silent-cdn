/* Hosted on Cloudflare, source at https://github.com/jevawin/silent-cdn */
/* Email 07tropes.galleys@icloud.com for access */
(async () => {
  // local dev
  // const host = document.querySelector("[data-js-imports-host]").dataset.jsImportsHost;
  const host = window.localStorage.getItem("js_host") || "https://silent-cdn.pages.dev";

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
