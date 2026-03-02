# ApplyLegendColors.ajs

## Overview

Automatically propagates colors from designated "legend" views to all instances of the same elements throughout your Archi model. Colors are applied recursively through aggregation and composition relationships (top-down) and to associated elements (non-recursive).

## Model Elements That Matter

### Views

| Element Type | Property | Value | Purpose |
|-------------|----------|-------|---------|
| View | `legend` | `y` | Marks a view as a color legend source |

**Important**: Only views with the property `legend="y"` are used as color sources.

### Visual Elements

| Property | Purpose |
|----------|---------|
| Fill Color | Background color of element boxes |
| Font/Text Color | Text color inside elements |
| Line Color | Border/outline color of elements |
| Icon Color | Color applied to element icons |

**Note**: At least one color property must be set on legend elements for them to be used.

### Relationships

The script follows these relationships **from source elements on legend views**:

| Relationship Type | Direction | Recursive | Purpose |
|------------------|-----------|-----------|---------|
| Aggregation | Outgoing (source → target) | **Yes** | Colors all parts/children |
| Composition | Outgoing (source → target) | **Yes** | Colors all components |
| Association | Outgoing (source → target) | **No** | Colors directly associated elements only |

**Important Notes**:
- Aggregation/Composition: Colors flow **top-down** from aggregate/composite to parts recursively
- Association: Colors applied to targets, but does NOT recurse further
- Cycle detection prevents infinite loops in circular relationship structures

## Usage

### Step 1: Create Legend Views

1. Create one or more views to serve as color legends
2. Add property `legend` with value `y` to each legend view:
   - Right-click view → Properties → Properties tab
   - Click "New" → Name: `legend`, Value: `y`

### Step 2: Define Colors

1. Add elements to your legend views
2. Set colors for each element:
   - Right-click element → Properties → Appearance tab
   - Set Fill color, Font color, Line color, and/or Icon color

### Step 3: Run the Script

1. Open your model in Archi
2. Run: Scripts → `ApplyLegendColors.ajs`
3. Check console output for processing details

## How It Works

### Processing Order

1. **Find Legend Views**: Scans all views for property `legend="y"`
2. **Collect Colors**: For each element on legend views:
   - Stores fill, text, line, and icon colors
   - **First-wins logic**: If element appears on multiple legend views, first colors found are used
3. **Follow Relationships**: From each legend element:
   - Recursively follows aggregation/composition (top-down)
   - Applies colors to associated elements (outgoing only, non-recursive)
4. **Apply Colors**: Updates all visual representations across all non-legend views
5. **Preserve Legends**: Legend views themselves are skipped during application to preserve original coloring

### First-Wins Logic

When the same element appears on multiple legend views:
- The **first** view processed determines the colors
- Subsequent appearances on other legend views are ignored
- Processing order is determined by view listing order in the model

### Relationship Traversal Details

**Aggregation Example**:
```
Service Component [Legend: Blue]
├── aggregates → Database [Legend: Green]
│   └── aggregates → Table [Legend: Yellow]
└── aggregates → API Module

Result:
- Service Component: Blue (from legend)
- Database: Green (from legend)
- Table: Yellow (from legend, via recursive traversal)
- API Module: Blue (inherited from Service Component)
```

**Association Example**:
```
UI Component [Legend: Purple]
├── associated with → Backend Service
│   └── aggregates → Database

Result:
- UI Component: Purple (from legend)
- Backend Service: Purple (inherited via association)
- Database: NOT colored (association doesn't recurse)
```

## Example Scenarios

### Scenario 1: Domain-Based Coloring

**Setup**:
- Legend view with property `legend="y"`
- Business Layer element (Fill: Blue)
  - aggregates: CRM Service
  - aggregates: Sales Service
- Application Layer element (Fill: Green)
  - aggregates: Web App
  - aggregates: Mobile App

**Result**: All services and apps get their respective domain colors across all views.

### Scenario 2: Status-Based Coloring

**Setup**:
- Legend view with property `legend="y"`
- "Planned" element (Fill: Yellow, Text: Black)
- "Active" element (Fill: Green, Text: White)
- "Deprecated" element (Fill: Red, Text: White, Line: Dark Red)

**Result**: All instances marked as planned/active/deprecated get appropriate colors.

### Scenario 3: Hierarchical Coloring

**Setup**:
- Legend view with property `legend="y"`
- Enterprise Architecture element (Fill: Purple)
  - composed of: Business Architecture (Fill: Blue)
    - composed of: Business Process Model
  - composed of: Application Architecture (Fill: Green)

**Result**: 
- Enterprise Architecture: Purple
- Business Architecture: Blue
- Business Process Model: Blue (inherited via composition)
- Application Architecture: Green

## Console Output

The script provides detailed logging:

```
Starting ApplyLegendColors script...

Finding legend views...
Found 2 legend view(s):
  - Color Legend
  - Domain Colors

Collecting colors from legend views...

Processing legend view: Color Legend
  Processing element: Service Component
    Storing colors: Fill=RGB(0,112,192), Text=RGB(255,255,255)
    Found aggregation to: Database
      Added to processing queue: Database
    Found composition to: API Module
      Added to processing queue: API Module
  ...

Applying colors to all views...
Processing view: Application View
  Applied colors to element: Service Component (5 instances)
  Applied colors to element: Database (2 instances)
  ...

Done! Colored 47 element instance(s) across 8 view(s).
```

## Troubleshooting

### Colors Not Applied

**Check**:
1. Legend view has property `legend="y"` (case-sensitive)
2. Elements on legend views have at least one color set
3. Element names match exactly between legend and target views
4. Console output for error messages

### Unexpected Colors

**Reasons**:
1. Element appears on multiple legend views (first-wins)
2. Relationship direction is reversed (colors flow in specific directions)
3. Cycles in relationship structure (cycle detection may stop traversal)

### Partial Coloring

**Possible causes**:
1. Association relationships don't recurse
2. Relationships point in wrong direction for aggregation/composition
3. Element on non-legend view has different ID than legend element

## Requirements

- Archi with jArchi plugin
- At least one view with property `legend="y"`
- Elements with colors defined on legend views

## Related Scripts

- **SyncViewWithModel.ajs**: Uses similar Kernelement concept for view synchronization
- **MarkIsolatedElements.ajs**: Uses relationship traversal for isolation detection

## Author

(c) Y. Moldawski, 2026
