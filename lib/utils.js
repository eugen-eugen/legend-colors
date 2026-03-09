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

// Export functions
module.exports = {
  markViewForReview: markViewForReview,
};
