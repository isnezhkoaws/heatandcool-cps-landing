function stringifyFormValue(value) {
  if (value instanceof File) {
    if (!value.name) return "(no file)";
    return `${value.name} (${value.type || "unknown type"}, ${value.size} bytes)`;
  }
  return String(value);
}

function renderFormData(target, formData) {
  const entries = Array.from(formData.entries());
  target.innerHTML = "";

  if (!entries.length) {
    target.textContent = "No form data";
    return;
  }

  const list = document.createElement("ul");
  entries.forEach(([key, value]) => {
    const item = document.createElement("li");
    item.textContent = `${key}: ${stringifyFormValue(value)}`;
    list.append(item);
  });

  target.append(list);
}

function initFormDataTest() {
  const form = document.querySelector(".warranty-form");
  const output = document.querySelector(".accepted-form-data");
  if (!form || !output) return;

  form.addEventListener("submit", (event) => {
    if (event.defaultPrevented || form.querySelector(".form-field--invalid")) {
      output.innerHTML = "";
      return;
    }

    event.preventDefault();
    const formData = new FormData(form);
    renderFormData(output, formData);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFormDataTest, { once: true });
} else {
  initFormDataTest();
}
