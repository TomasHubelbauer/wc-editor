window.addEventListener('load', () => {
  /** @type {HTMLTextAreaElement} */
  const puppetTextArea = document.getElementById('puppetTextArea');

  /** @type {HTMLDListElement} */
  const selectionStartDd = document.getElementById('selectionStartDd');

  /** @type {HTMLDListElement} */
  const selectionEndDd = document.getElementById('selectionEndDd');

  /** @type {HTMLDListElement} */
  const selectionDirectionDd = document.getElementById('selectionDirectionDd');

  /** @type {HTMLOListElement} */
  const changeOl = document.getElementById('changeOl');

  /** @type {HTMLTextAreaElement} */
  const mirrorTextArea = document.getElementById('mirrorTextArea');

  // TODO: Detect and handle this state (by treating it as a paste?)
  // Clear browser-remembered form values to start from a known state
  puppetTextArea.value = '';
  mirrorTextArea.value = '';

  puppetTextArea.focus();

  const logger = new Logger(changeOl);
  const rebuilder = new Rebuilder(puppetTextArea, mirrorTextArea);

  /** @typedef {{ type: 'type'; value: string; } | { type: 'move'; delta: number; } | { type: 'clear'; delta: number; }} Change */

  /** @type {string} */
  let value;

  let selectionStart;
  let selectionEnd;
  let selectionDirection;

  function raiseChange(change) {
    logger.handle(change);
    rebuilder.handle(change);
    selectionStartDd.textContent = selectionStart;
    selectionEndDd.textContent = selectionEnd;
    selectionDirectionDd.textContent = selectionDirection;
  }

  let holdsShift = false;
  let holdsCtrl = false;
  let holdsAlt = false;
  let holdsMeta = false;

  /** @type {KeyboardEvent} */
  let keyDownEvent;

  /** @type {KeyboardEvent} */
  let keyPressEvent;

  puppetTextArea.addEventListener('keydown', event => {
    value = puppetTextArea.value;
    selectionStart = puppetTextArea.selectionStart;
    selectionEnd = puppetTextArea.selectionEnd;
    selectionDirection = puppetTextArea.selectionDirection;

    // Track Shift key press separately from the character key press
    if (event.key === 'Shift' && event.shiftKey) {
      holdsShift = true;
      return;
    }

    // Track Ctrl key press separately from the character key press
    if (event.key === 'Ctrl' && event.ctrlKey) {
      holdsCtrl = true;
      return;
    }

    // Track Alt key press separately from the character key press
    if (event.key === 'Alt' && event.altKey) {
      holdsAlt = true;
      return;
    }

    // Track Meta key press separately from the character key press
    if (event.key === 'Meta' && event.metaKey) {
      holdsMeta = true;
      return;
    }

    keyDownEvent = event;
    keyPressEvent = undefined;
  });

  puppetTextArea.addEventListener('keypress', event => {
    keyPressEvent = event;
  });

  puppetTextArea.addEventListener('keyup', event => {
    if (event.key === 'Shift' && holdsShift) {
      holdsShift = false;
      return;
    }

    if (event.key === 'Ctrl' && holdsCtrl) {
      holdsCtrl = false;
      return;
    }

    if (event.key === 'Alt' && holdsAlt) {
      holdsAlt = false;
      return;
    }

    if (event.key === 'Meta' && holdsMeta) {
      holdsMeta = false;
      return;
    }

    // Assert that the correct key sequence has led up to this handler
    if (!keyDownEvent) {
      throw new Error(`Key down event did not lead up to the key up event with key '${event.key}'!`);
    }

    // Handle changes happening from no selection
    if (selectionStart === selectionEnd) {
      // Handle changes that do not introduce a selection where there wasn't one
      if (puppetTextArea.selectionStart === puppetTextArea.selectionEnd) {
        const delta = puppetTextArea.selectionStart - selectionStart;

        // Assert that the key down event of the journey corresponds to this up
        if (keyDownEvent.key !== event.key) {
          // Ignore the key mismatch if it was caused by letter case due to shift
          if (keyDownEvent.shiftKey && event.key.toUpperCase() !== keyDownEvent.key) {
            throw new Error(`Mismatching keys in the down-up key journey: ${keyDownEvent.key}-${event.key}.`);
          }
        }

        // Handle a character key event
        if (keyPressEvent) {
          // Assert that the key press event of the journey corresponds to this up
          if (keyPressEvent.key !== event.key) {
            // Ignore the key mismatch if it was caused by letter case due to shift
            if (keyDownEvent.shiftKey && event.key.toUpperCase() !== keyDownEvent.key) {
              throw new Error(`Mismatching keys in the down-press-up key journey: ${keyDownEvent.key}-${keyPressEvent.key}-${event.key}.`);
            }
          }

          // Assert that while typing the cursor and value advanced by a character
          // TODO: Handle emoji and other multi-byte characters
          if (delta !== 1) {
            throw new Error(`Unexpected advancement by ${delta} while typing.`);
          }

          let value = event.key;
          if (event.key === 'Enter') {
            value = '\n';
          }

          selectionStart++;
          selectionEnd++;
          selectionDirection = 'forward';
          raiseChange({ type: 'type', value });
        }

        // Handle a control key event
        else {
          switch (event.key) {
            // Assert and report the caret moving by one towards the start of the value
            case 'ArrowLeft': {
              // Ignore an attempt to move while at the start of the value
              if (delta === 0 && selectionStart === 0) {
                // Ignore
              }

              // Assert that the caret moved by one towards the start
              else if (delta !== -1) {
                throw new Error(`Unexpected move by ${delta} not one while selecting.`);
              }

              // Report the move towards the start
              else {
                selectionStart--;
                selectionEnd--;
                selectionDirection = 'forward';
                raiseChange({ type: 'move', delta });
              }

              break;
            }

            // Assert and report the caret moving by one towards the end of the value
            case 'ArrowRight': {
              // Ignore an attempt to move while at the end of the value
              if (delta === 0 && selectionStart === value.length) {
                // Ignore
              }

              // Assert that the cared moved by one towards the end
              else if (delta !== 1) {
                throw new Error(`Unexpected move by ${delta} not one while selecting.`);
              }

              // Report the move towards the end and update the selection mirror
              else {
                selectionStart++;
                selectionEnd++;
                selectionDirection = 'forward';
                raiseChange({ type: 'move', delta });
              }

              break;
            }

            // Assert and report the caret moving by one towards the start and removing
            case 'Backspace': {
              // Ignore backspace being pressed at the start of the value to no effect
              if (delta === 0 && selectionStart === 0) {
                // Ignore
              }

              // Assert that the backspace moves the caret by one towards the start
              else if (delta !== -1 || puppetTextArea.value.length !== value.length - 1) {
                throw new Error('The backspace key did not have the expected effect.');
              }

              // Report the change
              else {
                selectionStart--;
                selectionEnd--;
                selectionDirection = 'forward';
                raiseChange({ type: 'clear', delta });
              }

              break;
            }

            // Report an unimplemented control key
            default: {
              throw new Error(`Unimplemented control key encountered: ${event.key}.`);
            }
          }
        }
      }
      // Handle changes that introduce a selection where there wasn't one
      else {
        throw new Error('TODO');
      }
    }

    // Handle changes happening from a selection
    else {
      // Handle the selection collapsing (either do to typing or navigation)
      if (puppetTextArea.selectionStart === puppetTextArea.selectionEnd) {
        // TODO: Compare value lengths first and then characters around cursor (perf)
        // Handle the selection collapsing due to arrow key navigation
        if (value === puppetTextArea.value) {
          throw new Error('TODO');
        }

        // Handle the selection collapsing due to typing or pasting
        else {
          throw new Error('TODO');
        }
      }

      // Handle selection growing or shrinking due to navigation or pasting
      else {
        switch (event.key) {
          case 'ArrowLeft': {
            if (!holdsShift) {
              throw new Error('Unexpected selection introduction by left arrow without shift key.');
            }

            selectionStart--;
            selectionDirection = 'backward';
            break;
          }

          case 'ArrowRight': {
            if (!holdsShift) {
              throw new Error('Unexpected selection introduction by right arrow without shift key.');
            }

            selectionEnd++;
            selectionDirection = 'forward';
            break;
          }

          default: {
            throw new Error('TODO');
          }
        }
      }
    }

    // Check the selection start matches the text area after processing
    if (selectionStart !== puppetTextArea.selectionStart) {
      throw new Error(`Mismatched selection start ${selectionStart} v. ${puppetTextArea.selectionStart}.`);
    }

    // Check the selection end matches the text area after processing
    if (selectionEnd !== puppetTextArea.selectionEnd) {
      throw new Error(`Mismatched selection end ${selectionEnd} v. ${puppetTextArea.selectionEnd}.`);
    }

    // Check the selection direction matches the text area after processing
    if (selectionDirection !== puppetTextArea.selectionDirection) {
      throw new Error(`Mismatched selection direction ${selectionDirection} v. ${puppetTextArea.selectionDirection}.`);
    }
  });
});

class Logger {
  constructor(/** @type {HTMLOListElement} */ changeOl) {
    this.changeOl = changeOl;
  }

  handle(/** @type {Change} */ change) {
    const changeLi = document.createElement('li');
    switch (change.type) {
      case 'type': {
        changeLi.textContent = `typed ${JSON.stringify(change.value)}`;
        break;
      }
      case 'move': {
        changeLi.textContent = `moved ${change.delta > 0 ? change.delta : -change.delta} characters towards ${change.delta > 0 ? 'end' : 'start'}`;
        break;
      }
      case 'clear': {
        changeLi.textContent = `cleared ${change.delta > 0 ? change.delta : -change.delta} characters towards ${change.delta > 0 ? 'end' : 'start'}`;
        break;
      }
      default: {
        throw new Error(`Unexpected change type '${change.type}'.`);
      }
    }

    this.changeOl.insertAdjacentElement('afterbegin', changeLi);
  }
}

class Rebuilder {
  constructor(/** @type {HTMLTextAreaElement} */ puppetTextArea, /** @type {HTMLTextAreaElement} */ mirrorTextArea) {
    this.puppetTextArea = puppetTextArea;
    this.mirrorTextArea = mirrorTextArea;
  }

  handle(/** @type {Change} */ change) {
    switch (change.type) {
      case 'type': {
        this.mirrorTextArea.value = this.mirrorTextArea.value.slice(0, this.mirrorTextArea.selectionStart) + change.value + this.mirrorTextArea.value.slice(this.mirrorTextArea.selectionStart);
        this.mirrorTextArea.selectionStart += change.value.length;
        this.mirrorTextArea.selectionEnd += change.value.length;
        this.mirrorTextArea.selectionDirection = 'forward';
        break;
      }
      case 'move': {
        this.mirrorTextArea.selectionStart += change.delta;
        this.mirrorTextArea.selectionEnd += change.delta;
        this.mirrorTextArea.selectionDirection = 'forward';
        break;
      }
      case 'clear': {
        const selectionStart = this.mirrorTextArea.selectionStart;
        const selectionEnd = this.mirrorTextArea.selectionEnd;
        this.mirrorTextArea.value = this.mirrorTextArea.value.slice(0, selectionStart + change.delta) + this.mirrorTextArea.value.slice(selectionStart);
        this.mirrorTextArea.selectionStart = selectionStart + change.delta;
        this.mirrorTextArea.selectionEnd = selectionEnd + change.delta;
        this.mirrorTextArea.selectionDirection = 'forward';
        break;
      }

      default: {
        throw new Error(`Unexpected change type '${change.type}'.`);
      }
    }

    if (this.puppetTextArea.selectionStart !== this.mirrorTextArea.selectionStart) {
      throw new Error(`Mismatch in selection start (${this.puppetTextArea.selectionStart} v. ${this.mirrorTextArea.selectionStart}) after rebuilding from the changes.`);
    }

    if (this.puppetTextArea.selectionEnd !== this.mirrorTextArea.selectionEnd) {
      throw new Error('Mismatch in selection end after rebuilding from the changes.');
    }

    if (this.puppetTextArea.selectionDirection !== this.mirrorTextArea.selectionDirection) {
      throw new Error('Mismatch in selection direction after rebuilding from the changes.');
    }

    if (this.puppetTextArea.value !== this.mirrorTextArea.value) {
      throw new Error('Mismatch in value after rebuilding from the changes.');
    }
  }
}
