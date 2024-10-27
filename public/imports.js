/* Hosted on Cloudflare, source at https://github.com/jevawin/silent-cdn */
/* Email 07tropes.galleys@icloud.com for access */

// staging || production
let host =
  location.hostname === "www.manchesterdeafcentre.com"
    ? "https://silent-cdn.pages.dev"
    : "https://staging.silent-cdn.pages.dev";

// local dev override
window.localStorage.getItem("js_host") || host;

// don't run in iframes
if (window.top.location.pathname === document.location.pathname) {
  // importer
  const importer = document.createElement("script");
  importer.src = `${host}/importer.js`;
  document.head.appendChild(importer);
}
