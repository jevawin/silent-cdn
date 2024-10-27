/*
 * 1. npm run dev
 * 2. Identify localhost port
 * 3. Replace below
 * 4. Create a bookmark called "dev toggle" with code below
 * 5. Use it to toggle dev mode (local server must be running)
 */
// Must be single line
// prettier-ignore
javascript: if (localStorage.getItem("js_host")) { localStorage.removeItem("js_host"); alert("Prod") } else { localStorage.setItem("js_host", "http://localhost:8788"); alert("Dev") }
