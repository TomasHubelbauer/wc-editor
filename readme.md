# Editor Web Component

Editor is a web component for editing text. The following features set it apart
from a plain `textarea`/`input`:

**Coloring and formatting options**

Editor uses a `textarea` for input, but both the background and the foreground
of `textarea` is transparent. The only visible element of it is the caret and
the selection, if any.

The contents of the editor are rendered by a `div` which lays underneath and its
spans can be colored and formatted bold, italic, underlined, struck-through etc.

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

## Status

None of the features above are actually implemented yet, it's all just an idea
for now.

## Running

`index.html`

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
