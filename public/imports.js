(async () => {
  // import path-specific script
  try {
    const url = `https://silent-cdn.pages.dev${document.location.pathname}/index.js`;
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
    const url = `https://silent-cdn.pages.dev${document.location.pathname}/index.css`;
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
