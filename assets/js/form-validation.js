const REQUIRED_FIELD_ERROR_TEXT = "The field is required";
const EMAIL_FIELD_ERROR_TEXT = "Please enter a valid email address";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
