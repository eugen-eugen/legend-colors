# Legend Colors for Archi

An Archi script that applies fill colors from legend views to elements across all views in your model.

## Overview

This script automatically propagates colors from designated "legend" views to all instances of the same elements throughout your Archi model. It also recursively applies colors to aggregated and composed elements, making it easy to maintain consistent color schemes across complex models.

## Features

- **Legend-based coloring**: Identifies views marked with property `legend="y"` and uses them as color sources
- **First-wins logic**: When an element appears on multiple legend views, the first color found is applied
- **Recursive aggregation/composition**: Automatically colors all aggregated and composed elements following the relationship hierarchy
- **Association support**: Also applies colors to associated elements (non-recursive)
- **Cycle detection**: Prevents infinite loops when processing circular relationships
- **Detailed logging**: Console output shows which elements are being colored and their relationships

## Usage

1. Create one or more views in your Archi model to serve as color legends
2. Add the property `legend` with value `y` to each legend view
3. Color the elements on your legend views with the desired fill colors
4. Run the `ApplyLegendColors.ajs` script
5. All instances of those elements across all views will be colored accordingly

## How It Works

The script processes elements in this order:

1. Finds all views with property `legend="y"`
2. For each element on legend views:
   - Stores the fill color
   - Recursively follows aggregation and composition relationships
   - Applies color to associated elements (without recursion)
3. Applies stored colors to all visual representations across all views

### Relationship Handling

- **Aggregation/Composition**: Colors are applied recursively through these relationships
- **Association**: Colors are applied but without recursive traversal
- **Cycle Prevention**: The visited tracking mechanism prevents infinite loops

## Requirements

- Archi (with jArchi scripting support)
- At least one view with property `legend="y"`
- Elements on legend views must have fill colors set

## Installation

1. Copy `ApplyLegendColors.ajs` to your Archi scripts folder
2. The script will appear in Archi's Scripts menu

## Example

```
Legend View (legend="y"):
├── Service Component [Blue]
│   ├── aggregates → Database [Green]
│   └── composed of → API Module [Yellow]

Result: All instances of Service Component, Database, and API Module 
across all views will be colored blue, green, and yellow respectively.
```

## Author

(c) Y. Moldawski

## License

Free to use and modify for your Archi modeling needs.
