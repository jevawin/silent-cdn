/* Hosted on Cloudflare, source at https://github.com/jevawin/silent-cdn */
/* Email 07tropes.galleys@icloud.com for access */

// local dev
const host = window.localStorage.getItem("js_host") || "https://silent-cdn.pages.dev";

// don't run in iframes
if (window.top.location.pathname === document.location.pathname) {
  // importer
  const importer = document.createElement("script");
  importer.src = `${host}/importer.js`;
  document.head.appendChild(importer);
}