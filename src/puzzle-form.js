/**
 * @param {string} formId 
 * @param {(formData: FormData) => any} onSubmit 
 */
export const handleForm = (formId, onSubmit) => {
  const form = document.getElementById(formId);
  
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onSubmit(new FormData(form));
  });
};

/**
 * @param {string} inputId 
 * @param {(event: InputEvent) => any} onChange 
 */
export const handleInput = (inputId, onChange) => {
  const input = document.getElementById(inputId);
  input.addEventListener('change', onChange);
}
