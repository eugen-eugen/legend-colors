# ArrangeOnBorder.ajs

## Overview

Arranges selected visual elements along the perimeter of a rectangular frame. Elements are distributed evenly on four sides (top, right, bottom, left) around the center of the current selection. Useful for creating clean boundary layouts showing external systems or actors.

## Model Elements That Matter

### Visual Elements

| Element Type | Used For |
|-------------|----------|
| Any visual ArchiMate elements | Positioned on border |
| Visual groups | Positioned on border |
| Notes | Positioned on border |

**Important**: This script works with **any** visual objects on the view, not just ArchiMate elements.

### Element Dimensions

| Aspect | Purpose |
|--------|---------|
| Width | Used to calculate horizontal spacing |
| Height | Used to calculate vertical spacing |
| Position | Used to determine initial center and closest target position |

**Largest Element**: The largest element's dimensions determine the spacing grid for the rectangular frame.

## How It Works

### Algorithm Overview

1. **Find Maximum Dimensions**:
   - Scan all selected elements
   - Find widest element (max width)
   - Find tallest element (max height)
   - Use these as spacing units

2. **Calculate Center Point**:
   - Average the center coordinates of all selected elements
   - This becomes the center of the rectangular frame

3. **Calculate Grid Dimensions (n × m)**:
   - Solve for square-ish rectangle: `a*n = b*m` (width ≈ height)
   - Ensure all elements fit: `2*n + 2*(m-2) = N` (perimeter formula)
   - Where: `N`=total elements, `a`=max width, `b`=max height, `n`=horizontal count, `m`=vertical count

4. **Distribute Elements**:
   - Top side: `n` elements (including corners)
   - Right side: `m-2` elements (excluding corners)
   - Bottom side: `n` elements (including corners)
   - Left side: `m-2` elements (excluding corners)
   - Adjust if `N` doesn't match ideal: `2*n + 2*(m-2)`

5. **Generate Target Positions**:
   - Calculate evenly-spaced positions along each side
   - Corners are shared between sides

6. **Match Elements to Positions**:
   - For each target position, find the closest unassigned element
   - Position that element at the target (centered)
   - Mark element as assigned
   - Continue until all elements are positioned

### Mathematical Foundation

**System of equations**:
```
1. a*n = b*m           (square-ish shape)
2. 2*n + 2*(m-2) = N   (element distribution)
```

**Solution**:
```
m = a*(N+4) / (2*(a+b))
n = (N+4)/2 - m

Then round up: m = ceil(m), n = ceil(n)
```

**Where**:
- `N` = Total number of elements
- `a` = Width of largest element
- `b` = Height of largest element
- `n` = Horizontal element count (top/bottom)
- `m` = Vertical element count (including corners)

### Element Distribution

**Ideal case** (when `N = 2*n + 2*(m-2)`):
```
Corner positions:
    [0]───[1]───[2]───[n-1]     ← Top side (n elements)
     │                   │
    [.] Right         [.] Left
     │   (m-2)        │  (m-2)
     │                   │
[n+m-2]─────────[2n+m-3]         ← Bottom side (n elements)
```

**Adjustment**: If actual `N` differs from ideal:
- Extra elements: Add to top, bottom, right, left (in that order)
- Fewer elements: Remove from right, left, bottom, top (in that order)

### Position Calculation

**Rectangle dimensions**:
```
Width = a * n
Height = b * m
```

**Starting corner** (top-left):
```
startX = centerX - width/2
startY = centerY - height/2
```

**Side positions**:
- **Top**: Evenly spaced from `startX` to `startX + width`
- **Right**: Evenly spaced from `startY` to `startY + height` (excluding corners)
- **Bottom**: Evenly spaced from `startX + width` to `startX` (right to left)
- **Left**: Evenly spaced from `startY + height` to `startY` (bottom to top, excluding corners)

## Usage

### Step 1: Select Elements

1. Open a view
2. Select at least 4 visual elements
3. Can select any mix of element types

### Step 2: Run Script

1. Run: Scripts → `ArrangeOnBorder.ajs`
2. Console shows calculation details
3. Elements are repositioned

### Step 3: Review Layout

- Elements are arranged on rectangular border
- Spacing is uniform based on largest element
- Center point remains roughly in the same place

### Step 4: Adjust if Needed

- Re-run with different selection to adjust
- Manually fine-tune positions after script
- Add/remove elements and re-run

## Example Scenarios

### Scenario 1: Basic Border (8 elements)

**Before**:
```
Random positions:
  [A]    [B]
     [C]   [D]
  [E]
     [F] [G]
  [H]
```

**After** (arranged on border):
```
[A]──────[B]──────[C]
 │                  │
[H]                [D]
 │                  │
[G]──────[F]──────[E]
```

**Console**:
```
n (horizontal): 3
m (vertical): 4
Distribution - Top: 3, Right: 2, Bottom: 3, Left: 2
```

### Scenario 2: Many Elements (16 elements)

**Calculation**:
```
n=5, m=4
Distribution:
  Top: 5
  Right: 2
  Bottom: 5
  Left: 2
Total: 5+2+5+2 = 14 (need 16)
After adjustment: Top: 6, Right: 2, Bottom: 6, Left: 2
```

**Result**:
```
[1]─────[2]─────[3]─────[4]─────[5]─────[6]
 │                                        │
[16]                                     [7]
 │                                        │
[15]                                     [8]
 │                                        │
[14]────[13]────[12]────[11]────[10]─────[9]
```

### Scenario 3: Few Elements (4 elements)

**Minimum case**:
```
[A]──────[B]
 │        │
 │        │
 │        │
[D]──────[C]
```

Each corner gets one element.

### Scenario 4: Different Element Sizes

**Elements**:
- Large element: 200×100
- Small elements: 50×50

**Spacing based on largest**:
- Horizontal spacing: 200px
- Vertical spacing: 100px
- Small elements have more space between them

### Scenario 5: Closest Match Assignment

**Initial positions**:
```
Selection center: (500, 300)
Element A at (100, 100) - far top-left
Element B at (900, 100) - far top-right
Element C at (500, 500) - bottom center
```

**Target positions generated**:
```
Top-left: (400, 200)
Top-right: (600, 200)
Bottom-center: (500, 400)
```

**Assignment** (closest match):
- Element A → Top-left (shortest distance)
- Element B → Top-right (shortest distance)
- Element C → Bottom-center (shortest distance)

## Console Output

### Normal Run

```
Arranging 8 elements on border

Calculating n and m for totalElements=8, a=120, b=80
m=3.2 n=2.4
rectangle width (a*n): 288 rectangle height (b*m): 256
rectangle width (a*n): 360 rectangle height (b*m): 320

Max element size: 120 x 80
Center point: (500, 300)
n (horizontal): 3, m (vertical): 4
with= 360 height= 320
Rectangle dimensions: 360 x 320
Distribution - Top: 3, Right: 2, Bottom: 3, Left: 2

Generated 10 target positions

Elements arranged successfully!
```

### Small Selection

```
(Alert dialog appears)
"Please select at least 4 elements to arrange on a border"
```

Script exits - need at least 4 elements.

## Visual Examples

### Before Arrangement

```
      Elements scattered:
   ╔════╗
   ║ A  ║  ╔════╗
   ╚════╝  ║ B  ║
        ╔════╗════╝
  ╔════╗║ C  ║
  ║ D  ║╚════╝
  ╚════╝   ╔════╗
        ╔════╗ E  ║
        ║ F  ║╚════╝
        ╚════╝
    ╔════╗
    ║ G  ║
    ╚════╝  ╔════╗
            ║ H  ║
            ╚════╝
```

### After Arrangement

```
      Clean border layout:
   ╔════╗────╔════╗────╔════╗
   ║ A  ║    ║ B  ║    ║ C  ║
   ╚════╝    ╚════╝    ╚════╝
     │                    │
   ╔════╗                ╔════╗
   ║ H  ║                ║ D  ║
   ╚════╝                ╚════╝
     │                    │
   ╔════╗                ╔════╗
   ║ G  ║                ║ E  ║
   ╚════╝                ╚════╝
     │                    │
   ╔════╗────╔════╗────╔════╗
   ║ F  ║    ║ E  ║    ║ D  ║
   ╚════╝    ╚════╝    ╚════╝
```

## Use Cases

### External Systems View

Arrange external systems around core architecture:
- Core components in center (not selected)
- External systems on border (selected)
- Clear visual separation

### Context Diagram

Create context views:
- Central system (not selected, stays in place)
- External actors/systems on border (selected)
- Shows system boundaries

### Layer Boundaries

Visualize layer interfaces:
- Top: External users
- Right: External services
- Bottom: Infrastructure
- Left: Legacy systems

### Clean Up Crowded Views

When view has random positioning:
1. Select peripheral elements
2. Run script to organize on border
3. Manually position central elements
4. Results in clean, organized view

## Troubleshooting

### "Please select at least 4 elements"

**Cause**: Fewer than 4 elements selected

**Fix**: Select at least 4 visual elements on the view

### Elements Overlap After Arrangement

**Possible causes**:
1. Many elements are much larger than the largest
2. Too many elements for the calculated frame size

**Solutions**:
- Manually increase spacing after script
- Resize smaller elements
- Use multiple border arrangements (group subsets)

### Center Point Shifts

**Cause**: The center is calculated from current positions

**Explanation**: This is expected - elements move to border while keeping approximate center

**If unwanted**: Manually note center position before running, adjust after

### Elements Not Evenly Spaced

**Check**:
1. Element sizes vary significantly
2. Distribution adjustment added extra elements to some sides

**Explanation**: Spacing is based on largest element, smaller elements appear more spread out

### Wrong Side Assignment

**Cause**: Closest-match algorithm assigns element to nearest target position

**Solution**: 
- Manually move elements before running if specific side assignment needed
- Or manually swap elements after script runs

### Some Elements Don't Move

**Check**: All desired elements are actually selected

**Verify**: Console shows correct number of elements being arranged

## Performance

**Complexity**: O(n²) for closest-match assignment
- Acceptable for typical view sizes (10-50 elements)
- May be slow for very large selections (100+ elements)

## Requirements

- Archi with jArchi plugin
- At least 4 visual elements selected on a view
- Elements must be on the same view

## Related Scripts

- **ArrangeInGrid.ajs**: Arranges elements in a grid (if exists)
- View layout and organization scripts

## Author

(c) Y. Moldawski, 2026
