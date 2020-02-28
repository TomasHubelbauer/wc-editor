export default class Renderer {
  constructor(/** @type {Editor} */ editor) {
    this.editor = editor;
  }

  append(length) {
    if (this.editor.div.children.length === 0) {
      const span = document.createElement('span');
      span.dataset.index = 0;
      span.dataset.length = length;
      span.textContent = this.editor.textArea.value.slice(0, length);
      this.editor.div.append(span);
      return;
    }

    this.extend(this.editor.div.children[this.editor.div.children.length - 1], length);
  }

  extend(child, length) {
    const index = Number(child.dataset.index);
    length = Number(child.dataset.length) + length;
    child.dataset.length = length;
    child.textContent = this.editor.textArea.value.slice(index, length);
  }
}
