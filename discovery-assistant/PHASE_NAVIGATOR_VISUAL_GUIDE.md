# PhaseNavigator Visual Guide

## Component Preview

This guide provides a visual representation of the PhaseNavigator component in different states.

---

## 📐 Layout Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            PHASE NAVIGATOR                                    │
│                                                                               │
│  ┌────┐      ┌────┐      ┌────┐      ┌────┐      ┌────┐      ┌────┐       │
│  │ ✓  │ ───> │ 📋 │ ───> │ ✓  │ ───> │ 📄 │ ───> │ 🔒 │ ───> │ 🔒 │       │
│  └────┘      └────┘      └────┘      └────┘      └────┘      └────┘       │
│  גילוי      איסוף       אישור      מפרט        פיתוח       הושלם         │
│             דרישות       לקוח       יישום                                    │
│             (sub)        (sub)                                               │
│                                                                               │
│              Current: מפרט יישום (Implementation Spec)                       │
│              Status: spec_in_progress                                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 State Visualizations

### 1. Completed Phase (גילוי - Discovery)

```
┌────────────┐
│   ┌────┐   │  ← Circle: Green (#10B981)
│   │ ✓  │   │  ← Icon: Checkmark (white)
│   └────┘   │  ← Shadow: md
│   גילוי     │  ← Text: Green (#059669)
└────────────┘
     ↓ Clickable (cursor-pointer)
     ↓ Hover: scale-105
     ↓ Navigate to /dashboard
```

**CSS Classes**:
```css
bg-green-500         /* Circle background */
text-green-600       /* Label text */
shadow-md            /* Drop shadow */
hover:scale-105      /* Hover effect */
transition-all       /* Smooth animation */
```

---

### 2. Active Phase with Progress (מפרט יישום - Implementation Spec)

```
┌────────────┐
│  ╔════╗    │  ← Outer ring: Progress (white, 65%)
│  ║ 📄 ║    │  ← Circle: Blue (#2563EB)
│  ╚════╝    │  ← Icon: FileCode (white)
│ מפרט יישום │  ← Text: Blue (#2563EB)
│  65% הושלם │  ← Progress text (gray-500)
└────────────┘
     ↓ Pulse animation
     ↓ Ring: 4px opacity-50
     ↓ Cannot click (current phase)
```

**CSS Classes**:
```css
bg-blue-600          /* Circle background */
text-blue-600        /* Label text */
animate-pulse        /* Pulse effect */
ring-4 ring-blue-600 ring-opacity-50  /* Outer ring */
```

**SVG Progress Ring**:
```svg
<svg class="w-16 h-16 -rotate-90">
  <circle
    cx="32"
    cy="32"
    r="30"
    stroke="white"
    stroke-width="3"
    fill="none"
    stroke-dasharray="122 188"  <!-- 65% of 188 -->
  />
</svg>
```

---

### 3. Unlocked Phase (Next Available)

```
┌────────────┐
│  ┌────┐    │  ← Circle: Light Blue (#DBEAFE)
│  │ 💻 │    │  ← Border: Blue (#60A5FA)
│  └────┘    │  ← Icon: Code (blue)
│   פיתוח    │  ← Text: Blue (#2563EB)
└────────────┘
     ↓ Clickable (cursor-pointer)
     ↓ Hover: scale-105 + bg-blue-200
     ↓ Click: Show confirmation dialog
```

**CSS Classes**:
```css
bg-blue-100 bg-white  /* Light blue with white bg */
border-2 border-blue-400  /* Border */
text-blue-600         /* Icon and text color */
hover:bg-blue-200     /* Hover background */
```

---

### 4. Locked Phase (Future)

```
┌────────────┐
│  ┌────┐    │  ← Circle: Gray (#E5E7EB)
│  │ 🔒 │    │  ← Icon: Lock (gray)
│  └────┘    │  ← Shadow: md
│   הושלם    │  ← Text: Gray (#9CA3AF)
└────────────┘
     ↓ cursor-not-allowed
     ↓ Tooltip: "השלם את השלב הקודם"
     ↓ No interaction
```

**CSS Classes**:
```css
bg-gray-200          /* Circle background */
text-gray-400        /* Icon and text */
cursor-not-allowed   /* Cursor style */
```

---

### 5. Sub-Phase (איסוף דרישות - Requirements)

```
┌────────────┐
│  ┌────┐ ● │  ← Badge: Blue dot (bottom-right)
│  │ 📋 │   │  ← Circle: 90% scale
│  └────┘   │  ← Icon: ClipboardList
│  איסוף    │  ← Text: Smaller font
│  דרישות   │  ← Opacity: 90%
└────────────┘
     ↓ scale-90 opacity-90
     ↓ Badge indicates sub-phase
```

**CSS Classes**:
```css
scale-90 opacity-90  /* Sub-phase scale */
```

**Badge**:
```html
<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
```

---

## 🔗 Connector Between Phases

### Completed Connection (Green)

```
     ─────────>
     Green line + Green arrow
     (text-green-500)
```

### Incomplete Connection (Gray)

```
     ─────────>
     Gray line + Gray arrow
     (text-gray-300)
```

**Component**:
```tsx
<div class="flex items-center justify-center mx-4">
  <div class="w-12 h-0.5 bg-green-500" />
  <ChevronRight class="w-5 h-5 text-green-500 -mx-2" />
  <div class="w-12 h-0.5 bg-green-500" />
</div>
```

---

## 📱 Responsive Layouts

### Desktop (>768px) - Full Size

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                       │
│   ┌──────┐     ┌──────┐     ┌──────┐     ┌──────┐     ┌──────┐    │
│   │      │ ──> │      │ ──> │      │ ──> │      │ ──> │      │    │
│   │ Icon │     │ Icon │     │ Icon │     │ Icon │     │ Icon │    │
│   │      │     │      │     │      │     │      │     │      │    │
│   └──────┘     └──────┘     └──────┘     └──────┘     └──────┘    │
│    Label        Label        Label        Label        Label       │
│   Progress                   Progress                              │
│                                                                       │
│                    Current phase description                         │
│                    Status: spec_in_progress                          │
└──────────────────────────────────────────────────────────────────────┘
```

- Icon size: 16x16 (64px)
- Spacing: mx-4
- Labels: Full text
- Progress: Shown

---

### Mobile (<768px) - Compact Mode

```
┌────────────────────────────────────────────────────────┐
│ ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐                  │
│ │  │>│  │>│  │>│  │>│  │>│  │  ← Horizontal scroll │
│ └──┘  └──┘  └──┘  └──┘  └──┘  └──┘                  │
│  גילוי איסוף אישור מפרט פיתוח הושלם                 │
│                                                        │
│         Current: מפרט יישום                           │
└────────────────────────────────────────────────────────┘
```

- Icon size: 12x12 (48px)
- Spacing: mx-2
- Labels: Abbreviated
- Horizontal scroll: overflow-x-auto

---

## 🎬 Animations

### 1. Pulse Animation (Active Phase)

```
Frame 1: opacity-100 scale-100
  ↓ 1000ms
Frame 2: opacity-75 scale-105
  ↓ 1000ms
Frame 3: opacity-100 scale-100
  (repeat)
```

**Tailwind Class**: `animate-pulse`

---

### 2. Progress Ring Animation

```
0%: stroke-dasharray="0 188"
  ↓ 500ms ease-in-out
65%: stroke-dasharray="122 188"
```

**CSS**:
```css
transition-all duration-500 ease-in-out
```

---

### 3. Hover Scale Effect

```
Rest: scale-100
  ↓ 200ms
Hover: scale-105
  ↓ 200ms
Rest: scale-100
```

**CSS**:
```css
transition-transform duration-200
hover:scale-105
```

---

### 4. Color Transitions

```
State Change: bg-gray-200 → bg-blue-600
  ↓ 300ms
Complete: bg-blue-600
```

**CSS**:
```css
transition-colors duration-300
```

---

## 🌈 Color Palette

### Primary Colors

| State | Background | Text | Border | Ring |
|-------|-----------|------|--------|------|
| Completed | `#10B981` | `#059669` | `#10B981` | `#10B981` |
| Active | `#2563EB` | `#2563EB` | `#2563EB` | `#2563EB` |
| Unlocked | `#DBEAFE` | `#2563EB` | `#60A5FA` | `#60A5FA` |
| Locked | `#E5E7EB` | `#9CA3AF` | `#D1D5DB` | `#D1D5DB` |

### Semantic Colors

```
Success (Completed):  Green-500  (#10B981)
Primary (Active):     Blue-600   (#2563EB)
Secondary (Unlocked): Blue-100   (#DBEAFE)
Disabled (Locked):    Gray-200   (#E5E7EB)
Text (Active):        Blue-600   (#2563EB)
Text (Progress):      Gray-500   (#6B7280)
```

---

## 📏 Dimensions

### Full Size Mode

```
Circle:
  - Width: 64px (w-16)
  - Height: 64px (h-16)
  - Border radius: 50%
  - Shadow: 0 4px 6px rgba(0,0,0,0.1)

Icon:
  - Width: 32px (w-8)
  - Height: 32px (h-8)

Label:
  - Font size: 14px (text-sm)
  - Font weight: 600 (font-semibold)
  - Max width: 100px

Progress Text:
  - Font size: 12px (text-xs)
  - Color: Gray-500

Connector:
  - Width: 48px (w-12)
  - Height: 2px (h-0.5)
  - Margin: 16px (mx-4)
```

### Compact Mode

```
Circle:
  - Width: 48px (w-12)
  - Height: 48px (h-12)

Icon:
  - Width: 24px (w-6)
  - Height: 24px (h-6)

Label:
  - Font size: 12px (text-xs)
  - Max width: 60px

Connector:
  - Width: 32px (w-8)
  - Margin: 8px (mx-2)
```

---

## 🎯 Interactive States

### 1. Normal State (Clickable)

```
Background: Based on state color
Border: None (except unlocked)
Cursor: pointer
Transform: scale-100
```

### 2. Hover State (Clickable)

```
Background: Slightly darker
Transform: scale-105
Cursor: pointer
Transition: 200ms
```

### 3. Focus State (Keyboard)

```
Outline: 2px solid blue-500
Outline offset: 2px
Box shadow: 0 0 0 3px rgba(59, 130, 246, 0.5)
```

### 4. Active/Pressed State

```
Transform: scale-98
Transition: 100ms
```

### 5. Disabled State (Locked)

```
Background: Gray-200
Cursor: not-allowed
Opacity: 100% (full opacity for accessibility)
```

---

## 📱 Responsive Breakpoints

```typescript
// Tailwind breakpoints
sm:  640px   // Small screens - show compact
md:  768px   // Medium - transition to full
lg:  1024px  // Large - full size
xl:  1280px  // Extra large - full size with more spacing
2xl: 1536px  // 2X large - maximum spacing
```

**Recommended Implementation**:
```tsx
<PhaseNavigator
  compact={window.innerWidth < 768}
  showProgress={window.innerWidth >= 768}
/>
```

---

## 🔤 Typography

### Hebrew Text (Default)

```
Font: System UI (Segoe UI, Roboto)
Direction: RTL (right-to-left)
Weight: 600 (semibold)
Size: 14px (normal), 12px (compact)
Line height: 1.2
Letter spacing: normal
```

### English Text (Phase 3)

```
Font: System UI (Segoe UI, Roboto)
Direction: LTR (left-to-right)
Weight: 600 (semibold)
Size: 14px (normal), 12px (compact)
Line height: 1.2
Letter spacing: -0.01em
```

---

## 🖼️ Visual Examples

### Example 1: Early Discovery Phase

```
 ✓ ───> 📋 ───> 🔒 ───> 🔒 ───> 🔒 ───> 🔒
גילוי   איסוף   אישור   מפרט    פיתוח   הושלם
       דרישות    לקוח    יישום

Current: איסוף דרישות (Requirements Collection)
Status: discovery_complete
Progress: 100%
```

### Example 2: Client Approval Phase

```
 ✓ ───>  ✓ ───> ⏳ ───> 🔒 ───> 🔒 ───> 🔒
גילוי   איסוף   אישור   מפרט    פיתוח   הושלם
       דרישות    לקוח    יישום

Current: אישור לקוח (Client Approval)
Status: awaiting_client_decision
Progress: 0%
```

### Example 3: Implementation Spec Phase

```
 ✓ ───>  ✓ ───>  ✓ ───> 📄 ───> 💻 ───> 🔒
גילוי   איסוף   אישור   מפרט    פיתוח   הושלם
       דרישות    לקוח    יישום

Current: מפרט יישום (Implementation Spec)
Status: spec_in_progress
Progress: 45%
Next available: פיתוח (Development)
```

### Example 4: Development Phase (English UI)

```
 ✓ ───>  ✓ ───>  ✓ ───>  ✓ ───> 💻 ───> 🔒
Discovery Requirements Approval  Spec  Development Completed

Current: Development
Status: dev_in_progress
Progress: 67%
Next available: Completed
```

---

## 🎨 Dark Mode Support (Future)

*Not currently implemented, but here's the recommended approach:*

```css
/* Dark mode colors */
.dark .completed { background: #10B981; }
.dark .active { background: #3B82F6; }
.dark .unlocked { background: #1E3A8A; color: #93C5FD; }
.dark .locked { background: #374151; color: #6B7280; }

/* Dark mode text */
.dark .text-completed { color: #34D399; }
.dark .text-active { color: #60A5FA; }
.dark .text-locked { color: #9CA3AF; }
```

---

## 📊 Accessibility Visual Indicators

### Focus Ring

```
┌────────────────┐
│ ╔════════════╗ │  ← Blue outline (2px)
│ ║  ┌────┐   ║ │  ← Offset (2px)
│ ║  │ ✓  │   ║ │  ← Box shadow (3px, 50% opacity)
│ ║  └────┘   ║ │
│ ╚════════════╝ │
└────────────────┘
```

### Tooltip on Locked Phase

```
┌────────────┐
│  ┌────┐    │
│  │ 🔒 │    │
│  └────┘    │
│   הושלם    │
└────────────┘
      ↓
  ┌─────────────────────┐
  │ השלם את השלב הקודם │  ← Tooltip
  └─────────────────────┘
```

---

## 🎭 State Transition Visualization

```
Discovery (Complete) → Requirements (Active)
    ✓                      📋
  Green                   Blue
                      Pulse + Ring
                      Progress: 75%

Click on Development (Unlocked)
    💻
  Light Blue
Hover: Darker blue

Confirmation Dialog:
┌────────────────────────────────┐
│ האם אתה בטוח שברצונך לעבור     │
│ לשלב "פיתוח"?                  │
│                                 │
│  [ביטול]          [אישור]     │
└────────────────────────────────┘

After Confirmation:
    ✓ ───>  ✓ ───>  ✓ ───>  ✓ ───> 💻
  Development becomes Active
  Shows progress ring
  Updates store and Zoho
  Navigates to /phase3
```

---

This visual guide provides a comprehensive overview of the PhaseNavigator component's appearance and behavior in all states. Use it as a reference during development, testing, and design reviews.
