// Applies the saved light/dark choice before the page paints, so there is no flash. No choice = follow the system.
(function () {
  try {
    var t = localStorage.getItem("purna.theme");
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
  } catch (e) { /* private mode: follow the system */ }
})();
