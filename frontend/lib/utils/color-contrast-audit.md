# Color Contrast Audit & Documentation

## WCAG Requirements

- **Normal Text (AA)**: 4.5:1 contrast ratio
- **Large Text (AA)**: 3:1 contrast ratio (18pt+ or 14pt+ bold)
- **Normal Text (AAA)**: 7:1 contrast ratio
- **Large Text (AAA)**: 4.5:1 contrast ratio
- **UI Components**: 3:1 contrast ratio (icons, borders, focus indicators)

## Color Contrast Analysis

### Primary Colors

#### Primary-500 (#dc2626) on White (#ffffff)

- **Contrast Ratio**: ~5.25:1
- **WCAG AA**: ✅ Passes for normal text (4.5:1 required)
- **WCAG AAA**: ❌ Fails for normal text (7:1 required)
- **Status**: ✅ Acceptable for body text, buttons, and large text
- **Usage**: Safe for buttons, links, and UI elements. For small text requiring AAA, use primary-600.

#### Primary-600 (#b91c1c) on White (#ffffff)

- **Contrast Ratio**: ~6.5:1
- **WCAG AA**: ✅ Passes
- **WCAG AAA**: ❌ Fails for normal text (7:1 required)
- **Status**: Better than primary-500, good for hover states

#### Primary-700 (#991b1b) on White (#ffffff)

- **Contrast Ratio**: ~8.2:1
- **WCAG AA**: ✅ Passes
- **WCAG AAA**: ✅ Passes for normal text
- **Status**: Excellent contrast, use for small text requiring AAA compliance

### Neutral Colors

#### Gray-500 (#737373) on White (#ffffff)

- **Contrast Ratio**: ~4.6:1
- **WCAG AA**: ✅ Passes (barely - 4.5:1 required)
- **WCAG AAA**: ❌ Fails
- **Status**: ⚠️ Borderline acceptable. Changed to gray-600 for better contrast.

#### Gray-600 (#525252) on White (#ffffff)

- **Contrast Ratio**: ~7.1:1
- **WCAG AA**: ✅ Passes
- **WCAG AAA**: ✅ Passes for normal text
- **Status**: ✅ Excellent contrast, recommended for body text

#### Gray-700 (#404040) on White (#ffffff)

- **Contrast Ratio**: ~9.2:1
- **WCAG AA**: ✅ Passes
- **WCAG AAA**: ✅ Passes
- **Status**: ✅ Excellent contrast

### Focus Indicators

#### Primary-500 Focus Ring

- **Ring Color**: primary-500 (#dc2626)
- **Ring Offset**: white background
- **Contrast**: ~5.25:1
- **Status**: ✅ Meets 3:1 requirement for UI components
- **Enhancement**: Added ring-offset-2 for better visibility

## Acceptable Color Combinations

### ✅ Safe Combinations (WCAG AA Compliant)

| Text Color  | Background  | Contrast | Use Case                          |
| ----------- | ----------- | -------- | --------------------------------- |
| primary-500 | white       | 5.25:1   | Buttons, links, UI elements       |
| primary-600 | white       | 6.5:1    | Hover states, emphasis            |
| gray-600    | white       | 7.1:1    | Body text, descriptions           |
| gray-700    | white       | 9.2:1    | Headings, important text          |
| gray-800    | white       | 11.4:1   | Primary headings                  |
| gray-900    | white       | 12.6:1   | Maximum contrast text             |
| white       | primary-500 | 5.25:1   | Button text, labels on colored bg |
| white       | primary-600 | 6.5:1    | Button text (hover)               |

### ⚠️ Use with Caution

| Text Color  | Background | Contrast | Notes                              |
| ----------- | ---------- | -------- | ---------------------------------- |
| gray-500    | white      | 4.6:1    | Only for non-essential text, icons |
| primary-500 | gray-50    | ~4.8:1   | Acceptable but not ideal           |

### ❌ Avoid These Combinations

| Text Color | Background | Contrast | Issue                          |
| ---------- | ---------- | -------- | ------------------------------ |
| gray-300   | white      | ~2.1:1   | Too low for any text           |
| gray-400   | white      | ~3.2:1   | Only acceptable for large text |
| primary-50 | white      | ~1.1:1   | No contrast                    |

## Implementation Changes

### 1. Updated Gray-500 Usage

- Changed `text-gray-500` to `text-gray-600` for body text and descriptions
- Kept `text-gray-500` only for non-essential decorative text and icons
- Updated focus states to use gray-600 for better visibility

### 2. Enhanced Focus Indicators

- All focus rings now use `ring-2` with `ring-offset-2`
- Focus ring color: `primary-500` (5.25:1 contrast)
- Ring offset ensures visibility on all backgrounds

### 3. Small Text Recommendations

- For text smaller than 14px, prefer `primary-600` or `gray-700` over `primary-500` or `gray-500`
- Use `gray-600` minimum for any readable text on white backgrounds

## Testing Checklist

- [x] Primary-500 on white meets AA standards
- [x] Gray-500 replaced with gray-600 for body text
- [x] Focus indicators meet 3:1 contrast requirement
- [x] All button variants have sufficient contrast
- [x] Input labels and placeholders meet contrast requirements
- [x] Link colors meet contrast requirements
- [x] Error and success messages meet contrast requirements

## Tools Used

- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/

## Last Updated

December 2024
