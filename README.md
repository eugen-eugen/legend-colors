# Legend Colors for Archi

An Archi script that applies fill, text, line, and icon colors from legend views to elements across all views in your model.

## Overview

This script automatically propagates colors from designated "legend" views to all instances of the same elements throughout your Archi model. It also recursively applies colors to aggregated and composed elements following a top-down hierarchy (from aggregates/composites to their parts), making it easy to maintain consistent color schemes across complex models.

## Features

- **Legend-based coloring**: Identifies views marked with property `legend="y"` and uses them as color sources
- **Multiple color types**: Applies fill color, text/font color, line color, and icon color from legend elements
- **First-wins logic**: When an element appears on multiple legend views, the first colors found are applied
- **Top-down aggregation/composition**: Automatically colors all parts of aggregated and composed elements, recursively following the hierarchy from whole to parts
- **Association support**: Also applies colors to associated elements (non-recursive)
- **Cycle detection**: Prevents infinite loops when processing circular relationships
- **Detailed logging**: Console output shows which elements are being colored and their relationships

## Usage

1. Create one or more views in your Archi model to serve as color legends
2. Add the property `legend` with value `y` to each legend view
3. Color the elements on your legend views with the desired fill, text, line, and/or icon colors
4. Run the `ApplyLegendColors.ajs` script
5. All instances of those elements across all views will be colored accordingly

## How It Works

The script processes elements in this order:

1. Finds all views with property `legend="y"`
2. For each element on legend views:
   - Stores the element's fill, text, line, and icon colors (first-wins if element appears on multiple legend views)
   - Recursively follows aggregation and composition relationships top-down (from aggregate/composite to its parts)
   - Applies colors to associated elements (outgoing only, without recursion)
3. Applies stored colors to all visual representations across all non-legend views
4. Legend views themselves are skipped during the color application phase to preserve original coloring

### Relationship Handling

- **Aggregation/Composition**: Colors are applied recursively top-down only (from aggregate/composite to its parts/targets)
- **Association**: Colors are applied to outgoing associations only, without recursive traversal
- **Cycle Prevention**: The visited tracking mechanism prevents infinite loops in circular relationship structures

## Requirements

- Archi (with jArchi scripting support)
- At least one view with property `legend="y"`
- Elements on legend views must have at least one color property set (fill, text, line, or icon color)

## Installation

1. Copy `ApplyLegendColors.ajs` to your Archi scripts folder
2. The script will appear in Archi's Scripts menu

## Example

```
Legend View (legend="y"):
├── Service Component [Fill: Blue, Text: White, Line: Dark Blue, Icon: Light Blue]
│   ├── aggregates → Database [Fill: Green, Text: Black, Icon: Dark Green]
│   └── composed of → API Module [Fill: Yellow, Line: Orange]

Result: All instances of Service Component, Database, and API Module 
across all views will have their respective fill, text, line, and icon colors applied.
```

## Author

(c) Y. Moldawski

## License

Free to use and modify for your Archi modeling needs.
