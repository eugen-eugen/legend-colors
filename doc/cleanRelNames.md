# cleanRelNames.ajs

## Overview

Removes redundant relationship names when they consist only of property values. Specifically, when a relationship has multiple "Schnittstelle" properties and the name is just the comma-separated list of those values, the name is cleared.

## Model Elements That Matter

### Relationships

| Element Type | Property | Purpose |
|-------------|----------|---------|
| Any relationship | `Schnittstelle` | Interface property (can have multiple values) |
| Any relationship | `name` | Relationship name to be checked/cleared |

**Important**: The script only processes relationships that:
1. Have a non-empty name
2. Have at least one "Schnittstelle" property

### Property Structure

ArchiMate relationships can have multiple properties with the same key. The script uses:

```javascript
rel.prop("Schnittstelle", true)  // Returns array of ALL values with this key
```

**Example Property Structure**:
```
Relationship: "Interface A, Interface B"
Properties:
  - Schnittstelle: "Interface A"
  - Schnittstelle: "Interface B"
```

## How It Works

### Processing Logic

1. **Find Candidate Relationships**:
   - Iterate through all relationships in the model
   - Skip relationships with empty names
   - Skip relationships without "Schnittstelle" properties

2. **Build Expected Name**:
   - Collect all "Schnittstelle" property values
   - Join with ", " (comma-space separator)
   - Create both forward and reversed versions

3. **Compare Names**:
   - Compare actual name with expected name (both orders)
   - If match: Clear the name (redundant)
   - If different: Log for manual review (contains additional info)

4. **Report Results**:
   - Count cleared names
   - Count skipped names (need review)
   - Show console summary

### Name Matching

**Redundant name** (cleared):
```
Actual: "Interface A, Interface B"
Expected: "Interface A, Interface B"
→ CLEARED
```

**Reversed order** (also cleared):
```
Actual: "Interface B, Interface A"
Expected: "Interface A, Interface B" or "Interface B, Interface A"
→ CLEARED (matches reversed version)
```

**Additional information** (kept for review):
```
Actual: "Main: Interface A, Interface B"
Expected: "Interface A, Interface B"
→ KEPT (contains "Main:")
```

## Usage

### Step 1: Ensure Properties Are Set

1. Review relationships that need cleaning
2. Ensure "Schnittstelle" properties are properly set
3. The relationship name should match the property values

### Step 2: Run the Script

1. Open the model
2. Run: Scripts → `cleanRelNames.ajs`
3. Review console output

### Step 3: Review Flagged Cases

Check console for "REVIEW:" entries:
- These relationships have names that differ from property values
- Manually decide if the additional information should be kept
- Edit the name or properties as needed

### Step 4: Re-run if Needed

After making manual adjustments:
1. Re-run the script
2. Verify all redundant names are cleared
3. Check that no unintended changes occurred

## Example Scenarios

### Scenario 1: Simple Redundant Name

**Before**:
```
Relationship from Service A to Service B:
  Name: "API Gateway, REST"
  Properties:
    - Schnittstelle: "API Gateway"
    - Schnittstelle: "REST"
```

**After**:
```
Relationship from Service A to Service B:
  Name: "" (cleared)
  Properties:
    - Schnittstelle: "API Gateway"
    - Schnittstelle: "REST"
```

**Console Output**:
```
Clearing name for relationship: id-123 (was: 'API Gateway, REST')
```

### Scenario 2: Reversed Order

**Before**:
```
Relationship:
  Name: "REST, API Gateway"
  Properties:
    - Schnittstelle: "API Gateway"
    - Schnittstelle: "REST"
```

**After**:
```
Relationship:
  Name: "" (cleared - matches reversed)
  Properties:
    - Schnittstelle: "API Gateway"
    - Schnittstelle: "REST"
```

### Scenario 3: Additional Information (Not Cleared)

**Before**:
```
Relationship:
  Name: "Primary: API Gateway, REST"
  Properties:
    - Schnittstelle: "API Gateway"
    - Schnittstelle: "REST"
```

**After**:
```
Relationship:
  Name: "Primary: API Gateway, REST" (kept)
  Properties:
    - Schnittstelle: "API Gateway"
    - Schnittstelle: "REST"
```

**Console Output**:
```
REVIEW: Relationship id-456 has name 'Primary: API Gateway, REST' 
  but properties suggest 'API Gateway, REST' or 'REST, API Gateway'
  Source: Service A -> Target: Service B
```

### Scenario 4: No Schnittstelle Properties

**Before**:
```
Relationship:
  Name: "Contains"
  Properties:
    - Type: "Composition"
```

**Result**: Skipped (no "Schnittstelle" properties)

### Scenario 5: Empty Name

**Before**:
```
Relationship:
  Name: ""
  Properties:
    - Schnittstelle: "API"
```

**Result**: Skipped (name already empty)

## Console Output

### Successful Run

```
Starting Clean Relationship Names script...

Clearing name for relationship: id-123 (was: 'API Gateway, REST')
Clearing name for relationship: id-456 (was: 'Database, JDBC')
Clearing name for relationship: id-789 (was: 'REST, HTTPS')

=== Summary ===
Processed relationships with Schnittstelle properties: 3
Names cleared (were redundant): 3
Names kept (contain additional info): 0

Script completed.
```

### With Review Cases

```
Starting Clean Relationship Names script...

Clearing name for relationship: id-123 (was: 'API Gateway, REST')

REVIEW: Relationship id-456 has name 'Primary: Database, JDBC' 
  but properties suggest 'Database, JDBC' or 'JDBC, Database'
  Source: Application -> Target: Database

Clearing name for relationship: id-789 (was: 'REST, HTTPS')

=== Summary ===
Processed relationships with Schnittstelle properties: 3
Names cleared (were redundant): 2
Names kept (contain additional info): 1

Script completed.
```

## Use Cases

### Model Cleanup

Remove redundant relationship names when:
- Names were auto-generated from properties
- Multiple properties were concatenated into name
- Names duplicate information already in properties

### Data Migration

After importing relationships:
- Property values were copied to names
- Need to clean up redundant labeling
- Maintain consistency across model

### Standardization

Enforce convention that:
- Relationship names should not duplicate property values
- Properties hold structured data
- Names only used for additional context

## Troubleshooting

### Nothing Happens

**Check**:
1. Model is open
2. Relationships have non-empty names
3. Relationships have "Schnittstelle" properties
4. Console is visible (View → Console)

### Too Many Names Cleared

**Possible causes**:
1. Properties were meant to be annotations, not the name
2. Names were intentional duplicates

**Prevention**: Review "REVIEW:" entries before running on other models.

### Names Should Match But Don't

**Check**:
1. Comma and space separator (", ") is used correctly
2. Property values have no leading/trailing spaces
3. Order matters: script checks both forward and reversed

**Fix**: Edit property values or name to match exactly.

### Need to Keep Some Names

**Solution**: The script logs mismatches. If you want to keep a name:
1. Add prefix/suffix to make it unique (e.g., "Main: X, Y")
2. Script will skip it and log for review

## Property Key Case Sensitivity

**Important**: Property key "Schnittstelle" is case-sensitive:
- "Schnittstelle" ✓ (correct)
- "schnittstelle" ✗ (not matched)
- "SCHNITTSTELLE" ✗ (not matched)

## Related Scripts

- **ApplyLegendColors.ajs**: Also processes relationships based on properties
- Other scripts that read "Schnittstelle" properties for interface documentation

## Requirements

- Archi with jArchi plugin
- Model with relationships
- Relationships with "Schnittstelle" properties (multiple values possible)

## Author

(c) Y. Moldawski, 2026
