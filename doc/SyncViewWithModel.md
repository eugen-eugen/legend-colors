# SyncViewWithModel.ajs

## Overview

Keeps views in sync with the model by automatically adding newly related elements to views. Only elements marked as "Kernelement" (core elements) attract new related elements. New elements are added to a "New Elements" group, and the view name is prefixed with "review-" for easy identification.

## Model Elements That Matter

### Visual Groups (on Views)

| Property | Value | Purpose |
|----------|-------|---------|
| `Kernelement` | (any value) | Direct children are attractors |
| `Kernelement` | `recursive` | All descendants (children, grandchildren, etc.) are attractors |
| `debug` | `true` | Enables detailed debug logging for that view |
| `meta` | `true` | Marks a view as containing the meta-model definition |

**Important**: Elements must be **visual children** of the Kernelement group on the view to be attractors.

### Visual Group for Meta-Model

| Property | Value | Purpose |
|----------|-------|---------|
| `meta` | (any value) | Marks a group as containing the meta-model |
| `debug` | `true` | Enables meta-model debug logging |

### View References

| Element Type | Property | Purpose |
|-------------|----------|---------|
| View Reference | Points to view with `meta` property | Enables meta-model from referenced view |

### Model Elements

| Element Type | Property | Value | Purpose |
|-------------|----------|-------|---------|
| Any element | `no-auto-sync` | (any value) | Excludes element from auto-synchronization |
| Element | `specialization` | (varies) | Used for meta-model matching |

### Relationships

**Without Meta-Model**: All relationships are followed to find related elements.

**With Meta-Model**: Only relationships allowed by the meta-model are followed (see Meta-Model section).

## Usage

### Basic Usage (No Meta-Model)

1. **Mark Core Elements**:
   - Create a visual group on your view
   - Add property `Kernelement` with any value (or `recursive` for hierarchical collection)
   - Place core elements inside this group

2. **Run Script**:
   - Scripts → `SyncViewWithModel.ajs`
   - New related elements will be added to "New Elements" group
   - View name prefixed with "review-"

3. **Review and Organize**:
   - Check newly added elements
   - Move them to appropriate locations
   - Remove "review-" prefix from view name

### Advanced Usage with Meta-Model

Meta-models define which relationships are allowed between which types of elements.

#### Option 1: Meta-Model in Visual Group

1. **Create Meta-Model Group**:
   - On the same view or any view, create a visual group
   - Add property `meta` with any value
   - Add elements representing allowed types
   - Connect them with allowed relationships

2. **Define Allowed Patterns**:
   - Place element types in the meta-model group
   - Draw relationships between them
   - Use specializations for specific matching

3. **Run Script**: Only relationships matching the meta-model will be followed

#### Option 2: Meta-Model from Referenced View

1. **Create Meta-Model View**:
   - Create a separate view for the meta-model
   - Add property `meta="true"` to the view itself
   - Place all allowed element types on this view
   - Draw all allowed relationships

2. **Link to Working View**:
   - On your working view, add a view reference element
   - Point it to the meta-model view
   - The script automatically detects and uses it

3. **Run Script**: Meta-model from referenced view is applied

## How It Works

### Processing Flow

1. **Find Kernelement Groups**: Scans view for groups with `Kernelement` property
2. **Collect Attractors**: 
   - If `Kernelement=""` or non-"recursive": Direct visual children only
   - If `Kernelement="recursive"`: All visual descendants (follows view containment hierarchy)
3. **Extract Meta-Model**: 
   - Looks for visual group with `meta` property on current view
   - OR looks for view reference pointing to view with `meta` property
   - OR no meta-model (all relationships allowed)
4. **Find Related Elements**: For each attractor:
   - Gets all model relationships (incoming and outgoing)
   - Filters by meta-model if present
   - Excludes elements with `no-auto-sync` property
   - Excludes elements already on view
5. **Add to View**:
   - Creates/finds "New Elements" group
   - Adds missing elements to group (stacked vertically)
   - Adds visual connections for relationships
   - Prefixes view name with "review-"

### Kernelement: Direct vs Recursive

**Direct (`Kernelement=""`):**
```
Visual Group (Kernelement="")
├── Element A ← Attractor
├── Visual Group
│   └── Element B ← NOT an attractor (nested)
└── Element C ← Attractor
```

**Recursive (`Kernelement="recursive"`):**
```
Visual Group (Kernelement="recursive")
├── Element A ← Attractor
├── Visual Group
│   └── Element B ← Attractor (follows visual hierarchy)
└── Element C ← Attractor
```

## Meta-Model

### Purpose

Meta-models restrict which relationships are followed during synchronization, preventing unwanted elements from being added.

### Meta-Model Structure

**Elements**:
- Represent allowed element types
- Use `type` for general matching (e.g., "application-component")
- Use `specialization` for specific matching (e.g., specialization="GK" for specific components)

**Relationships**:
- Only relationships present in meta-model between allowed types are followed
- Direction matters: relationship must exist from source to target
- Aggregation and composition are treated as equivalent

### Matching Rules

1. **With Specialization**: 
   - Real element with specialization "GK" matches MM element with specialization "GK"
   - Matches any MM element type with that specialization

2. **Without Specialization**:
   - Real element without specialization matches MM element:
     - Same type (e.g., "application-component")
     - AND no specialization on MM element

3. **Specialization Inheritance**:
   - If MM has specialization relationships (generalization)
   - Specific elements inherit allowed relationships from general elements
   - Example: "GK" specializes "Application" → GK inherits Application's relationships

### Meta-Model Examples

#### Example 1: Simple Type-Based

**Meta-Model**:
```
[Application Component]
  → serves → [Application Component]
  → serves → [Technology Service]
```

**Result**: 
- Application components can discover other applications
- Application components can discover technology services
- Other relationship types are ignored

#### Example 2: Specialization-Based

**Meta-Model Elements**:
- Application Component (specialization="GK")
- Application Component (specialization="Register")
- Application Interface (specialization="Schnittstelle")

**Meta-Model Relationships**:
- GK → serves → Schnittstelle
- Register → serves → Schnittstelle

**Matching**:
- Real element with spec "GK" matches MM "GK" element
- Real "serves" relationship from GK to Schnittstelle is allowed
- Real "serves" relationship from GK to "Register" is NOT allowed (not in MM)

#### Example 3: Referenced View Meta-Model

**View: "Meta-Model"** (property `meta="true"`):
```
[Business Service]
[Application Component]
[Application Interface]
[Data Object]

Business Service → serves → Application Component
Application Component → accesses → Data Object
Application Component → serves → Application Interface
```

**Working View**: 
- Add view reference pointing to "Meta-Model" view
- Script automatically uses meta-model from referenced view

### Debug Mode

Enable detailed meta-model logging:

**For Kernelement groups**:
- Add property `debug="true"` to Kernelement group

**For Meta-Model**:
- Add property `debug="true"` to meta-model group
- OR add `debug="true"` to referenced meta-model view

**Debug Output Shows**:
- Which attractors are found
- Which relationships are being checked
- Why relationships are accepted/rejected
- Meta-model matching details
- Which elements are skipped and why

## Example Scenarios

### Scenario 1: Basic Synchronization

**Model**:
```
Service A: no-auto-sync property
Service B ← on view (in Kernelement group)
Service C ← related to Service B
Service D ← related to Service C
```

**Result**:
- Service C added to view (directly related to attractor)
- Service D added to view (related to Service C)
- Service A NOT added (has no-auto-sync property)

### Scenario 2: With Meta-Model Filtering

**Model**:
```
App Component (spec: GK) ← attractor
  → serves → Interface (spec: Schnittstelle)
  → accesses → Database
  → composed of → Module
```

**Meta-Model**:
```
GK → serves → Schnittstelle
```

**Result**:
- Interface added (serves relationship allowed by MM)
- Database NOT added (accesses not in MM)
- Module NOT added (composition not in MM)

### Scenario 3: Recursive Collection

**View Hierarchy**:
```
Visual Group (Kernelement="recursive")
├── System A
└── Visual Group "Subsystems"
    ├── Subsystem B
    └── Visual Group "Components"
        └── Component C
```

**Result**: All three elements (System A, Subsystem B, Component C) are attractors.

## Console Output

### Without Debug

```
Starting Sync View With Model script...

Processing view: Application Architecture
  Meta-model enabled for this view
  Found 2 attractor(s)
  Found 5 missing element(s) to add
  Created 'New Elements' group
    Added: Service X (application-component)
    Added: Interface Y (application-interface)
    ...
  Adding relationships...
  Added 8 relationship(s)
  Renamed view to: review-Application Architecture
```

### With Debug

```
Starting Sync View With Model script...

Processing view: Application Architecture
  Meta-model enabled for this view
    Debug mode ENABLED for meta-model
    Meta-model has 8 element(s)
    Meta-model has 12 relationship(s)
  Found Kernelement group: Core Elements (Kernelement=recursive)
    Using recursive collection (visual hierarchy)
      Processing children of: Core Elements (group)
        Recursive child: Service A (application-component)
        Recursive child: Service B (application-component)
  Found 2 attractor(s)
  
  Checking relationships for: Service A
    Checking: Service A → serves → Interface X
      Source: Service A (spec: GK)
      Target: Interface X (spec: Schnittstelle)
      MM matches for source: 1
      MM matches for target: 1
      → Relationship ALLOWED by meta-model
    
    Checking: Service A → accesses → Database Y
      Source: Service A (spec: GK)
      Target: Database Y (spec: none)
      MM matches for source: 1
      MM matches for target: 0
      → Skipping Interface X (relationship accesses-relationship not allowed by meta-model)
  
  Found 3 missing element(s) to add
  ...
```

## Troubleshooting

### No Elements Added

**Check**:
1. Kernelement group exists with property `Kernelement`
2. Elements are visual children of the group
3. Attractors have relationships in the model
4. Related elements are not already on the view
5. Related elements don't have `no-auto-sync` property
6. If using meta-model: relationships are allowed

**Enable debug**: Add `debug="true"` to Kernelement group

### Wrong Elements Added

**Check**:
1. Meta-model is correctly defined
2. Relationship directions in meta-model
3. Specializations match between real elements and MM
4. Meta-model group has property `meta`

**Enable meta-model debug**: Add `debug="true"` to meta-model group/view

### Elements Not Following Hierarchy

**Check**:
1. Visual containment on the view (not model relationships)
2. `Kernelement="recursive"` (not just `Kernelement=""`)

## Requirements

- Archi with jArchi plugin
- At least one view with Kernelement group
- Elements placed as visual children of Kernelement group

## Related Scripts

- **MarkIsolatedElements.ajs**: Uses same Kernelement concept for isolation detection
- **lib/attractors.js**: Shared attractor identification library
- **lib/metamodel.js**: Meta-model extraction and validation library

## Author

(c) Y. Moldawski, 2026
