export default class Editor extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'closed' });

    this.style.position = 'relative';

    const style = this.makeStyle();

    this.div = this.makeDiv();

    this.textArea = this.makeTextArea();
    this.textArea.addEventListener('input', this.handleTextAreaInput);
    this.textArea.addEventListener('scroll', this.handleTextAreaScroll);

    shadowRoot.append(style, this.div, this.textArea);

    this.changeEvent = new CustomEvent("change");
  }

  defaultFont = 'normal 100% monospace';

  makeStyle = () => {
    const style = document.createElement('style');
    style.textContent = [
      // Define color here so that the `:placeholder-shown` rule can beat it
      'textarea { color: transparent; }',
      'textarea:placeholder-shown { color: initial; }',
    ].join('\n') + '\n';
    return style;
  };

  makeDiv = () => {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.font = this.style.font || this.defaultFont;
    div.style.whiteSpace = 'pre-wrap';
    div.style.overflowX = 'hidden';
    div.style.overflowY = 'scroll';
    return div;
  };

  makeTextArea = () => {
    const textArea = document.createElement('textarea');
    textArea.style.position = 'absolute';
    textArea.style.width = '100%';
    textArea.style.height = '100%';
    textArea.style.border = 'none';
    textArea.style.margin = 0;
    textArea.style.padding = 0;
    textArea.style.background = 'none';
    textArea.style.caretColor = 'black';
    textArea.style.font = this.style.font || this.defaultFont;
    textArea.style.resize = 'none';
    textArea.style.overflowX = 'hidden';
    textArea.style.overflowY = 'scroll';
    return textArea;
  };

  handleTextAreaInput = () => {
    const div = this.makeDiv();
    div.textContent = this.textArea.value;
    this.div.replaceWith(div);
    this.div = div;

    this.dispatchEvent(this.changeEvent);
  };

  handleTextAreaScroll = () => {
    this.div.scrollTop = this.textArea.scrollTop;
  };

  // TODO: Test this thoroughly!
  split = (index) => {
    let position = 0;
    const nodes = this.div.childNodes;
    for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
      if (index < position) {
        throw new Error(`Index cannot come before already processed position.`);
      }

      const node = nodes[nodeIndex];

      if (index === position) {
        return { before: nodes[nodeIndex - 1], after: node };
      }

      const length = node.textContent.length;

      if (index === position + length) {
        return { before: node, after: nodes[nodeIndex + 1] };
      }

      // Keep looking until we come across the node intersected or neighbored by the index
      if (index > position + length) {
        position += length;
        continue;
      }

      /* Split the node into two and replace it with the split parts */

      const text = node.textContent;
      const before = document.createTextNode(text.slice(0, index - position));
      const after = document.createTextNode(text.slice(index - position));
      node.replaceWith(before, after);
      return { before, after };
    }
  };

  highlight = (start, end, color) => {
    if (start === end) {
      return;
    }

    this.split(start);
    let { before: node } = this.split(end);
    if (node.nodeType === 3) {
      const element = document.createElement('span');
      element.textContent = node.textContent;
      node.replaceWith(element);
      node = element;
    }

    node.style.color = color;
  };

  get placeholder() {
    return this.textArea.placeholder;
  }

  set placeholder(value) {
    this.textArea.placeholder = value;
  }

  get value() {
    return this.textArea.value;
  }

  set value(value) {
    this.textArea.value = value;
    this.handleTextAreaInput();
  }

  static get observedAttributes() {
    return ['placeholder', 'value'];
  }

  select(index, length) {
    this.textArea.setSelectionRange(index, index + length);
    this.textArea.focus();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'placeholder': {
        this.placeholder = newValue;
        break;
      }
    }
  }
}
