(function () {
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  if (toggle && mobileNav) {
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
  }

  const faqTriggers = document.querySelectorAll(".faq-item__trigger");
  if (!faqTriggers.length) return;

  function openFaqItem(faqItem, panel, trigger, animate) {
    faqItem.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    if (!animate) {
      panel.style.maxHeight = "none";
      return;
    }
    panel.style.maxHeight = panel.scrollHeight + "px";
  }

  function closeFaqItem(faqItem, panel, trigger, animate) {
    faqItem.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    if (!animate) {
      panel.style.maxHeight = "0px";
      return;
    }
    panel.style.maxHeight = panel.scrollHeight + "px";
    requestAnimationFrame(function () {
      panel.style.maxHeight = "0px";
    });
  }

  faqTriggers.forEach(function (trigger) {
    const faqItem = trigger.closest(".faq-item");
    const panelId = trigger.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;
    if (!faqItem || !panel) return;
    const isInitiallyOpen = faqItem.classList.contains("is-open");

    panel.addEventListener("transitionend", function (event) {
      if (event.propertyName !== "max-height") return;
      if (faqItem.classList.contains("is-open")) {
        panel.style.maxHeight = "none";
      }
    });

    if (isInitiallyOpen) {
      trigger.setAttribute("aria-expanded", "true");
      panel.style.maxHeight = "none";
    } else {
      trigger.setAttribute("aria-expanded", "false");
      panel.style.maxHeight = "0px";
    }

    trigger.addEventListener("click", function () {
      const faqItem = trigger.closest(".faq-item");
      const panelId = trigger.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!faqItem || !panel) return;

      const shouldOpen = trigger.getAttribute("aria-expanded") !== "true";
      if (shouldOpen) {
        openFaqItem(faqItem, panel, trigger, true);
      } else {
        closeFaqItem(faqItem, panel, trigger, true);
      }
    });
  });

  window.addEventListener("resize", function () {
    faqTriggers.forEach(function (trigger) {
      const faqItem = trigger.closest(".faq-item");
      const panelId = trigger.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!faqItem || !panel || !faqItem.classList.contains("is-open")) return;
      if (panel.style.maxHeight !== "none") {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
})();
