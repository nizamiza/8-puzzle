export const handleForm = (formId, onSubmit) => {
  const form = document.getElementById(formId);
  
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onSubmit(new FormData(form));
  });
};

export const handleInput = (inputId, onChange) => {
  const input = document.getElementById(inputId);

  if (!input) return;

  input.addEventListener('change', onChange);
}
