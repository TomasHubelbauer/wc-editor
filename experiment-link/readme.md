# Experiment: Link

## To-Do

### Support link by highlighting it and listening for click (selection) to it

Clicking the link token by cancelling/moving selection to it using the mouse
will raise an editor event and its listener will invoke the browser navigation.

The click hook should probably be general so that it can be used for multiple
thinks.

The cursor is a problem, but it might be possible to do it based on mouse events.
