/*
 * Attractor Helper Functions
 *
 * Shared functions for identifying "Kernelement" (core elements) attractors.
 *
 * An element is an attractor if it's a child of a visual group
 * with property "Kernelement" set.
 *
 * If the property value is "recursive", all children (recursively) are attractors,
 * following the visual parent/child hierarchy on the view.
 * If the property has no value or any other value, only direct children are attractors.
 *
 * (c) Y. Moldawski, 2026
 */

/**
 * Recursively collects all visual objects that are children of a given parent
 * Follows the visual parent/child hierarchy, not model relationships
 */
function collectChildVisualObjectsRecursive(parent, metaModel, isRelationshipAllowedFunc, result, verbose) {
  if (!result) {
    result = [];
  }

  if (verbose) {
    var parentName = parent.concept ? parent.concept.name : parent.name;
    var parentType = parent.concept ? parent.concept.type : "group";
    console.log("      Processing children of: " + parentName + " (" + parentType + ")");
  }

  $(parent)
    .children()
    .each(function (child) {
      // Add the child if it's an element (has a concept)
      if (child.concept) {
        result.push(child);
        if (verbose) {
          console.log("        Recursive child: " + child.concept.name + " (" + child.concept.type + ")");
        }

        // Recursively process children of this child (follow visual hierarchy)
        collectChildVisualObjectsRecursive(child, metaModel, isRelationshipAllowedFunc, result, verbose);
      }
    });

  return result;
}

/**
 * Collects only direct child visual objects (non-recursive)
 */
function collectDirectChildVisualObjects(parent, verbose) {
  var result = [];

  $(parent)
    .children()
    .each(function (child) {
      // Add the child if it's an element (has a concept)
      if (child.concept) {
        result.push(child);
        if (verbose) {
          console.log("      Direct child: " + child.concept.name + " (" + child.concept.type + ")");
        }
      }
    });

  return result;
}

/**
 * Gets all visual objects that are attractors (children of Kernelement groups)
 * @param {View} view - The view to search for attractors
 * @param {Object} metaModel - The meta-model object (can be null)
 * @param {Function} isRelationshipAllowedFunc - Function to check if relationship is allowed
 * @param {boolean} verbose - If true, logs detailed information about found attractors
 * @returns {Array} Array of visual objects that are attractors
 */
function getAttractors(view, metaModel, isRelationshipAllowedFunc, verbose) {
  var attractors = [];

  // Find all visual groups with property "Kernelement" (regardless of value)
  $(view)
    .find("diagram-model-group")
    .each(function (group) {
      var kernelementValue = group.prop("Kernelement");
      if (kernelementValue != null) {
        if (verbose) {
          console.log("  Found Kernelement group: " + group.name + " (Kernelement=" + kernelementValue + ")");
        }

        // Check if recursive collection is requested
        var children;
        if (kernelementValue === "recursive") {
          children = collectChildVisualObjectsRecursive(group, metaModel, isRelationshipAllowedFunc, null, verbose);
          if (verbose) {
            console.log("    Using recursive collection (visual hierarchy)");
          }
        } else {
          children = collectDirectChildVisualObjects(group, verbose);
          if (verbose) {
            console.log("    Using direct children only");
          }
        }

        attractors = attractors.concat(children);
      }
    });

  return attractors;
}

/**
 * Gets all model elements (concepts) from visual attractor objects
 * @param {Array} attractorVisuals - Array of visual objects
 * @returns {Array} Array of model element concepts
 */
function getAttractorConcepts(attractorVisuals) {
  var concepts = [];
  attractorVisuals.forEach(function (visual) {
    if (visual.concept) {
      concepts.push(visual.concept);
    }
  });
  return concepts;
}
