# MarkIsolatedElements.ajs

## Overview

Identifies elements on the selected view that have no relationship path (direct or indirect) to "Kernelement" (core element) attractors and marks them with red visual notes. Helps identify orphaned or disconnected elements in architecture views.

## Model Elements That Matter

### Visual Groups (on Selected View)

| Property | Value | Purpose |
|----------|-------|---------|
| `Kernelement` | (any value) | Direct children are attractors |
| `Kernelement` | `recursive` | All descendants are attractors (follows visual hierarchy) |

**Important**: Only elements that are **visual children** of Kernelement groups become attractors.

### Model Relationships

| Relationship Aspect | Purpose |
|-------------------|---------|
| **Type** | Any relationship type is followed |
| **Direction** | Both incoming and outgoing |
| **Transitivity** | Relationships are followed recursively to find all connected elements |

**Note**: All relationship types count as connections (serving, access, composition, aggregation, association, etc.)

### Element to Check

| Element Type | Checked |
|-------------|---------|
| ArchiMate elements on view | Yes |
| Visual groups | No |
| Notes | No |
| View references | No |

Only ArchiMate model elements (business, application, technology, etc.) are checked for isolation.

## Usage

### Step 1: Mark Core Elements

1. Create a visual group on your view
2. Add property `Kernelement` with any value (or `recursive` for hierarchical)
3. Place your core/central elements inside this group

### Step 2: Select View and Run

1. Select the view to analyze in the model tree
2. Run: Scripts → `MarkIsolatedElements.ajs`
3. Red notes appear next to isolated elements

### Step 3: Review Results

Check the console output and red notes:
- **"Isolated" notes**: Connected to elements with no path to attractors
- **Console**: Lists isolated element names
- **Count**: Shows total isolated elements found

### Step 4: Fix or Document

For each isolated element:
- **Add relationships** to connect to core elements
- **Move to attractor group** if it should be a core element
- **Document reason** for isolation if intentional
- **Remove from view** if not relevant

## How It Works

### Processing Flow

1. **Find Attractors**:
   - Scans view for groups with `Kernelement` property
   - Collects elements from those groups:
     - Direct children if `Kernelement=""` (or any non-"recursive" value)
     - All descendants if `Kernelement="recursive"` (follows visual containment)

2. **Build Connection Map**:
   - For each attractor, recursively traverse relationships
   - Follows both incoming and outgoing relationships
   - Only considers elements present on the view
   - Builds set of all connected element IDs

3. **Identify Isolated Elements**:
   - Gets all ArchiMate elements on the view
   - Excludes:
     - Attractors themselves
     - Elements in the connected set
   - Remaining elements are isolated

4. **Mark Isolated Elements**:
   - Creates red note labeled "Isolated" for each one
   - Positions note 120px to the right, 20px down from element
   - Connects note to element with red line

### Connection Detection

**Connected** means there exists at least one relationship path from an attractor to the element:

```
Attractor A
├── (direct relationship) → Element B ✓ connected
│   └── (relationship) → Element C ✓ connected (indirect)
└── (relationship) → Element D ✓ connected
    └── (relationship) → Element E ✓ connected (indirect)

Element F ✗ isolated (no path)
```

### Recursive Traversal

The script uses a queue-based recursive algorithm:
- Starts from all attractors
- Follows every relationship (incoming/outgoing)
- Tracks visited elements to prevent infinite loops
- Only considers elements that are present on the view
- Continues until no new elements are found

## Example Scenarios

### Scenario 1: Basic Isolation

**View Elements**:
```
Kernelement Group:
  ├── Core Service A

Other elements:
  ├── Service B ← serves → Core Service A
  ├── Database ← accesses from Service B
  ├── Orphan Service ← no relationships
```

**Result**:
- Core Service A: Attractor (not marked)
- Service B: Connected (not marked)
- Database: Connected via Service B (not marked)
- Orphan Service: **ISOLATED** (marked with red note)

### Scenario 2: Recursive Attractors

**View Hierarchy**:
```
Kernelement Group (recursive):
  ├── System Layer
  │   ├── Service A
  │   └── Service B
  └── Data Layer

Other elements:
  ├── Service C ← serves from Service A
  ├── Unconnected Service
```

**Result**: All elements in Kernelement group are attractors. Only "Unconnected Service" is marked as isolated.

### Scenario 3: Indirect Connections

**View Elements**:
```
Kernelement Group:
  └── Core API

Chain:
  Core API → serves → Frontend
  Frontend → accesses → Cache
  Cache → accesses → Database
  
Separate:
  External System ← no relationships to chain
```

**Result**:
- Core API: Attractor
- Frontend, Cache, Database: All connected (indirect)
- External System: **ISOLATED**

### Scenario 4: Bidirectional Connections

**View Elements**:
```
Kernelement Group:
  └── Service A

Relationships:
  Service A → serves → Service B
  Service C → serves → Service A
```

**Result**:
- Service B: Connected (outgoing from attractor)
- Service C: Connected (incoming to attractor)
Both directions count as connections.

## Console Output

```
=== Mark Isolated Elements ===

Selected view: Application Architecture

Finding attractors (Kernelement groups)...
Found 1 Kernelement group(s)
Found 3 attractor(s):
  - Core Service
  - API Gateway
  - Database Layer

Recursively finding elements related to attractors...
Found 12 element(s) connected to attractors (directly or indirectly)

Total archimate elements on view: 18
Attractors: 3
Connected: 12
Isolated: 3

Isolated elements (no connection to attractors):
  - Legacy Module
  - Old Database
  - Temporary Service

Marking isolated elements...
  Marking: Legacy Module
  Marking: Old Database
  Marking: Temporary Service

Done! Marked 3 isolated element(s).
```

## Visual Output

For each isolated element, the script creates:

**Note**:
- Label: "Isolated"
- Fill color: RGB(255, 0, 0) - Red
- Text color: RGB(255, 255, 255) - White
- Position: 120px right, 20px down from element
- Size: 80x30 pixels

**Connection**:
- Type: Visual connection (line)
- Color: RGB(255, 0, 0) - Red
- Width: 2 pixels
- Connects: Note → Element

## Troubleshooting

### No Attractors Found

**Check**:
1. View is selected in model tree
2. View contains visual groups
3. Groups have property `Kernelement` (case-sensitive)
4. Elements are placed inside Kernelement groups

**Fix**: Create a visual group, add `Kernelement` property, place core elements inside.

### All Elements Marked as Isolated

**Possible causes**:
1. Attractor elements have no relationships
2. Relationships exist but targets not on view
3. Relationships are only in model, not visualized

**Check**: Verify relationships exist in model between elements on the view.

### Element Not Marked But Should Be

**Possible causes**:
1. Hidden relationship connection exists
2. Element is an attractor itself
3. Element is in connected set (check console output)

**Fix**: Review console output for "Connected elements" list.

### Wrong Elements Marked

**Check**:
1. Kernelement group contains correct elements
2. Use `Kernelement="recursive"` if nested hierarchy needed
3. Review relationship types being followed

## Use Cases

### Architecture Review

Identify elements that:
- Lost connections during refactoring
- Were added without proper integration
- Should be removed from view
- Need relationship documentation

### Model Quality

Ensure:
- All elements serve a purpose
- Integration patterns are complete
- No orphaned legacy components
- View shows connected architecture

### Migration Planning

Find:
- Services that can be removed independently
- Components with external dependencies
- Elements that need new connections
- Isolated legacy systems

## Requirements

- Archi with jArchi plugin
- A view with at least one Kernelement group
- Elements placed inside Kernelement groups
- View must be selected in model tree before running

## Related Scripts

- **SyncViewWithModel.ajs**: Uses same Kernelement concept for adding related elements
- **lib/attractors.js**: Shared attractor identification library

## Author

(c) Y. Moldawski, 2026
