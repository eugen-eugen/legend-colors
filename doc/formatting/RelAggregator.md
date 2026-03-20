# Relationship Aggregator

## Overview

The `RelAggregator.ajs` script automatically aggregates properties from relationships between sub-components to their parent aggregator relationships. This is useful for maintaining high-level documentation of relationships while keeping detailed properties at the component level.

## Purpose

When modeling systems with hierarchical decomposition, you often have:
- High-level elements (e.g., Application Component A and B) connected by relationships
- Low-level sub-components (e.g., A1, A2 within A; B1, B2 within B) with detailed relationships

The script helps maintain consistency by copying properties from detailed sub-component relationships to the high-level aggregator relationship that represents them.

## How It Works

### Processing Steps

For each relationship marked with an `aggregator` property, the script:

1. **Finds Sub-Components**: Recursively discovers all sub-components of both the source and target elements by following composition and aggregation relationships
2. **Identifies Matching Relationships**: Finds relationships that match the aggregator's type/specialization in three scenarios:
   - Between sub-components: A's sub → B's sub
   - From aggregator source to target's sub: A → B's sub
   - From source's sub to aggregator target: A's sub → B
3. **Copies Properties**: Copies all properties from matching sub-relationships to the aggregator
4. **Cleans Up**: Removes all other properties from the aggregator (except the `aggregator` property itself)

### Matching Criteria

A sub-relationship matches the aggregator if:

- **Type/Specialization Match**:
  - Both have a specialization: specializations must be identical
  - Neither has a specialization: ArchiMate types must be identical
  - One has a specialization and the other doesn't: no match
  
- **Direction Match**: The source/target roles must correspond
  - If the aggregator goes A → B, the sub-relationship must go from a sub-component of A to a sub-component of B
  - Reverse direction relationships (B's sub → A's sub) are ignored

### Cycle Detection

The script includes cycle detection to prevent infinite loops when traversing the composition/aggregation hierarchy.

## Usage

### Basic Usage

**Option 1: Process Selected Relationships**
1. Select one or more relationships in Archi
2. Run the script
3. Only selected relationships with the `aggregator` property will be processed

**Option 2: Process All Aggregators**
1. Run the script without any selection
2. All relationships in the model with the `aggregator` property will be processed

### Marking Aggregator Relationships

To mark a relationship as an aggregator:
1. Select the relationship
2. Add a property with key `aggregator` (the value can be anything or empty)
3. Run the script

## Example

### Scenario

- Application Component **A** has a **trigger** relationship to Application Component **B**
- This relationship is marked with property `aggregator` (any value)
- **A** contains sub-component **A1** (via composition relationship)
- **B** contains sub-component **B1** (via aggregation relationship)
- **A1** has a **trigger** relationship to **B1** with property `Hello=World`
- **A** has a **trigger** relationship to **B1** with property `Interface=REST`

### Result

After running the script:
- The aggregator relationship **A → B** will receive both properties:
  - `Hello=World` (copied from **A1 → B1**)
  - `Interface=REST` (copied from **A → B1**)
- All other properties on **A → B** (except `aggregator`) will be removed

### What Gets Aggregated

The script aggregates properties from three types of matching relationships:
1. **Sub to Sub**: A1 → B1 (sub-component of A to sub-component of B)
2. **Source to Sub**: A → B1 (aggregator source to sub-component of target)
3. **Sub to Target**: A1 → B (sub-component of source to aggregator target)

### Counter-Example

If **B1** has a trigger relationship to **A1** (reverse direction):
- This relationship will **NOT** match the aggregator
- Its properties will **NOT** be copied
- Reason: The source/target roles don't correspond (B's sub to A's sub vs. A to B)

## Use Cases

1. **Maintain Aggregated Documentation**: Keep high-level relationship properties synchronized with detailed implementations
2. **Interface Aggregation**: Aggregate interface properties from component relationships to system-level relationships
3. **Dependency Management**: Summarize detailed dependencies at higher abstraction levels
4. **Impact Analysis**: Understand which high-level relationships are affected by sub-component changes

## Console Output

The script provides detailed logging:
- Number of aggregator relationships found
- For each aggregator:
  - Relationship name, type, and connected elements
  - Number of sub-components found
  - Matching sub-relationships discovered
  - Properties copied (key=value pairs)
  - Total count of properties copied

## Important Notes

1. **Property Removal**: All existing properties on the aggregator (except `aggregator` itself) are removed before copying new properties. This ensures the aggregator only reflects current sub-component relationships.

2. **Duplicate Handling**: If multiple sub-relationships have the same property key with different values, all unique values will be copied to the aggregator.

3. **Recursive Traversal**: The script follows composition and aggregation relationships recursively to find all nested sub-components, regardless of depth.

4. **Cycle Safety**: Built-in cycle detection prevents infinite loops in circular composition/aggregation structures.

5. **Specialization vs. Type**: The matching algorithm respects the difference between specialized and non-specialized relationships. A specialized relationship will only match another with the same specialization, not a non-specialized relationship of the same base type.

## Script Location

`legend-colors/formatting/RelAggregator.ajs`

## Author

Y. Moldawski, 2026
