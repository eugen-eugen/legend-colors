/*
 * Utility Functions
 *
 * Common utility functions used across multiple scripts.
 *
 * (c) Y. Moldawski, 2026
 */

/**
 * Adds "review-" prefix to a view's name if not already present
 * @param {View} view - The view to rename
 * @returns {boolean} True if the view was renamed, false if prefix already existed
 */
function markViewForReview(view) {
  if (!view.name.startsWith("review-")) {
    view.name = "review-" + view.name;
    return true;
  }
  return false;
}

/**
 * Removes "review-" prefix from a view's name if present
 * @param {View} view - The view to unmark
 * @returns {boolean} True if the prefix was removed, false if prefix was not present
 */
function unmarkViewForReview(view) {
  if (view.name.startsWith("review-")) {
    view.name = view.name.replace(/^review-/, "");
    return true;
  }
  return false;
}

/**
 * Creates a note connected to a visual object (element or relationship)
 * Automatically positions the note based on the visual's location
 * @param {Object} visual - The visual element or relationship to attach the note to
 * @param {String} message - The text to display in the note
 * @param {View} view - The view to add the note to
 * @param {Object} options - Optional configuration
 *   @param {String} options.fillColor - Note background color (default: "#ff0000" red)
 *   @param {String} options.fontColor - Note text color (default: "#ffffff" white)
 *   @param {String} options.lineColor - Connection line color (default: same as fillColor)
 *   @param {Number} options.width - Note width (default: 120)
 *   @param {Number} options.height - Note height (default: 40)
 *   @param {Number} options.offsetX - X offset from calculated position (default: 0)
 *   @param {Number} options.offsetY - Y offset from calculated position (default: 0)
 * @returns {Object} The created note object
 */
function createNoteForVisual(visual, message, view, options) {
  options = options || {};
  var fillColor = options.fillColor || "#ff0000";
  var fontColor = options.fontColor || "#ffffff";
  var lineColor = options.lineColor || fillColor;
  var width = options.width || 120;
  var height = options.height || 40;
  var offsetX = options.offsetX || 0;
  var offsetY = options.offsetY || 0;

  var noteX, noteY;

  // Handle elements (have bounds) vs relationships (don't have bounds)
  if (visual.bounds) {
    // Element: position to the right
    noteX = visual.bounds.x + visual.bounds.width + 40 + offsetX;
    noteY = visual.bounds.y + offsetY;
  } else {
    // Relationship: place note near the source element
    if (visual.source && visual.source.bounds) {
      noteX = visual.source.bounds.x + visual.source.bounds.width + 40 + offsetX;
      noteY = visual.source.bounds.y + 50 + offsetY;
    } else {
      // Fallback position if we can't determine location
      noteX = 10 + offsetX;
      noteY = 10 + offsetY;
    }
  }

  var note = view.createObject("diagram-model-note", noteX, noteY, width, height);
  note.text = message;
  note.fillColor = fillColor;
  note.fontColor = fontColor;

  var connection = view.createConnection(note, visual);
  connection.lineColor = lineColor;

  return note;
}

/**
 * Creates a note for a relationship, positioned at the midpoint between source and target
 * @param {Object} visualRelationship - The visual relationship (can be null if sourceVisual/targetVisual provided)
 * @param {Object} sourceVisual - The source visual element
 * @param {Object} targetVisual - The target visual element
 * @param {String} message - The text to display in the note
 * @param {View} view - The view to add the note to
 * @param {Object} options - Optional configuration (same as createNoteForVisual)
 * @returns {Object} The created note object
 */
function createNoteForRelationship(visualRelationship, sourceVisual, targetVisual, message, view, options) {
  options = options || {};
  var fillColor = options.fillColor || "#ff0000";
  var fontColor = options.fontColor || "#ffffff";
  var lineColor = options.lineColor || fillColor;
  var width = options.width || 100;
  var height = options.height || 40;
  var offsetX = options.offsetX || 30;
  var offsetY = options.offsetY || -20;

  var sourceBounds = sourceVisual.bounds;
  var targetBounds = targetVisual.bounds;

  // Position note near the midpoint between source and target
  var midX = (sourceBounds.x + sourceBounds.width / 2 + targetBounds.x + targetBounds.width / 2) / 2;
  var midY = (sourceBounds.y + sourceBounds.height / 2 + targetBounds.y + targetBounds.height / 2) / 2;

  var noteX = midX + offsetX;
  var noteY = midY + offsetY;

  var note = view.createObject("diagram-model-note", noteX, noteY, width, height);
  note.text = message;
  note.fillColor = fillColor;
  note.fontColor = fontColor;

  // Connect note to target element
  var connection = view.createConnection(note, targetVisual);
  connection.lineColor = lineColor;

  return note;
}

// Export functions
module.exports = {
  markViewForReview: markViewForReview,
  unmarkViewForReview: unmarkViewForReview,
  createNoteForVisual: createNoteForVisual,
  createNoteForRelationship: createNoteForRelationship,
};
