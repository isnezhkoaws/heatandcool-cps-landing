function formatCentsToCurrency(rawDigits) {
  if (!rawDigits) return "";
  const cents = Number(rawDigits);
  return `$${(cents / 100).toFixed(2)}`;
}

function normalizeDigits(value) {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

function normalizeDateDigits(value) {
  return value.replace(/\D/g, "").slice(0, 8);
}

function formatDateDigits(rawDigits) {
  if (!rawDigits) return "";

  const month = rawDigits.slice(0, 2);
  const day = rawDigits.slice(2, 4);
  const year = rawDigits.slice(4, 8);

  if (rawDigits.length <= 2) return month;
  if (rawDigits.length <= 4) return `${month}/${day}`;
  return `${month}/${day}/${year}`;
}

function initPurchasePriceMask() {
  const input = document.getElementById("purchase-price");
  if (!input) return;

  let rawDigits = normalizeDigits(input.value);

  const render = () => {
    input.value = formatCentsToCurrency(rawDigits);
  };

  const appendDigits = (digits) => {
    if (!digits) return;
    rawDigits = normalizeDigits(rawDigits + digits);
    render();
  };

  input.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const isDigitKey = /^[0-9]$/.test(event.key);
    const hasSelection =
      input.selectionStart !== null &&
      input.selectionEnd !== null &&
      input.selectionStart !== input.selectionEnd;

    if (isDigitKey) {
      event.preventDefault();
      if (hasSelection) {
        rawDigits = "";
      }
      appendDigits(event.key);
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      if (hasSelection) {
        rawDigits = "";
      } else {
        rawDigits = rawDigits.slice(0, -1);
      }
      render();
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      rawDigits = "";
      render();
      return;
    }

    const allowedKeys = new Set([
      "Tab",
      "Enter",
      "Escape",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ]);

    if (!allowedKeys.has(event.key)) {
      event.preventDefault();
    }
  });

  input.addEventListener("paste", (event) => {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData("text") || "";
    const pastedDigits = normalizeDigits(pastedText);

    const hasSelection =
      input.selectionStart !== null &&
      input.selectionEnd !== null &&
      input.selectionStart !== input.selectionEnd;

    if (hasSelection) {
      rawDigits = "";
    }

    appendDigits(pastedDigits);
  });

  input.addEventListener("cut", (event) => {
    event.preventDefault();
    rawDigits = "";
    render();
  });

  input.addEventListener("input", () => {
    rawDigits = normalizeDigits(input.value);
    render();
  });

  render();
}

function initPurchaseDateMask() {
  const input = document.getElementById("purchase-date");
  if (!input) return;

  input.setAttribute("maxlength", "10");

  const allowedKeys = new Set([
    "Tab",
    "Enter",
    "Escape",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
    "Backspace",
    "Delete",
  ]);

  const render = () => {
    const rawDigits = normalizeDateDigits(input.value);
    input.value = formatDateDigits(rawDigits);
  };

  input.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^[0-9]$/.test(event.key)) return;
    if (allowedKeys.has(event.key)) return;
    event.preventDefault();
  });

  input.addEventListener("paste", (event) => {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData("text") || "";
    input.value = formatDateDigits(normalizeDateDigits(pastedText));
  });

  input.addEventListener("input", render);
  render();
}

function initInputMasks() {
  initPurchasePriceMask();
  initPurchaseDateMask();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initInputMasks, {
    once: true,
  });
} else {
  initInputMasks();
}
