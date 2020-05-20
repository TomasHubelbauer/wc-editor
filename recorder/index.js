window.addEventListener('load', () => {
  /** @type {HTMLTextAreaElement} */
  const codeTextArea = document.getElementById('codeTextArea');

  /** @type {HTMLInputElement} */
  const sequenceInput = document.getElementById('sequenceInput');

  // Clear browser-remembered values
  codeTextArea.value = '';
  sequenceInput.value = '';

  codeTextArea.addEventListener('keydown', event => {
    sequenceInput.value += ' ↓' + event.key;
  });

  codeTextArea.addEventListener('keypress', event => {
    sequenceInput.value += ' ' + event.key;
  });

  codeTextArea.addEventListener('keyup', event => {
    sequenceInput.value += ' ' + event.key + '↑';
  });

  codeTextArea.addEventListener('selectionchange', event => {
    sequenceInput.value += ` (${codeTextArea.selectionStart}-${codeTextArea.selectionEnd}, ${codeTextArea.selectionDirection})`;
  });

  sequenceInput.addEventListener('click', () => {
    sequenceInput.value = sequenceInput.value.trim();
    sequenceInput.select();
    navigator.clipboard.writeText(sequenceInput.value);
    document.body.append('Copied to the clipboard.');
  });
});
