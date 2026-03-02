/*
 * Meta-Model Library
 *
 * This library provides functionality to extract and use meta-models from ArchiMate views.
 * A meta-model defines which relationships are allowed between which types of elements.
 *
 * Meta-model can be defined by:
 * 1. A visual group with property "meta" on the view, OR
 * 2. A view reference element on the current view that points to another view with property "meta".
 *    In that case, all elements on the referenced view form the meta-model.
 *
 * (c) Y. Moldawski, 2026
 */

/**
 * Extracts the meta-model from a view
 * Meta-model is defined by:
 * 1. A visual group with property "meta" on the current view, OR
 * 2. A view reference on the current view pointing to another view with property "meta"
 * Returns null if no meta-model found
 */
function extractMetaModel(view) {
  var metaModelGroup = null;
  var metaView = view; // The view containing the meta-model
  var fromReferencedView = false;

  // First, try to find a visual group with property "meta" on current view
  $(view)
    .find("diagram-model-group")
    .each(function (group) {
      if (group.prop("meta") != null) {
        metaModelGroup = group;
        return false; // break
      }
    });

  // If no meta group found, look for view references that point to a view with "meta" property
  if (!metaModelGroup) {
    $(view)
      .find("diagram-model-reference")
      .each(function (viewRef) {
        var referencedView = viewRef.refView;
        if (referencedView && referencedView.prop("meta") != null) {
          metaView = referencedView;
          fromReferencedView = true;
          return false; // break - use first match
        }
      });

    if (!fromReferencedView) {
      return null;
    }

    console.log("  Using meta-model from referenced view: " + metaView.name);
  } else {
    console.log("  Found meta-model group: " + metaModelGroup.name);
  }

  // Check if debug mode is enabled
  var debugEnabled = false;
  if (metaModelGroup) {
    debugEnabled = metaModelGroup.prop("debug") === "true";
  } else if (fromReferencedView) {
    debugEnabled = metaView.prop("debug") === "true";
  }
  if (debugEnabled) {
    console.log("    Debug mode ENABLED for meta-model");
  }

  // Collect all elements in the meta-model
  var mmElements = [];
  var mmElementIds = {};

  if (metaModelGroup) {
    // Collect elements from the meta-model group
    $(metaModelGroup)
      .find("element")
      .each(function (visualElement) {
        var element = visualElement.concept;
        mmElements.push(element);
        mmElementIds[element.id] = element;
      });
  } else if (fromReferencedView) {
    // Collect ALL elements from the referenced view
    $(metaView)
      .find("element")
      .each(function (visualElement) {
        var element = visualElement.concept;
        mmElements.push(element);
        mmElementIds[element.id] = element;
      });
  }

  console.log("    Meta-model has " + mmElements.length + " element(s)");

  // Collect relationships that connect elements within the meta-model
  var mmRelationships = [];

  $(metaView)
    .find("relationship")
    .each(function (visualRel) {
      var rel = visualRel.concept;
      var sourceId = rel.source.id;
      var targetId = rel.target.id;

      // Only include if both source and target are in the meta-model
      if (mmElementIds[sourceId] && mmElementIds[targetId]) {
        mmRelationships.push(rel);
      }
    });

  console.log("    Meta-model has " + mmRelationships.length + " relationship(s)");

  // Build indices for quick lookup
  var elementsBySpecialization = {};
  var elementsByType = {};

  mmElements.forEach(function (element) {
    var specialization = element.specialization;
    var type = element.type;

    if (specialization) {
      if (!elementsBySpecialization[specialization]) {
        elementsBySpecialization[specialization] = [];
      }
      elementsBySpecialization[specialization].push(element);
    }

    if (!elementsByType[type]) {
      elementsByType[type] = [];
    }
    elementsByType[type].push(element);
  });

  // Build specialization hierarchy (parent -> children)
  var specializationChildren = {};
  var specializationParents = {};

  mmRelationships.forEach(function (rel) {
    if (rel.type === "specialization-relationship") {
      var specificId = rel.source.id;
      var generalId = rel.target.id;

      if (!specializationChildren[generalId]) {
        specializationChildren[generalId] = [];
      }
      specializationChildren[generalId].push(specificId);
      specializationParents[specificId] = generalId;
    }
  });

  return {
    elements: mmElements,
    relationships: mmRelationships,
    elementIds: mmElementIds,
    elementsBySpecialization: elementsBySpecialization,
    elementsByType: elementsByType,
    specializationChildren: specializationChildren,
    specializationParents: specializationParents,
    debug: debugEnabled,
  };
}

/**
 * Finds matching meta-model elements for a real element
 * Returns array of matching MM elements (can be empty)
 */
function findMetaModelMatches(element, metaModel) {
  if (!metaModel) {
    return [];
  }

  var matches = [];
  var specialization = element.specialization;

  if (specialization) {
    // Match by specialization name (any type)
    var candidates = metaModel.elementsBySpecialization[specialization];
    if (candidates) {
      matches = matches.concat(candidates);
    }
  } else {
    // Match by concept type, but ONLY elements without specialization
    var candidates = metaModel.elementsByType[element.type];
    if (candidates) {
      candidates.forEach(function (candidate) {
        // Only add if candidate also has no specialization
        if (!candidate.specialization) {
          matches.push(candidate);
        }
      });
    }
  }

  return matches;
}

/**
 * Gets all allowed relationships from a meta-model element
 * Includes inherited relationships via specialization
 */
function getAllowedRelationshipsFrom(mmElement, metaModel, debugEnabled) {
  var allowed = [];
  var processedElements = {};

  if (debugEnabled) {
    console.log("          [Collecting FROM] " + mmElement.name + " (" + mmElement.id + ")");
  }

  function collectRelationships(elementId, depth) {
    if (processedElements[elementId]) {
      return; // Avoid cycles
    }
    processedElements[elementId] = true;

    var indent = "          " + Array(depth + 1).join("  ");
    var directCount = 0;

    // Collect direct relationships from this element
    metaModel.relationships.forEach(function (rel) {
      if (rel.source.id === elementId && rel.type !== "specialization-relationship") {
        allowed.push(rel);
        directCount++;
        if (debugEnabled) {
          var elem = metaModel.elementIds[elementId];
          console.log(indent + "- " + rel.type + " to " + rel.target.name);
        }
      }
    });

    // If this element specializes another, inherit its relationships
    var parentId = metaModel.specializationParents[elementId];
    if (parentId) {
      if (debugEnabled) {
        var parentElem = metaModel.elementIds[parentId];
        console.log(indent + "Inheriting from: " + parentElem.name);
      }
      collectRelationships(parentId, depth + 1);
    }
  }

  collectRelationships(mmElement.id, 0);

  if (debugEnabled) {
    console.log("          [Total FROM " + mmElement.name + "]: " + allowed.length + " relationship(s)");
  }

  return allowed;
}

/**
 * Gets all allowed relationships to a meta-model element
 * Includes inherited relationships via specialization
 */
function getAllowedRelationshipsTo(mmElement, metaModel, debugEnabled) {
  var allowed = [];
  var processedElements = {};

  if (debugEnabled) {
    console.log("          [Collecting TO] " + mmElement.name + " (" + mmElement.id + ")");
  }

  function collectRelationships(elementId, depth) {
    if (processedElements[elementId]) {
      return; // Avoid cycles
    }
    processedElements[elementId] = true;

    var indent = "          " + Array(depth + 1).join("  ");
    var directCount = 0;

    // Collect direct relationships to this element
    metaModel.relationships.forEach(function (rel) {
      if (rel.target.id === elementId && rel.type !== "specialization-relationship") {
        allowed.push(rel);
        directCount++;
        if (debugEnabled) {
          var elem = metaModel.elementIds[elementId];
          console.log(indent + "- " + rel.type + " from " + rel.source.name);
        }
      }
    });

    // If this element specializes another, inherit its relationships
    var parentId = metaModel.specializationParents[elementId];
    if (parentId) {
      if (debugEnabled) {
        var parentElem = metaModel.elementIds[parentId];
        console.log(indent + "Inheriting from: " + parentElem.name);
      }
      collectRelationships(parentId, depth + 1);
    }
  }

  collectRelationships(mmElement.id, 0);

  if (debugEnabled) {
    console.log("          [Total TO " + mmElement.name + "]: " + allowed.length + " relationship(s)");
  }

  return allowed;
}

/**
 * Checks if a relationship matches a meta-model relationship pattern
 * First checks specialization, then checks type
 * Special handling: aggregation and composition are treated as equivalent
 */
function matchesRelationship(realRel, mmRel, debugEnabled) {
  var realSpec = realRel.specialization;
  var mmSpec = mmRel.specialization;

  if (debugEnabled) {
    console.log(
      "          [Match Check] Real: " +
        realRel.type +
        (realSpec ? " (spec: " + realSpec + ")" : "") +
        " vs MM: " +
        mmRel.type +
        (mmSpec ? " (spec: " + mmSpec + ")" : ""),
    );
  }

  // If MM relationship has specialization, real relationship must match it
  if (mmSpec) {
    var matches = realSpec === mmSpec;
    if (debugEnabled) {
      console.log("            Specialization match: " + matches);
    }
    return matches;
  }

  // Special case: aggregation and composition are treated as equivalent
  // If MM has aggregation or composition, real can be either
  var mmType = mmRel.type;
  var realType = realRel.type;

  if (
    (mmType === "aggregation-relationship" || mmType === "composition-relationship") &&
    (realType === "aggregation-relationship" || realType === "composition-relationship")
  ) {
    if (debugEnabled) {
      console.log("            Match: aggregation/composition equivalence");
    }
    return true;
  }

  // Otherwise, match by type
  var typeMatches = realType === mmType;
  if (debugEnabled) {
    console.log("            Type match: " + typeMatches);
  }
  return typeMatches;
}

/**
 * Checks if a relationship is allowed according to the meta-model
 * Returns true if:
 * - No meta-model exists (allow all)
 * - The relationship matches an allowed pattern in the meta-model
 */
function isRelationshipAllowed(sourceElement, targetElement, relationship, metaModel) {
  if (!metaModel) {
    return true; // No meta-model = allow all
  }

  var debugEnabled = metaModel.debug;

  if (debugEnabled) {
    console.log("      [MM DEBUG] Checking relationship:");
    console.log(
      "        Source: " +
        sourceElement.name +
        " (type: " +
        sourceElement.type +
        ", spec: " +
        (sourceElement.specialization || "none") +
        ")",
    );
    console.log(
      "        Target: " +
        targetElement.name +
        " (type: " +
        targetElement.type +
        ", spec: " +
        (targetElement.specialization || "none") +
        ")",
    );
    console.log(
      "        Relationship: " +
        relationship.type +
        (relationship.specialization ? " (spec: " + relationship.specialization + ")" : ""),
    );
  }

  // Find matching meta-model elements for source and target
  var sourceMatches = findMetaModelMatches(sourceElement, metaModel);
  var targetMatches = findMetaModelMatches(targetElement, metaModel);

  if (debugEnabled) {
    console.log("        Source matches in MM: " + sourceMatches.length);
    sourceMatches.forEach(function (m) {
      console.log("          - " + m.name + " (type: " + m.type + ", spec: " + (m.specialization || "none") + ")");
    });
    console.log("        Target matches in MM: " + targetMatches.length);
    targetMatches.forEach(function (m) {
      console.log("          - " + m.name + " (type: " + m.type + ", spec: " + (m.specialization || "none") + ")");
    });
  }

  if (sourceMatches.length === 0 || targetMatches.length === 0) {
    if (debugEnabled) {
      console.log("        Result: REJECTED (no matching elements in meta-model)");
    }
    return false; // No match in meta-model = not allowed
  }

  // Try all combinations of source and target matches
  for (var i = 0; i < sourceMatches.length; i++) {
    var mmSource = sourceMatches[i];
    if (debugEnabled) {
      console.log("        [Checking FROM mm_source] " + mmSource.name + " (id: " + mmSource.id + ")");
    }

    // Get all allowed relationships from this MM source (including inherited)
    var allowedRels = getAllowedRelationshipsFrom(mmSource, metaModel, debugEnabled);

    for (var j = 0; j < allowedRels.length; j++) {
      var mmRel = allowedRels[j];

      // Check if target matches and relationship type matches
      for (var k = 0; k < targetMatches.length; k++) {
        var mmTarget = targetMatches[k];

        if (debugEnabled) {
          console.log(
            "          [Checking MM path] " +
              mmSource.name +
              " --[" +
              mmRel.type +
              "]--> " +
              mmRel.target.name +
              " (target in MM)",
          );
          console.log("          [Against mm_target] " + mmTarget.name + " (id: " + mmTarget.id + ")");
          console.log("          [MM relationship target matches?] " + (mmRel.target.id === mmTarget.id));
        }

        if (mmRel.target.id === mmTarget.id && matchesRelationship(relationship, mmRel, debugEnabled)) {
          if (debugEnabled) {
            console.log("        Result: ALLOWED (matched pattern in meta-model)");
          }
          return true; // Found a matching pattern
        }
      }
    }
  }

  // Also check incoming relationships
  for (var i = 0; i < targetMatches.length; i++) {
    var mmTarget = targetMatches[i];
    if (debugEnabled) {
      console.log("        [Checking TO mm_target] " + mmTarget.name + " (id: " + mmTarget.id + ")");
    }

    // Get all allowed relationships to this MM target (including inherited)
    var allowedRels = getAllowedRelationshipsTo(mmTarget, metaModel, debugEnabled);

    for (var j = 0; j < allowedRels.length; j++) {
      var mmRel = allowedRels[j];

      // Check if source matches and relationship type matches
      for (var k = 0; k < sourceMatches.length; k++) {
        var mmSource = sourceMatches[k];

        if (debugEnabled) {
          console.log(
            "          [Checking MM path] " +
              mmRel.source.name +
              " --[" +
              mmRel.type +
              "]--> " +
              mmTarget.name +
              " (source in MM)",
          );
          console.log("          [Against mm_source] " + mmSource.name + " (id: " + mmSource.id + ")");
          console.log("          [MM relationship source matches?] " + (mmRel.source.id === mmSource.id));
        }

        if (mmRel.source.id === mmSource.id && matchesRelationship(relationship, mmRel, debugEnabled)) {
          if (debugEnabled) {
            console.log("        Result: ALLOWED (matched pattern in meta-model)");
          }
          return true; // Found a matching pattern
        }
      }
    }
  }

  if (debugEnabled) {
    console.log("        Result: REJECTED (no matching pattern in meta-model)");
  }
  return false; // No matching pattern found
}

// Export functions
module.exports = {
  extractMetaModel: extractMetaModel,
  findMetaModelMatches: findMetaModelMatches,
  isRelationshipAllowed: isRelationshipAllowed,
};
