# Experiment: Image

## To-Do

### Implement image experiment by inserting pretend-blank-lines

The lines must not become a part of the resulting content, so upon selection or
something, they need to be removed, but they need to be there when displaying
only so that there is room underneath the textarea to draw the image in.

The image size is quantized by text area line height and the image always needs
to be block-aligned.

Maybe instead of the fake lines, the user could be required to insert real lines
with image attributes in JSON or something and explicit blank lines to adjust
the rest of the height of the image area and the image will automatically scale
to fit the room the user made.
