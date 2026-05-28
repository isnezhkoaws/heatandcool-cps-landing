const REQUIRED_FIELD_ERROR_TEXT = "The field is required";
const EMAIL_FIELD_ERROR_TEXT = "Please enter a valid email address";
const DATE_FIELD_LENGTH_ERROR_TEXT = "Date must be 10 characters (MM/DD/YYYY)";
const DATE_FIELD_ERROR_TEXT = "Please enter a valid date (MM/DD/YYYY)";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_PATTERN = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;

function getValidationEventName(field) {
  if (field.tagName === "SELECT") return "change";
  if (field.type === "checkbox" || field.type === "radio") return "change";
  return "input";
}

function isSelectPlaceholderValue(field) {
  if (field.tagName !== "SELECT") return false;
  return field.value === "" || field.value === "none";
}

function isFieldEmpty(field, form) {
  if (field.type === "checkbox") {
    return !field.checked;
  }

  if (field.type === "radio") {
    if (!field.name) return !field.checked;
    return !form.querySelector(`input[type="radio"][name="${field.name}"]:checked`);
  }

  if (isSelectPlaceholderValue(field)) {
    return true;
  }

  return field.value.trim() === "";
}

function ensureFieldErrorNode(formField) {
  let errorNode = formField.querySelector(".form-field__error");
  if (errorNode) return errorNode;

  errorNode = document.createElement("p");
  errorNode.className = "form-field__error";
  errorNode.hidden = true;
  formField.append(errorNode);
  return errorNode;
}

function setFieldError(formField, message) {
  const errorNode = ensureFieldErrorNode(formField);
  formField.classList.add("form-field--invalid");
  errorNode.textContent = message;
  errorNode.hidden = false;
}

function clearFieldError(formField) {
  const errorNode = ensureFieldErrorNode(formField);
  formField.classList.remove("form-field--invalid");
  errorNode.textContent = "";
  errorNode.hidden = true;
}

function validateField(field, form) {
  const formField = field.closest(".form-field");
  if (!formField || field.disabled) return true;

  if (field.required && isFieldEmpty(field, form)) {
    setFieldError(formField, REQUIRED_FIELD_ERROR_TEXT);
    return false;
  }

  if (field.type === "email") {
    const emailValue = field.value.trim();
    if (emailValue && !EMAIL_PATTERN.test(emailValue)) {
      setFieldError(formField, EMAIL_FIELD_ERROR_TEXT);
      return false;
    }
  }

  if (field.id === "purchase-date") {
    const dateValue = field.value.trim();
    if (dateValue.length !== 10) {
      setFieldError(formField, DATE_FIELD_LENGTH_ERROR_TEXT);
      return false;
    }

    if (!DATE_PATTERN.test(dateValue)) {
      setFieldError(formField, DATE_FIELD_ERROR_TEXT);
      return false;
    }

    const [monthText, dayText, yearText] = dateValue.split("/");
    const month = Number(monthText);
    const day = Number(dayText);
    const year = Number(yearText);
    const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const daysInMonth = [
      31,
      isLeapYear ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];

    if (month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
      setFieldError(formField, DATE_FIELD_ERROR_TEXT);
      return false;
    }
  }

  clearFieldError(formField);
  return true;
}

function getValidatableFields(form) {
  return Array.from(form.querySelectorAll("input, select, textarea")).filter((field) => {
    if (field.type === "hidden") return false;
    if (field.type === "file") return false;
    return Boolean(field.closest(".form-field"));
  });
}

function initWarrantyFormValidation() {
  const form = document.querySelector(".warranty-form");
  if (!form) return;

  form.setAttribute("novalidate", "novalidate");

  const fields = getValidatableFields(form);

  fields.forEach((field) => {
    const formField = field.closest(".form-field");
    if (!formField) return;

    ensureFieldErrorNode(formField);

    const eventName = getValidationEventName(field);
    field.addEventListener(eventName, () => {
      if (!formField.classList.contains("form-field--invalid")) return;
      validateField(field, form);
    });

    if (eventName !== "change") {
      field.addEventListener("change", () => {
        if (!formField.classList.contains("form-field--invalid")) return;
        validateField(field, form);
      });
    }
  });

  form.addEventListener("submit", (event) => {
    let isFormValid = true;

    fields.forEach((field) => {
      const isFieldValid = validateField(field, form);
      if (!isFieldValid) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      event.preventDefault();

      const firstInvalidField = form.querySelector(".form-field--invalid input, .form-field--invalid select, .form-field--invalid textarea");
      firstInvalidField?.focus();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWarrantyFormValidation, {
    once: true,
  });
} else {
  initWarrantyFormValidation();
}
