# MetaFormatting.ajs

## Overview

Applies font and text formatting from meta-model elements and relationships to all matching visual elements and relationships across views. The script copies formatting properties (font size, font name, font style, horizontal alignment, vertical alignment, label expression) from meta-model definitions to ensure consistent visual styling throughout the model.

## Model Elements That Matter

### Meta-Model Definition

| Element | Property | Purpose |
|---------|----------|---------|
| Visual group on view | `meta` | Marks group as meta-model container |
| View reference | Points to view with `meta` property | Alternative meta-model definition |
| Referenced view | `meta` | Marks entire view as meta-model |

**Meta-model location**: Same as used by SyncViewWithModel.ajs

### Meta-Model Elements (Formatting Source)

| Visual Property | Applied To Target |
|----------------|-------------------|
| `fontSize` | Font size in points |
| `font` (fontName) | Font family name |
| `fontStyle` | Normal, bold, italic, bold-italic |
| `textAlignment` | Horizontal: Left, center, right |
| `textPosition` | Vertical: Top, middle, bottom |
| `labelExpression` | Label expression for dynamic labels |

**Important**: Only the visual representation of meta-model elements is used as formatting source.

### Target Elements (Formatted)

| Element Aspect | Matching Rule |
|---------------|---------------|
| **Specialization** | Matches meta-model elements with same specialization name |
| **Type** (no specialization) | Matches meta-model elements with same type AND no specialization |

### Meta-Model Relationships (Formatting Source)

| Visual Property | Applied To Target |
|----------------|-------------------|
| `fontSize` | Font size in points |
| `font` (fontName) | Font family name |
| `fontStyle` | Normal, bold, italic, bold-italic |
| `textAlignment` | Horizontal: Left, center, right |
| `textPosition` | Vertical: Top, middle, bottom |
| `labelExpression` | Label expression for dynamic labels |

**Important**: Only the visual representation of meta-model relationships is used as formatting source.

### Target Relationships (Formatted)

| Relationship Aspect | Matching Rule |
|-------------------|---------------|
| **Specialization** | Matches meta-model relationships with same specialization name |
| **Type** (no specialization) | Matches meta-model relationships with same type AND no specialization |

## How It Works

### Processing Flow

1. **Process All Views**:
   - Iterate through all views in the model
   - Extract meta-model for each view (if defined)

2. **Extract Meta-Model**:
   - Look for visual group with `meta` property
   - Or find view reference pointing to view with `meta` property
   - Collect all elements and relationships in meta-model

3. **Find Matches**:
   - For each visual element on view: Find corresponding meta-model element by specialization or type
   - For each visual relationship on view: Find corresponding meta-model relationship by specialization or type
   - Use first match if multiple found

4. **Extract Formatting**:
   - Get visual properties from meta-model element/relationship visual representation
   - Extract: fontSize, font, fontStyle, textAlignment (horizontal), textPosition (vertical), labelExpression

5. **Apply Formatting**:
   - Copy each property from meta-model to target visual element/relationship
   - Only apply properties that are defined (not null/undefined)

### Matching Logic

**Specialization-based** (priority):
```
Real Element:
  type: "application-component"
  specialization: "Microservice"

Meta-model Element:
  type: "application-component"  (any type works)
  specialization: "Microservice"

→ MATCH (specialization matches)
```

**Type-based** (fallback):
```
Real Element:
  type: "application-component"
  specialization: (none)

Meta-model Element:
  type: "application-component"
  specialization: (none)

→ MATCH (type matches, both have no specialization)
```

**No match** examples:
```
# Different specialization
Real: specialization="Service"
MM: specialization="Component"
→ NO MATCH

# Real has specialization, MM doesn't
Real: type="application-component", specialization="Service"
MM: type="application-component", specialization=(none)
→ NO MATCH

# MM has specialization, Real doesn't
Real: type="application-component", specialization=(none)
MM: type="application-component", specialization="Service"
→ NO MATCH
```

### Relationship Matching Logic

**Specialization-based** (priority):
```
Real Relationship:
  type: "serving-relationship"
  specialization: "REST API"

Meta-model Relationship:
  type: "serving-relationship"  (any type works)
  specialization: "REST API"

→ MATCH (specialization matches)
```

**Type-based** (fallback):
```
Real Relationship:
  type: "serving-relationship"
  specialization: (none)

Meta-model Relationship:
  type: "serving-relationship"
  specialization: (none)

→ MATCH (type matches, both have no specialization)
```

**No match** examples:
```
# Different specialization
Real: specialization="HTTP"
MM: specialization="REST"
→ NO MATCH

# Real has specialization, MM doesn't
Real: type="serving-relationship", specialization="HTTP"
MM: type="serving-relationship", specialization=(none)
→ NO MATCH
```

## Usage

### Step 1: Create Meta-Model View

**Option A: Meta-model group on same view**
1. Create a visual group on your view
2. Add property `meta` to the group
3. Place template elements inside with desired formatting

**Option B: Separate meta-model view**
1. Create a dedicated view for meta-model
2. Add property `meta` to the view
3. Add template elements with desired formatting
4. On target views, add view reference pointing to meta-model view

### Step 2: Format Meta-Model Elements and Relationships

1. Select meta-model elements and relationships
2. Set font properties:
   - Font size (e.g., 12, 14, 16)
   - Font name (e.g., "Arial", "Helvetica", "Segoe UI")
   - Font style (Normal, Bold, Italic, Bold Italic)
   - Text alignment (horizontal): Left, Center, Right
   - Text position (vertical): Top, Middle, Bottom
   - Label expression: Dynamic label pattern (e.g., "${name}", "${type}")

### Step 3: Run Script

1. Open your Archi model
2. Run: Scripts → `MetaFormatting.ajs`
3. Check console for formatting details

### Step 4: Review Results

- Console shows which elements were formatted
- Each formatted element shows source meta-model element
- Formatting properties applied are listed

## Example Scenarios

### Scenario 1: Standardize Specializations

**Meta-model setup**:
```
Meta-model Group (meta=""):
  ├── Application Component (specialization: "Microservice")
  │   └── Formatting: Font=Arial, Size=12, Style=Bold, H-Align=Center, V-Align=Middle
  ├── Application Component (specialization: "Database")
  │   └── Formatting: Font=Courier, Size=10, Style=Normal, H-Align=Left, V-Align=Top
  └── Application Component (specialization: "API Gateway")
      └── Formatting: Font=Arial, Size=14, Style=Bold Italic, H-Align=Center, V-Align=Bottom
```

**View elements**:
```
Service A (specialization: "Microservice")
Service B (specialization: "Microservice")
Database X (specialization: "Database")
Gateway (specialization: "API Gateway")
```

**After script runs**:
- Service A, Service B: Arial, 12pt, Bold, Center, Middle
- Database X: Courier, 10pt, Normal, Left, Top
- Gateway: Arial, 14pt, Bold Italic, Center, Bottom
- Database X: Courier, 10pt, Normal, Left
- Gateway: Arial, 14pt, Bold Italic, Center

### Scenario 2: Separate Meta-Model View

**Meta-model view** (name: "Formatting Standards", property: `meta=""`):
```
Elements with formatting:
  ├── Business Actor → Font: Helvetica, 11pt, Italic
  ├── Business Service → Font: Arial, 12pt, Bold
  └── Application Component → Font: Segoe UI, 12pt, Normal
```

**Target view** (name: "Application Architecture"):
```
Has view reference to "Formatting Standards"

Elements:
  ├── Order Service (Application Component)
  ├── Payment Service (Application Component)
  └── Customer (Business Actor)
```

**Result**:
- Order Service, Payment Service: Segoe UI, 12pt, Normal
- Customer: Helvetica, 11pt, Italic

### Scenario 3: Mixed Specializations and Types

**Meta-model**:
```
Application Component (no specialization):
  Font: Arial, 10pt, Normal, Left

Application Component (specialization: "Backend"):
  Font: Courier, 12pt, Bold, Center
```

**Elements on view**:
```
Generic App (Application Component, no specialization)
Backend Service (Application Component, specialization: "Backend")
Frontend App (Application Component, specialization: "Frontend")
```

**Result**:
- Generic App: Arial, 10pt, Normal, Left (matches type without specialization)
- Backend Service: Courier, 12pt, Bold, Center (matches specialization)
- Frontend App: NOT FORMATTED (no matching specialization in meta-model)

### Scenario 4: Label Expressions

**Meta-model setup**:
```
Meta-model Group (meta=""):
  ├── Application Component (no specialization)
  │   └── Label expression: "${name} : ${type}"
  ├── Business Service (no specialization)
  │   └── Label expression: "[${specialization}] ${name}"
```

**Elements on view**:
```
Order Service (Application Component, specialization: "REST API")
Payment Gateway (Application Component, no specialization)
Customer Management (Business Service, specialization: "Core")
```

**After script runs**:
- Order Service: Label shows "Order Service : application-component"
- Payment Gateway: Label shows "Payment Gateway : application-component"
- Customer Management: Label shows "[Core] Customer Management"

**Note**: Label expressions use placeholders like `${name}`, `${type}`, `${specialization}` to create dynamic labels.

### Scenario 5: Partial Formatting

**Meta-model element formatting**:
```
Business Service:
  Font size: 14
  Font name: (not set, uses default)
  Font style: Bold
  Text alignment: (not set, uses default)
```

**Result**: Only font size and style are applied, name and alignment remain unchanged.

### Scenario 6: Relationship Formatting

**Meta-model setup**:
```
Meta-model Group (meta=""):
  ├── Serving Relationship (specialization: "REST")
  │   └── Formatting: Font=Arial, Size=10, Style=Italic, Label="${name} (REST)"
  ├── Flow Relationship (no specialization)
  │   └── Formatting: Font=Courier, Size=8, Style=Normal, Label="${type}"
```

**Relationships on view**:
```
API Call (Serving Relationship, specialization: "REST")
Data Flow (Flow Relationship, no specialization)
Generic Link (Serving Relationship, no specialization)
```

**After script runs**:
- API Call: Arial, 10pt, Italic, Label="API Call (REST)"
- Data Flow: Courier, 8pt, Normal, Label="flow-relationship"
- Generic Link: NOT FORMATTED (no matching relationship in meta-model - MM has no serving-relationship without specialization)

**Note**: Relationships follow the same matching rules as elements: specialization takes priority, then type (only if both have no specialization).

## Console Output

### Normal Run

```
=== Meta Formatting Script ===

Processing view: Application Layer
  Meta-model found with 5 element(s) and 3 relationship(s)
  Formatted 8 element(s) and 2 relationship(s) in this view

Processing view: Business Layer
  No meta-model found, skipping

Processing view: Technology Layer
  Meta-model found with 3 element(s) and 1 relationship(s)
  Formatted 4 element(s) and 1 relationship(s) in this view


=== Summary ===
Total views processed: 3
Views with meta-model: 2
Total elements formatted: 12
Total relationships formatted: 3

=== Formatting Details ===
    ✓ Order Service ← Application Component (size:12, font:Arial, style:FONT_BOLD, h-align:2, v-align:1, label:${name} : ${type})
    ✓ Payment Service ← Application Component (size:12, font:Arial, style:FONT_BOLD, h-align:2, v-align:1)
    ✓ Database ← Data Object (size:10, font:Courier, style:FONT_NORMAL, h-align:1, v-align:0)
    ✓ API Gateway ← Application Component (size:14, font:Arial, style:FONT_BOLD_ITALIC, h-align:2, v-align:1)
    ✓ serving-relationship ← serving-relationship (size:10, font:Arial, style:FONT_ITALIC, label:${name} (REST))
    ✓ flow-relationship ← flow-relationship (size:8, font:Courier, style:FONT_NORMAL, label:${type})
    ...

=== Meta Formatting Complete ===
```

### No Meta-Models Found

```
=== Meta Formatting Script ===

Processing view: View 1
  No meta-model found, skipping

Processing view: View 2
  No meta-model found, skipping


=== Summary ===
Total views processed: 2
Views with meta-model: 0
Total elements formatted: 0

=== Meta Formatting Complete ===
```

### With Warnings

```
Processing view: Architecture Overview
  Meta-model found with 4 element(s)
    Warning: Could not get formatting for Legacy System (matched to System)
  Formatted 3 element(s) in this view
```

## Font Style Values

jArchi uses numeric constants for font styles:

| Style | Constant | Value |
|-------|----------|-------|
| Normal | `FONT_NORMAL` | 0 |
| Bold | `FONT_BOLD` | 1 |
| Italic | `FONT_ITALIC` | 2 |
| Bold Italic | `FONT_BOLD_ITALIC` | 3 |

## Text Alignment Values

### Horizontal Alignment (textAlignment)

| Alignment | Value |
|-----------|-------|
| Left | 1 |
| Center | 2 |
| Right | 4 |

### Vertical Alignment (textPosition)

| Position | Value |
|----------|-------|
| Top | 0 |
| Middle | 1 |
| Bottom | 2 |

## Label Expressions

Label expressions allow dynamic labels based on element properties. Common placeholders:

| Placeholder | Description | Example |
|------------|-------------|---------|
| `${name}` | Element name | "Order Service" |
| `${type}` | Element type | "application-component" |
| `${specialization}` | Specialization value | "Microservice" |
| `${documentation}` | Documentation text | Element's documentation |
| `${property:key}` | Custom property value | Value of property "key" |

**Example expressions**:
- `${name}` - Just the element name
- `${name} : ${type}` - Name with type
- `[${specialization}] ${name}` - Specialization prefix
- `${name}\n(${type})` - Name with type on new line

**Note**: Label expressions are evaluated dynamically by Archi when the view is displayed. If a placeholder references a property that doesn't exist, it typically appears as empty or literal text.

## Use Cases

### Standardize Layer Styling

Apply consistent formatting to elements by layer:
- Business layer: Larger font, bold
- Application layer: Medium font, normal
- Technology layer: Smaller font, italic

### Specialize Element Styling

Different specializations of same type get different styling:
- "Microservice" → Modern sans-serif, bold
- "Monolith" → Traditional serif, normal
- "Legacy" → Smaller size, italic

### Project-Wide Consistency

Define formatting standards once in meta-model:
- All views reference the same meta-model
- One script run applies formatting everywhere
- Changes to meta-model propagate by re-running

### Documentation Standards

Enforce documentation formatting:
- Titles: Large, bold, centered
- Descriptions: Normal, left-aligned
- Notes: Small, italic

### Dynamic Labels

Use label expressions for consistent label patterns:
- Show element type with name: `${name} : ${type}`
- Display specialization: `[${specialization}] ${name}`
- Include custom properties: `${name} (${property:version})`
- Multi-line labels: `${name}\n${type}`

Apply same expression to all elements of a type for consistency.

## Troubleshooting

### Elements Not Formatted

**Check**:
1. View has meta-model defined (group or view reference)
2. Element has matching meta-model element (same specialization or type)
3. Meta-model element has visual formatting set
4. Matching rules: specialization takes priority over type

**Debug**: Check console output for "No meta-model found" or element count.

### Wrong Formatting Applied

**Possible causes**:
1. Multiple meta-model elements match (first one used)
2. Specialization vs. type confusion
3. Meta-model element formatting not set correctly

**Fix**: Review meta-model, ensure unique specializations or types.

### Some Properties Not Applied

**Expected behavior**: Only properties with values are applied.

**Check**: In meta-model, ensure all desired properties are explicitly set (not default/undefined).

### Warning: Could Not Get Formatting

**Cause**: Meta-model element not visually represented on meta-model view.

**Fix**: Ensure meta-model elements are placed on the meta-model view with visual representations.

### Formatting Resets After Re-opening Model

**Not a bug**: Archi saves formatting per visual element.

**Solution**: Run script again or save model after formatting.

## Specialization Property

**Case-sensitive**: Specialization matching is case-sensitive:
- "Microservice" ≠ "microservice"
- "API Gateway" ≠ "api gateway"

**Exact match required**: Use consistent naming in specializations.

## Related Scripts

- **SyncViewWithModel.ajs**: Also uses meta-model for relationship validation
- **ApplyLegendColors.ajs**: Applies colors (complementary to formatting)

## Requirements

- Archi with jArchi plugin
- At least one view with meta-model defined
- Meta-model elements with visual formatting properties set

## Author

(c) Y. Moldawski, 2026
