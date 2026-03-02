# Legend Colors and View Management Scripts for Archi

A collection of Archi scripts for managing colors, synchronizing views with models, identifying isolated elements, and organizing view layouts.

## Scripts

### [ApplyLegendColors.ajs](doc/ApplyLegendColors.md)
Propagates colors from legend views to all element instances throughout the model. Supports aggregation/composition relationships with recursive color application. Uses views marked with `legend="y"` property as color sources.

**Key Features**: Legend-based coloring • Multiple color types • First-wins logic • Top-down hierarchy • Cycle detection

### [SyncViewWithModel.ajs](doc/SyncViewWithModel.md)
Automatically adds related elements to views where core elements exist. Only Kernelement (core element) groups attract new elements. Places additions in "New Elements" group and marks views with "review-" prefix.

**Key Features**: Kernelement-based • Automatic relationship display • Meta-model support • Review marking • Exclusion support

### [MarkIsolatedElements.ajs](doc/MarkIsolatedElements.md)
Identifies and marks elements on the selected view that have no connection path to Kernelement attractors. Creates red visual notes for isolated elements.

**Key Features**: Attractor identification • Recursive relationship analysis • Visual marking • Connection path detection

### [cleanRelNames.ajs](doc/cleanRelNames.md)
Removes redundant relationship names when they consist only of "Schnittstelle" property values. Compares names with comma-separated property values and clears matches.

**Key Features**: Redundancy detection • Multiple property support • Bidirectional matching • Manual review logging

### [ApplyPropertyFrame.ajs](doc/ApplyPropertyFrame.md)
Applies visual borders to selected elements based on temporal properties ("ab" and "bis"). Elements with these properties get thick dashed borders with colors contrasted to fill color.

**Key Features**: Temporal property detection • Complement color calculation • Thick dashed borders • Selection-based

### [ArrangeOnBorder.ajs](doc/ArrangeOnBorder.md)
Arranges selected visual elements along the perimeter of a rectangular frame. Distributes elements evenly on four sides using closest-match algorithm.

**Key Features**: Square-ish frame calculation • Even distribution • Closest-match positioning • Largest-element spacing

## Shared Concepts

### Kernelement Groups

Several scripts use "Kernelement" (core element) groups to identify attractor elements:

1. Create a visual group on your view
2. Add property `Kernelement` with any value
3. Place elements inside the group - they become attractors

**Property Values**:
- `Kernelement=""` (or any non-"recursive" value): Only direct children are attractors
- `Kernelement="recursive"`: All descendants (recursive traversal) are attractors

**Used by**: `SyncViewWithModel.ajs`, `MarkIsolatedElements.ajs`

### Shared Library

`lib/attractors.js` - Shared attractor identification functions:
- `getAttractors(view, verbose)` - Returns attractor visual objects
- `collectChildVisualObjectsRecursive(parent, result)` - Recursively collects children
- `collectDirectChildVisualObjects(parent)` - Collects direct children
- `getAttractorConcepts(attractorVisuals)` - Extracts model elements

## Installation

### Direct Installation

1. Copy all `.ajs` files to your Archi scripts folder
2. Copy the `lib/` folder (if present) to maintain shared code
3. Scripts will appear in Archi's Scripts menu

### Docker Installation

The scripts are published as a Docker image on Docker Hub at `jemojemo/archi-legend-colors`.

**Pull the image**:
```bash
docker pull jemojemo/archi-legend-colors:latest
```

**Extract scripts to your local Archi scripts folder**:
```bash
# Create a temporary container
docker create --name temp-legend jemojemo/archi-legend-colors:latest

# Copy scripts from container to your local folder
docker cp temp-legend:/archi-scripts/legend-colors/ ~/path/to/your/archi/scripts/

# Remove temporary container
docker rm temp-legend
```

**Note**: Replace `~/path/to/your/archi/scripts/` with your actual Archi scripts directory path.

**Versioning**:
- `latest` - Latest version from main branch
- `YYYY.MM.DD` - Date-based versions (e.g., `2026.03.02`)
- `vX.Y.Z` - Semantic versions when tagged (e.g., `v1.0.0`)

## Documentation

Detailed documentation for each script is available in the [doc/](doc/) folder:
- [ApplyLegendColors.md](doc/ApplyLegendColors.md)
- [SyncViewWithModel.md](doc/SyncViewWithModel.md)
- [MarkIsolatedElements.md](doc/MarkIsolatedElements.md)
- [cleanRelNames.md](doc/cleanRelNames.md)
- [ApplyPropertyFrame.md](doc/ApplyPropertyFrame.md)
- [ArrangeOnBorder.md](doc/ArrangeOnBorder.md)

Each documentation file includes:
- **Model Elements That Matter**: Which properties, relationships, and elements affect the script
- **How It Works**: Processing logic and algorithms
- **Usage**: Step-by-step instructions
- **Example Scenarios**: Real-world usage examples with before/after
- **Console Output**: Expected console messages
- **Troubleshooting**: Common issues and solutions
- **Use Cases**: When to use the script

## Requirements

- Archi (with jArchi plugin for scripting support)
- Appropriate model structure depending on script:
  - Legend views for `ApplyLegendColors.ajs`
  - Kernelement groups for `SyncViewWithModel.ajs` and `MarkIsolatedElements.ajs`
  - Schnittstelle properties for `cleanRelNames.ajs`
  - Temporal properties (ab/bis) for `ApplyPropertyFrame.ajs`
  - Selection of 4+ elements for `ArrangeOnBorder.ajs`

## Author

(c) Y. Moldawski

## License

Free to use and modify for your Archi modeling needs.
