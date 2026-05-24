(function () {
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  if (!toggle || !mobileNav) return;
  const MENU_CLOSE_DURATION_MS = 350;
  let closeMenuTimer = null;

  function clearCloseTimer() {
    if (closeMenuTimer !== null) {
      window.clearTimeout(closeMenuTimer);
      closeMenuTimer = null;
    }
  }

  function setMenuOpen(isOpen) {
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? "Close menu" : "Open menu",
    );
    if (isOpen) {
      clearCloseTimer();
      mobileNav.hidden = false;
      requestAnimationFrame(function () {
        mobileNav.classList.add("is-open");
      });
      return;
    }

    mobileNav.classList.remove("is-open");
    clearCloseTimer();
    closeMenuTimer = window.setTimeout(function () {
      mobileNav.hidden = true;
    }, MENU_CLOSE_DURATION_MS);
  }

  toggle.addEventListener("click", function () {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  const HEADER_BREAKPOINT = 1200;

  window.addEventListener("resize", function () {
    if (window.innerWidth >= HEADER_BREAKPOINT) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });
})();
