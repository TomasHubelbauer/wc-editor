# Editor Web Component

## Installation

Currently, only the `basic` editor is in working state, see its readme:
[`basic/readme.md`](basic/readme.md).

## Vision

Editor is a web component for editing text. The following features set it apart
from a plain `textarea`/`input`:

**Coloring and formatting options**

Editor uses a `textarea` for input, but both the background and the foreground
of `textarea` is transparent. The only visible element of it is the caret and
the selection, if any.

The contents of the editor are rendered by a `div` which lays underneath and its
spans can be colored and formatted bold, italic, underlined, struck-through etc.

**Native behavior**

Since the input and keyboard and mouse handling are using the native `textarea`,
the editor acts as expected. It even featues the browser-based spell-checking,
something other text editing components available lack due to the fundamentals
of their implementation.

**Change-based change reporting**

Editor has a `change` event, much like a regular `textarea`, but it reports the
actual changes to its value, not only the new value. The new value is of course
still obtainable as well. However, this choice enables efficient and effective
implementation of the coloring and formatting options mentioned above.

Editor listens to keyboard and mouse interactions events of the textarea and
keeps tabs on the changes of its value the interactions resulted in. Based on
these, it is able to find the affected coloring and formatting spans and update
them surgically without having to rerender the entire rendering layer.

**Virtualizing renderering**

Editor only displays the spans of the visible lines and only keeps the data of
the invisible spans in memory but not the DOM. The lines are smoothly updated on
the fly as the editor is scrolled.

## Purpose

I find things such as draft.js, CodeMirror/ProseMirror, Monaco etc. too hevy and
also too flexible. I want to make a web component which is just a regular text
area element, but with line numbers and syntax highlighting. I have come up with
a good way to do the syntax highlighting: make the text area color transparent
and underlay a div which has the same text, but highlighted. When a selection or
any other interaction is made, it is with the text area, not the background div.
Selection still works by highlighting the text area text, not the div. I'm also
thinking of using a background SVG, but the div should work fine as long as the
same font is used it both so that the visible div characters actually appear at
the spots where the invisible text area ones do not.

## Limitations

The component, if I manage to implement it as I intend to, will have limitations:

- No non-text content: it is not possible to make text area lines a different
  height from one another, so we cannot make up the space needed to display the
  image. It might be possible to fuck around with blank lines which are removed
  when selecting etc. but it would be janky and the height would be quantized by
  text area line height anyway. Also only block content would work, not inline.
- Italics and bold work only with monospaced fonts, because with non-monospaced
  fonts, text area needs to be either all bold, all italics etc., but portions
  can not be individually. In the background div, they can, but they still must
  take up the same space.
- Rerenders the entire background div on each change unless I succeed with the
  diffing algorithm I am working on.

## Status

None of the features above are actually implemented yet, it's all just an idea
for now.

Right now I'm playing with `test.js`. The idea is to collect some interesting
sequences from typing into `recorder/index.html`, make up the representation for
the events the mechanism should fire (the individual characters are stand-ins
for events such as add span, append to span, move cursor etc.) and eventually
using this test rig I want to create the algorithm.

Since the main project is broken and I am working in experiments, I have pulled
out a working copy to `basic` which can be used in other projects.

## Running

`index.html`

## Testing

`test.html`

Input sequences are from `recorder`.
Output sequences are from `restorer`.

## To-Do

### Compare the performance of using the background div vs. a background SVG

Either an actual SVG or using the SVG as a background image which would
eliminate the need for a web component as only a text area `editorize` function
could do the trick.

### Flesh out the rest of the temporary experiemnt in `tmp`

### Add tests for the keyboard and mouse handling

Cover all of the possible branches to make it clear what is dead code and what
is actually reachable by interacting with the textarea using the keyboard and
the mouse.

### Handle pressing and releasing a character alone

The sequence of events is down key, press key, up key.

### Handle pressing and releasing the shift key alone

The sequence is down shift, up shift.

### Handle the shift down, letter down, letter up, shift up sequence

The sequence is down shift, down key, press key, up key, up shift.

### Handle the shift down, letter down, shift up, letter up sequence

The sequence is down shift, down key, press key, up shift, up key.

### Implement an auto-size mode: the height of the div stretches the text area

This is so that in non-fixed layouts, the editor is allowed to grow with the
content within it and doesn't have to have a strictly defined height.

### Introduce a wrapper element to set the relative position on

So that the detail about the container having to be relative doesn't leak out of
the web component.

### Consider virtualizing the adornment spans outside of the scrolled view area

We could hide the adornments which are fully outside of the scrolled view area
and replace them by top and bottom margins on the adornment container div. This
will compensate for the difference in height and ensure the scroll dimensions
remain unchanged.

I've already done this in https://github.com/TomasHubelbauer/js-infinite-scroll
so use that fo inspiration.

### Address the `basic` editor to-dos
