const MENU_CLOSE_DURATION_MS = 350;
const HEADER_BREAKPOINT = 1200;
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_UPLOAD_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png"]);
const TOOLTIP_DELAY_MS = 100;
const FIELD_HELP_TOOLTIP_DEFAULT_TEXT =
  "You can find this information on the product label or in your purchase documents.";

function initMobileMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  if (!toggle || !mobileNav) return;

  let closeMenuTimer = null;

  const clearCloseTimer = () => {
    if (closeMenuTimer === null) return;
    window.clearTimeout(closeMenuTimer);
    closeMenuTimer = null;
  };

  const setMenuOpen = (isOpen) => {
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");

    if (isOpen) {
      clearCloseTimer();
      mobileNav.hidden = false;
      requestAnimationFrame(() => {
        mobileNav.classList.add("is-open");
      });
      return;
    }

    mobileNav.classList.remove("is-open");
    clearCloseTimer();
    closeMenuTimer = window.setTimeout(() => {
      mobileNav.hidden = true;
    }, MENU_CLOSE_DURATION_MS);
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= HEADER_BREAKPOINT) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });
}

function setFaqItemState(item, shouldOpen, animate) {
  const { faqItem, panel, trigger } = item;
  faqItem.classList.toggle("is-open", shouldOpen);
  trigger.setAttribute("aria-expanded", String(shouldOpen));

  if (shouldOpen) {
    panel.style.maxHeight = animate ? `${panel.scrollHeight}px` : "none";
    return;
  }

  if (!animate) {
    panel.style.maxHeight = "0px";
    return;
  }

  panel.style.maxHeight = `${panel.scrollHeight}px`;
  requestAnimationFrame(() => {
    panel.style.maxHeight = "0px";
  });
}

function initFaqAccordion() {
  const faqItems = Array.from(document.querySelectorAll(".faq-item__trigger"))
    .map((trigger) => {
      const faqItem = trigger.closest(".faq-item");
      const panelId = trigger.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!faqItem || !panel) return null;
      return { faqItem, panel, trigger };
    })
    .filter(Boolean);

  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const { faqItem, panel, trigger } = item;
    const isInitiallyOpen = faqItem.classList.contains("is-open");

    panel.addEventListener("transitionend", (event) => {
      if (event.propertyName !== "max-height") return;
      if (faqItem.classList.contains("is-open")) {
        panel.style.maxHeight = "none";
      }
    });

    setFaqItemState(item, isInitiallyOpen, false);

    trigger.addEventListener("click", () => {
      const shouldOpen = trigger.getAttribute("aria-expanded") !== "true";
      setFaqItemState(item, shouldOpen, true);
    });
  });

  window.addEventListener("resize", () => {
    faqItems.forEach((item) => {
      const { faqItem, panel } = item;
      if (!faqItem.classList.contains("is-open")) return;
      if (panel.style.maxHeight !== "none") {
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  });
}

function formatFileSize(sizeInBytes) {
  if (sizeInBytes >= 1024 * 1024) {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (sizeInBytes >= 1024) {
    return `${Math.round(sizeInBytes / 1024)} KB`;
  }
  return `${sizeInBytes} B`;
}

function isAllowedUploadFile(file) {
  const extension = file.name.split(".").pop();
  if (!extension) return false;
  return ALLOWED_UPLOAD_EXTENSIONS.has(extension.toLowerCase());
}

function initFileDropzones() {
  const dropzones = document.querySelectorAll("[data-file-dropzone]");
  if (!dropzones.length) return;

  dropzones.forEach((dropzone) => {
    const fileInput = dropzone.querySelector('input[type="file"]');
    const target = dropzone.querySelector("[data-dropzone-target]");
    const selectedFileBox = dropzone.querySelector("[data-dropzone-selected]");
    const fileName = dropzone.querySelector("[data-dropzone-file-name]");
    const fileSize = dropzone.querySelector("[data-dropzone-file-size]");
    const replaceButton = dropzone.querySelector("[data-dropzone-replace]");
    const removeButton = dropzone.querySelector("[data-dropzone-remove]");
    const errorText = dropzone.querySelector("[data-dropzone-error]");

    if (
      !fileInput ||
      !target ||
      !selectedFileBox ||
      !fileName ||
      !fileSize ||
      !replaceButton ||
      !removeButton ||
      !errorText
    ) {
      return;
    }

    let dragDepth = 0;

    const clearError = () => {
      errorText.textContent = "";
      errorText.hidden = true;
      target.classList.remove("is-invalid");
    };

    const showError = (message) => {
      errorText.textContent = message;
      errorText.hidden = false;
      target.classList.add("is-invalid");
    };

    const renderSelectedFile = (file) => {
      fileName.textContent = file.name;
      fileSize.textContent = formatFileSize(file.size);
      selectedFileBox.hidden = false;
      clearError();
    };

    const clearSelectedFile = () => {
      fileInput.value = "";
      selectedFileBox.hidden = true;
      fileName.textContent = "";
      fileSize.textContent = "";
      clearError();
    };

    const syncInputWithFile = (file) => {
      if (typeof DataTransfer === "undefined") return;
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
    };

    const handleFile = (file, syncInput) => {
      if (!file) return;

      if (!isAllowedUploadFile(file)) {
        showError("Only PDF, JPG, and PNG files are supported.");
        return;
      }

      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        showError("File is too large. Maximum allowed size is 10MB.");
        return;
      }

      if (syncInput) {
        syncInputWithFile(file);
      }

      renderSelectedFile(file);
    };

    const openFileDialog = () => {
      fileInput.click();
    };

    const handleDragState = (event) => {
      const transferTypes = event.dataTransfer?.types;
      return transferTypes ? Array.from(transferTypes).includes("Files") : false;
    };

    target.addEventListener("click", openFileDialog);
    replaceButton.addEventListener("click", openFileDialog);
    removeButton.addEventListener("click", clearSelectedFile);

    fileInput.addEventListener("change", () => {
      handleFile(fileInput.files?.[0], false);
    });

    target.addEventListener("dragenter", (event) => {
      if (!handleDragState(event)) return;
      event.preventDefault();
      dragDepth += 1;
      target.classList.add("is-dragover");
    });

    target.addEventListener("dragover", (event) => {
      if (!handleDragState(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    });

    target.addEventListener("dragleave", (event) => {
      if (!handleDragState(event)) return;
      event.preventDefault();
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) {
        target.classList.remove("is-dragover");
      }
    });

    target.addEventListener("drop", (event) => {
      if (!handleDragState(event)) return;
      event.preventDefault();
      dragDepth = 0;
      target.classList.remove("is-dragover");
      const droppedFile = event.dataTransfer?.files?.[0];
      handleFile(droppedFile, true);
    });

    clearSelectedFile();
  });
}

function initFieldHelpTooltips() {
  const fieldHelpItems = document.querySelectorAll(".field-help");
  if (!fieldHelpItems.length) return;

  fieldHelpItems.forEach((fieldHelp) => {
    const tooltipText = fieldHelp.dataset.tooltip?.trim() || FIELD_HELP_TOOLTIP_DEFAULT_TEXT;

    let tooltip = fieldHelp.querySelector(".field-help__tooltip");
    if (!tooltip) {
      tooltip = document.createElement("span");
      tooltip.className = "field-help__tooltip";
      tooltip.textContent = tooltipText;
      tooltip.setAttribute("role", "tooltip");
      tooltip.setAttribute("aria-hidden", "true");
      fieldHelp.appendChild(tooltip);
    }

    let showTimer = null;
    let hideTimer = null;

    const clearShowTimer = () => {
      if (showTimer === null) return;
      window.clearTimeout(showTimer);
      showTimer = null;
    };

    const clearHideTimer = () => {
      if (hideTimer === null) return;
      window.clearTimeout(hideTimer);
      hideTimer = null;
    };

    const showTooltip = () => {
      clearHideTimer();
      clearShowTimer();
      showTimer = window.setTimeout(() => {
        fieldHelp.classList.add("is-tooltip-visible");
        tooltip.setAttribute("aria-hidden", "false");
      }, TOOLTIP_DELAY_MS);
    };

    const hideTooltip = () => {
      clearShowTimer();
      clearHideTimer();
      hideTimer = window.setTimeout(() => {
        fieldHelp.classList.remove("is-tooltip-visible");
        tooltip.setAttribute("aria-hidden", "true");
      }, TOOLTIP_DELAY_MS);
    };

    fieldHelp.addEventListener("mouseenter", showTooltip);
    fieldHelp.addEventListener("mouseleave", hideTooltip);
  });
}

function initPageInteractions() {
  initMobileMenu();
  initFaqAccordion();
  initFileDropzones();
  initFieldHelpTooltips();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPageInteractions, {
    once: true,
  });
} else {
  initPageInteractions();
}
