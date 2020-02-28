import Renderer from './Renderer.js';

export default class Editor extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'closed' });

    const font = this.style.font || 'normal 16px monospace';

    this.style.position = 'relative';
    this.styles = document.createElement('style');
    this.styles.textContent = [
      'textarea { color: transparent; }',
      'textarea:placeholder-shown { color: initial; }',

      // Debug
      'span { outline: 1px solid black; }'
    ].join('\n') + '\n';

    this.div = document.createElement('div');
    this.div.style.position = 'absolute';
    this.div.style.width = '100%';
    this.div.style.height = '100%';
    this.div.style.font = font;
    this.div.style.whiteSpace = 'pre-wrap';
    this.div.style.overflowX = 'hidden';
    this.div.style.overflowY = 'scroll';

    this.textArea = document.createElement('textarea');
    this.textArea.style.position = 'absolute';
    this.textArea.style.width = '100%';
    this.textArea.style.height = '100%';
    this.textArea.style.border = 'none';
    this.textArea.style.margin = 0;
    this.textArea.style.padding = 0;
    this.textArea.style.background = 'none';
    this.textArea.style.caretColor = 'black';
    this.textArea.style.font = font;
    this.textArea.style.resize = 'none';
    this.textArea.style.overflowX = 'hidden';
    this.textArea.style.overflowY = 'scroll';

    this.textArea.addEventListener('keydown', this.handleTextAreaKeyDown);
    this.textArea.addEventListener('keypress', this.handleTextAreaKeyPress);
    this.textArea.addEventListener('keyup', this.handleTextAreaKeyUp);

    this.textArea.addEventListener('scroll', this.handleTextAreaScroll);

    shadowRoot.append(this.styles, this.div, this.textArea);

    // TODO: Accept this from the user and handle resetting it gracefully
    // TODO: Allow having no renderer and reduce self to the text area only
    this.renderer = new Renderer(this);

    this.value = '';
    this.selectionStart = 0;
    this.selectionEnd = 0;
    this.selectionDirection = 'forward';
    this.isShiftHeld = false;
    this.isCtrlHeld = false;
    this.isAltHeld = false;
    this.isMetaHeld = false;
    this.state = { type: undefined };
  }

  handleTextAreaKeyDown = (/** @type {KeyboardEvent} */ event) => {
    console.log('down', event.key);
    if (this.state) {
      if (this.state.type === 'down') {
        if (!this.isShiftHeld) {
          throw new Error('Key down must not be followed by another key down unless the prior was a special key.');
        }
      }
    }

    if (event.shiftKey) {
      if (!this.isShiftHeld) {
        if (event.key !== 'Shift') {
          throw new Error('The key must be shift if the shift key modifier is reported.');
        }

        this.isShiftHeld = true;
      }
    }

    if (this.value !== this.textArea.value) {
      throw new Error('The value has changed unexpectedly.');
    }

    if (this.selectionStart !== this.textArea.selectionStart) {
      throw new Error('The selection start has changed unexpectedly.');
    }

    if (this.selectionEnd !== this.textArea.selectionEnd) {
      throw new Error('The selection end has changed unexpectedly.');
    }

    if (this.selectionDirection !== this.textArea.selectionDirection) {
      throw new Error('The selection direction has changed unexpectedly.');
    }

    this.state = { type: 'down', key: event.key };
  };

  handleTextAreaKeyPress = (/** @type {KeyboardEvent} */ event) => {
    console.log('press', event.key);

    /* Assert that key press happens only for character keys not special keys */

    if (event.shiftKey && event.key === 'Shift') {
      throw new Error('Key press must not happen for special keys.');
    }

    if (event.ctrlKey && event.key === 'Ctrl') {
      throw new Error('Key press must not happen for special keys.');
    }

    if (event.altKey && event.key === 'Alt') {
      throw new Error('Key press must not happen for special keys.');
    }

    if (event.metaKey && event.key === 'Meta') {
      throw new Error('Key press must not happen for special keys.');
    }

    switch (this.state.type) {
      case 'down': {
        if (event.key !== this.state.key) {
          throw new Error('Character key press must follow key down with the same characte.');
        }

        this.state = { type: 'press', key: event.key };
        break;
      }
      default: {
        throw new Error('Key press must follow key down.');
      }
    }
  };

  handleTextAreaKeyUp = (/** @type {KeyboardEvent} */ event) => {
    console.log('up', event.key);
    switch (this.state.type) {
      case 'press': {
        /* Assert that down-press-up happens only for character keys not special keys */
        if (this.state.key === 'Shift' || this.state.key === 'Ctrl' || this.state.key === 'Alt' || this.state.key === 'Meta') {
          throw new Error('TODO');
        }

        if (this.isShiftHeld && event.key === 'Shift') {
          this.isShiftHeld = false;
          return;
        }

        if (this.isCtrlHeld && event.key === 'Ctrl') {
          this.isCtrlHeld = false;
          return;
        }

        if (this.isAltHeld && event.key === 'Alt') {
          this.isAltHeld = false;
          return;
        }

        if (this.isMetaHeld && event.key === 'Meta') {
          this.isMetaHeld = false;
          return;
        }

        // Handle typing at the caret
        if (this.selectionStart === this.selectionEnd) {
          // Assert no selection was made
          // TODO: Support this happening when holding shift
          if (this.textArea.selectionStart !== this.textArea.selectionEnd) {
            throw new Error('TODO');
          }

          // TODO: 1 for characters 2 for emoji?
          const delta = this.textArea.selectionStart - this.selectionStart;
          if (delta <= 0) {
            throw new Error('TODO ' + delta);
          }

          if (delta !== event.key.length) {
            throw new Error('TODO ' + event.key);
          }

          if (delta === 1) {
            if (this.selectionStart === this.value.length) {
              this.renderer.append(delta);
            }
            else {
              // TODO: Extend the current token
            }
          }
          else {
            throw new Error('TODO');
          }

          this.selectionStart = this.textArea.selectionStart;
          this.selectionEnd = this.textArea.selectionEnd;
          this.selectionDirection = this.textArea.selectionDirection;
        }

        // Handle replacing selection with a caret and typing at the caret
        else {
          throw new Error('TODO');
        }

        this.value = this.textArea.value;
        break;
      }
      case 'down': {
        // Assert that down-up happens only for special keys not for character keys
        if (!event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
          throw new Error('Special key up must follow key down.');
        }

        // TODO
        break;
      }
      default: {
        throw new Error('Key up must follow key press or key down.');
      }
    }
  };

  // TODO: Display scroll event with first highlight token visible for scroll sync
  handleTextAreaScroll = () => {
    this.div.scrollTop = this.textArea.scrollTop;
  };

  get placeholder() {
    return this.textArea.placeholder;
  }

  set placeholder(value) {
    this.textArea.placeholder = value;
  }

  static get observedAttributes() {
    return ['placeholder'];
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
