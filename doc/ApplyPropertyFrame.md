# ApplyPropertyFrame.ajs

## Overview

Applies visual borders to selected elements based on temporal properties. Elements with "ab" (from) or "bis" (to) properties get a thick dashed border with color contrasted to their fill color. Elements without these properties get default styling.

## Model Elements That Matter

### Element Properties

| Property | Purpose | Visual Effect |
|----------|---------|---------------|
| `ab` | Start date/version | Thick dashed complement-colored border |
| `bis` | End date/version | Thick dashed complement-colored border |
| (none) | No temporal info | Default thin solid border |

**Important**: Only the **concept's** properties are checked, not the visual element properties.

### Visual Element Styling

The script modifies these visual attributes:

| Attribute | Highlighted (ab/bis) | Default |
|-----------|---------------------|---------|
| `lineStyle` | `LINE_STYLE.DASHED` | `LINE_STYLE.LINE` |
| `lineWidth` | `3` (thick) | `1` (thin) |
| `lineColor` | Complement of fill color | `null` (auto) |
| `deriveLineColor` | `false` (explicit) | `true` (derived) |

## How It Works

### Processing Flow

1. **Get Selection**:
   - Filters selection to visual elements only
   - Requires at least one element selected

2. **Check Each Element**:
   - Reads concept properties: `ab` or `bis`
   - If either property exists: Apply highlighted frame
   - If neither property exists: Apply default frame

3. **Calculate Complement Color**:
   - For highlighted elements: Calculate complement of fill color
   - RGB values are inverted: `(255-R, 255-G, 255-B)`
   - If no fill color: Default to red `#ff0000`

4. **Apply Styling**:
   - Set line style, width, color
   - Disable color derivation for highlighted elements
   - Enable color derivation for default elements

### Color Complement Calculation

**Formula**: Each RGB component is inverted:
```
R' = 255 - R
G' = 255 - G
B' = 255 - B
```

**Examples**:
| Fill Color | RGB | Complement | RGB |
|------------|-----|------------|-----|
| Blue `#0000ff` | (0,0,255) | Yellow `#ffff00` | (255,255,0) |
| Red `#ff0000` | (255,0,0) | Cyan `#00ffff` | (0,255,255) |
| Green `#00ff00` | (0,255,0) | Magenta `#ff00ff` | (255,0,255) |
| White `#ffffff` | (255,255,255) | Black `#000000` | (0,0,0) |
| Light Blue `#add8e6` | (173,216,230) | Light Orange `#522719` | (82,39,25) |

## Usage

### Step 1: Add Temporal Properties

To elements that represent temporal states:
1. Select the element in model tree
2. Add property `ab` with start date/version
3. Or add property `bis` with end date/version
4. Or both for a time range

**Example Properties**:
```
ab: "2024-Q1"
bis: "2024-Q4"
```

### Step 2: Select Elements on View

1. Open a view
2. Select one or more visual elements
3. Can select elements with and without properties

### Step 3: Run Script

1. Run: Scripts → `ApplyPropertyFrame.ajs`
2. Check console output for details
3. View updates with new borders

### Step 4: Review Results

- **Dashed thick borders**: Elements with temporal properties
- **Thin solid borders**: Elements without temporal properties
- **Border colors**: Contrasted to element fill colors

## Example Scenarios

### Scenario 1: Migration Timeline Elements

**Elements**:
```
Service A:
  ab: "2024-Q1"
  Fill: Blue (#0000ff)

Service B:
  bis: "2024-Q2"
  Fill: Green (#00ff00)

Service C:
  (no temporal properties)
  Fill: Gray (#cccccc)
```

**After Running Script**:
```
Service A:
  Border: Dashed, 3px, Yellow (#ffff00)

Service B:
  Border: Dashed, 3px, Magenta (#ff00ff)

Service C:
  Border: Solid, 1px, Default color
```

### Scenario 2: Mixed Selection

**Selected on View**:
- 5 elements with "ab" property
- 3 elements with "bis" property
- 2 elements with both "ab" and "bis"
- 4 elements with no temporal properties

**Result**:
- 10 elements get highlighted frame (5+3+2)
- 4 elements get default frame
- Each highlighted element has unique border color based on fill

### Scenario 3: No Fill Color

**Element**:
```
Service X:
  ab: "2025"
  Fill: none (transparent)
```

**Result**:
```
Service X:
  Border: Dashed, 3px, Red (#ff0000)
  (default for elements without fill)
```

### Scenario 4: Only View References Selected

**Selection**: 2 view references, 1 group

**Result**: Script exits with alert:
```
"Please select at least one visual element."
```

Visual groups and view references are not processed.

## Console Output

### Normal Run

```
Starting Apply Property Frame script...

--- Selection Info ---
Total selected items: 5
  - Type: ArchiMateElement, Name: Service A, ID: id-123
  - Type: ArchiMateElement, Name: Service B, ID: id-456
  - Type: ArchiMateElement, Name: Database, ID: id-789
  - Type: ArchiMateElement, Name: Legacy App, ID: id-321
  - Type: ArchiMateElement, Name: New Module, ID: id-654
--- End Selection Info ---

  - Applied highlighted frame to element: Service A (has property: ab) (Fill: #0000ff, Border: #ffff00)
  - Applied highlighted frame to element: Service B (has property: bis) (Fill: #00ff00, Border: #ff00ff)
  - Applied default frame to element: Database (no 'ab' or 'bis' property)
  - Applied highlighted frame to element: Legacy App (has property: bis) (Fill: #cccccc, Border: #333333)
  - Applied default frame to element: New Module (no 'ab' or 'bis' property)

Property Frame script completed successfully.
```

### No Elements Selected

```
Starting Apply Property Frame script...

--- Selection Info ---
Total selected items: 0
--- End Selection Info ---

No visual elements selected.
```

Alert dialog: "Please select at least one visual element."

## Visual Examples

### Before Script

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Service A  │  │  Service B  │  │  Service C  │
│  (blue)     │  │  (green)    │  │  (gray)     │
│  ab: 2024   │  │  bis: 2025  │  │  (no prop)  │
└─────────────┘  └─────────────┘  └─────────────┘
(all default thin borders)
```

### After Script

```
┏━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━┓  ┌─────────────┐
┃  Service A  ┃  ┃  Service B  ┃  │  Service C  │
┃  (blue)     ┃  ┃  (green)    ┃  │  (gray)     │
┃  ab: 2024   ┃  ┃  bis: 2025  ┃  │  (no prop)  │
┗━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━┛  └─────────────┘
(yellow dashed)  (magenta dash)   (default)
```

## Use Cases

### Migration Planning

Highlight elements by lifecycle phase:
- `ab`: When element will be introduced
- `bis`: When element will be decommissioned
- Visual distinction helps see timeline at a glance

### Version Management

Mark elements by version:
- `ab: "v2.0"`: New in version 2.0
- `bis: "v1.5"`: Removed after version 1.5
- High contrast borders make version changes obvious

### Temporal Architecture Views

Create views showing:
- Current state (no properties)
- Future additions (`ab` property)
- Planned removals (`bis` property)
- One script run styles all elements correctly

## Troubleshooting

### Borders Not Applied

**Check**:
1. Elements are actually selected (not just view selected)
2. Selection includes visual elements (not just groups/notes)
3. Properties are on the **concept**, not the visual element

### Wrong Border Color

**Possible causes**:
1. Fill color is too similar to complement
2. No fill color (defaults to red)

**Solutions**:
- Adjust element fill color
- Manually set border color after script runs

### Can't See Dashed Border

**Check**:
1. View zoom level (zoom in to see details)
2. Element size (very small elements may not show dash pattern)
3. Border might be same color as background

### Properties Exist But Default Border Applied

**Check**:
1. Property key is exactly `ab` or `bis` (case-sensitive)
2. Property is on the concept, not just the visual element
3. Property value is not empty/null

**Fix**: Add properties to the underlying ArchiMate element in model tree.

### Elements With Both Properties

Elements with both `ab` and `bis` properties:
- Get highlighted frame (same as one property)
- Console shows whichever property is found first (`ab` checked before `bis`)

## Property Naming

**Case Sensitivity**: Property keys are case-sensitive:
- `ab` ✓ (correct)
- `Ab` ✗ (not matched)
- `AB` ✗ (not matched)

**Property Values**: Values can be any string:
- Dates: "2024-01-15"
- Versions: "v2.0"
- Quarters: "2024-Q3"
- Milestones: "Phase 2"

## Related Scripts

- **ApplyLegendColors.ajs**: Also styles elements based on properties
- Other temporal visualization scripts

## Requirements

- Archi with jArchi plugin
- At least one visual element selected
- Elements on an open view

## Author

(c) Y. Moldawski
