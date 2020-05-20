# Basic Editor

This editor does not have any extra functionality that it executes on its own
and it only exports a single facility for enriching the editor: the `highlight`
method.

## Installation

```html
<script src="https://tomashubelbauer.github.io/wc-editor/basic/Editor.js" type="module"></script>
<wc-editor></wc-editor>
```

```js
customElements.define('wc-editor', Editor);
```

## Usage

### `highlight`

```js
import Editor from 'https://tomashubelbauer.github.io/wc-editor/basic/Editor.js';

// <wc-editor id="codeEditor"></wc-editor>
customElements.define('wc-editor', Editor);

window.addEventListener('load', () => {
  const codeEditor = document.getElementById('codeEditor');
  codeEditor.addEventListener('change', () => {
    const split = ~~(codeEditor.value.length / 2);
    codeEditor.highlight(0, split, 'red');
    codeEditor.highlight(split, codeEditor.value.length, 'blue');
  });
});
```
