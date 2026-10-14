---
name: EduCore Portal
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#444651'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#002e41'
  on-tertiary: '#ffffff'
  tertiary-container: '#00455f'
  on-tertiary-container: '#2eb7f2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: 0em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.005em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 2rem
  margin-sm: 1rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system projects scholarly rigor, institutional authority, and contemporary technological refinement. It is engineered specifically for complex academic institutions serving faculty, students, department chairs, and university registrars.

The aesthetic fuses **Corporate / Modern enterprise utility** with the dignity of academic tradition. The interface prioritizes clarity and high cognitive throughput, rejecting decorative novelties in favor of balanced typography, clear operational feedback, and strict visual rhythm. It conveys stability, focus, and intellectual momentum across high-density workflows such as grading matrices, curriculum mapping, and real-time attendance tracking.

## Colors

The palette establishes an authoritative, high-trust visual environment rooted in deep collegiate blues balanced against structured neutrals.

- **Primary (`#1E3A8A`)**: Deep Collegiate Navy. Applied to key navigation bars, critical action triggers, active tabs, and primary headings.
- **Secondary (`#2563EB`)**: Royal Sapphire. Used for interactive states, focused links, progress indicators, and prominent UI highlights.
- **Tertiary (`#38BDF8`)**: Soft Sky Blue. Reserved for subtle information banners, course tag highlights, and secondary progress rings.
- **Neutral Canvas (`#F8FAFC`)**: Soft slate-tinted canvas preventing eye fatigue during extended study and grading sessions. Pure white (`#FFFFFF`) is reserved for raised surfaces, modal dialogues, and content cards.
- **Borders & Dividers (`#E2E8F0`)**: Crisp structural lines establishing clear cell and card compartmentalization.

### Functional Status Indicators
- **Success (`#10B981`)**: Passing marks, active enrollments, submission confirmations.
- **Warning (`#F59E0B`)**: Upcoming assignment deadlines, pending approvals, incomplete prerequisites.
- **Critical (`#EF4444`)**: Overdue deliverables, course drop warnings, policy violations.

## Typography

Typography establishes an immediate hierarchy across dense information displays. 

- **Headlines (Plus Jakarta Sans)**: Introduces humanized geometric authority. Letter-spacing is tightened subtly at larger display sizes to preserve editorial sharpness.
- **Body & Data (Inter)**: Built for high-density academic ledgers, transcripts, and reading content. Standardizes optical alignment across complex tables, course module trees, and numerical metrics.
- **Tabular Data**: Numerical scores, course IDs, and credit hours must utilize tabular figure features (`tnum`) to maintain alignment down matrix columns.

## Layout & Spacing

The layout is anchored by a structured 12-column responsive fluid grid designed around a persistent structural sidebar:

- **Desktop (1280px+)**: 12-column layout with 240px or 64px (collapsed) primary navigation sidebar, 24px gutters, and 32px global page margins.
- **Tablet (768px - 1279px)**: 8-column layout with compact navigation rail, 16px gutters, and 24px margins. High-density tables shift into horizontally scrollable card containers.
- **Mobile (<768px)**: 4-column layout with 16px margins, 12px gutters, and a bottom utility bar or slide-over drawer navigation.

Spacers strictly adhere to an 8px grid (with a 4px `space-xs` subdivision). Dashboard widgets and grade matrices use compact internal padding (`space-md`) to ensure critical administrative controls remain visible above the fold.

## Elevation & Depth

Visual hierarchy uses a refined hybrid approach: **subtle tonal elevation paired with low-contrast borders**. This eliminates heavy shadows while preserving distinction between overlapping cards, slide-over rubrics, and modal layers.

- **Level 0 (Base Canvas)**: Background fill (`#F8FAFC`), completely flat.
- **Level 1 (Card / Table Surface)**: Pure white background (`#FFFFFF`) with a 1px border (`#E2E8F0`). Shadow: `0 1px 3px 0 rgba(15, 37, 55, 0.05)`.
- **Level 2 (Hovered Card / Active Panel)**: Pure white background with border (`#CBD5E1`). Shadow: `0 4px 6px -1px rgba(15, 37, 55, 0.08), 0 2px 4px -2px rgba(15, 37, 55, 0.04)`.
- **Level 3 (Flyouts, Menus & Tooltips)**: Pure white surface. Shadow: `0 10px 15px -3px rgba(15, 37, 55, 0.1), 0 4px 6px -4px rgba(15, 37, 55, 0.05)`.
- **Level 4 (Modals & Drawers)**: Pure white surface with dark backdrop (`#0F172A` at 40% opacity). Shadow: `0 20px 25px -5px rgba(15, 37, 55, 0.12), 0 8px 10px -6px rgba(15, 37, 55, 0.06)`.

## Shapes

The interface embraces a balanced shape language: approachable geometry paired with enterprise structure (`roundedness: 2`).

- **Interactive Elements (Buttons, Inputs, Selects)**: 8px border radius (`0.5rem`).
- **Cards, Panels, and Containers**: 12px border radius for outer shells (`0.75rem`) to 16px (`1rem` / `rounded-lg`).
- **Pills & Status Indicators**: Fully rounded (`9999px`) to immediately distinguish real-time meta attributes from actionable buttons and cards.
- **Progress Trackers**: Circular SVG tracks with round caps to visually soften analytical metrics.

## Components

### Buttons
- **Primary**: Solid navy background (`#1E3A8A`), white text, 8px radius, `font-weight: 600`. Hover: `#172554`. Active: subtle inset press.
- **Secondary**: Outlined 1px `#E2E8F0`, slate text (`#1E293B`), white background. Hover: `#F1F5F9`.
- **Ghost/Tertiary**: Transparent background, navy text (`#1E3A8A`). Hover: `#EFF6FF`.

### Badges & Status Chips
- Height: 24px, 9999px radius, uppercase label styling (`label-sm`).
- **Success / Active**: Soft emerald tint background (`#ECFDF5`), bold emerald text (`#047857`).
- **Pending / Due**: Soft amber tint (`#FFFBEB`), bold amber text (`#B45309`).
- **Urgent / Overdue**: Soft rose tint (`#FEF2F2`), bold crimson text (`#B91C1C`).

### Form Controls & Inputs
- Height: 40px standard (32px for high-density gradebook cells).
- Background: `#FFFFFF`, border: 1px `#E2E8F0`, 8px radius.
- Focus: 2px ring in Royal Sapphire (`#2563EB`) with 0px offset.

### Selection Controls (Checkboxes & Radios)
- Checkboxes: 16px square, 4px corner radius. Radio: 16px circular.
- Border: 1.5px `#CBD5E1`. Checked state: `#1E3A8A` fill with white checkmark icon.

### Cards & Dashboards
- White surface (`#FFFFFF`), 1px `#E2E8F0` border, 12px or 16px radius, `space-lg` internal padding.
- Split layout headers with bold titles (`headline-sm`) and contextual actions aligned to the right.

### Academic-Specific Components
- **Course Progress Ring**: Circular indicator displaying completion percentage. `#E2E8F0` background path with `#2563EB` animated completion stroke.
- **Grade Ledger Grid**: Alternating column highlight on hover, strict 36px row height, pinned student names, and aligned decimal grades.
- **Academic Calendar Block**: Compact date badge with navy accent bar, 8px radius, displaying day, event title, and badge status.