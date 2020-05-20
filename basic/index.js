import Editor from './Editor.js';

customElements.define('wc-editor', Editor);

window.addEventListener('load', () => {
  const codeEditor = document.getElementById('codeEditor');
  codeEditor.addEventListener('change', () => {
    const split = ~~(codeEditor.value.length / 2);
    codeEditor.highlight(0, split, 'red');
    codeEditor.highlight(split, codeEditor.value.length, 'blue');
  });
});
