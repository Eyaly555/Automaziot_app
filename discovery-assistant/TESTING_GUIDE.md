# Discovery Assistant - Testing Guide

## Overview

This comprehensive testing guide covers all testing scenarios for the Layer 6 integration, including manual testing checklists, automated testing strategies, and QA scenarios.

## Table of Contents

1. [Pre-Integration Testing](#pre-integration-testing)
2. [Component-Level Testing](#component-level-testing)
3. [Integration Testing](#integration-testing)
4. [User Flow Testing](#user-flow-testing)
5. [Regression Testing](#regression-testing)
6. [Accessibility Testing](#accessibility-testing)
7. [Performance Testing](#performance-testing)
8. [Cross-Browser Testing](#cross-browser-testing)

---

## Pre-Integration Testing

### Dependencies Verification

```bash
# Verify all dependencies installed
npm list framer-motion react-hot-toast

# Expected output:
# ├── framer-motion@x.x.x
# └── react-hot-toast@x.x.x
```

**Checklist:**
- [ ] framer-motion installed
- [ ] react-hot-toast installed
- [ ] No peer dependency warnings
- [ ] No security vulnerabilities

---

## Component-Level Testing

### Layer 1: Base Components

#### Button Component

**Test Cases:**

1. **Variant Rendering**
   - [ ] Primary button shows correct color (blue)
   - [ ] Secondary button shows correct color (gray)
   - [ ] Outline button has border
   - [ ] Ghost button is transparent
   - [ ] Danger button shows red color

2. **Size Variants**
   - [ ] Small button (sm) - correct height
   - [ ] Medium button (md) - default size
   - [ ] Large button (lg) - larger size

3. **States**
   - [ ] Disabled state shows gray/muted
   - [ ] Loading state shows spinner
   - [ ] Hover state changes color
   - [ ] Active/pressed state visible
   - [ ] Focus state has outline

4. **Icon Support**
   - [ ] Icon on left renders correctly
   - [ ] Icon on right renders correctly
   - [ ] Icon + text aligned properly

**Manual Test:**
```typescript
<Button variant="primary" onClick={() => console.log('clicked')}>
  Click Me
</Button>
```

---

#### Card Component

**Test Cases:**

1. **Structure**
   - [ ] Card.Header renders
   - [ ] Card.Title renders
   - [ ] Card.Content renders
   - [ ] Card.Footer renders
   - [ ] All sections can be omitted

2. **Variants**
   - [ ] Default variant - white background
   - [ ] Outlined variant - border visible
   - [ ] Elevated variant - shadow visible

3. **Padding**
   - [ ] No padding (padding="none")
   - [ ] Small padding (padding="sm")
   - [ ] Medium padding (padding="md")
   - [ ] Large padding (padding="lg")

4. **Interactive**
   - [ ] Hoverable card shows hover effect
   - [ ] onClick fires when clicked
   - [ ] Cursor changes to pointer

---

#### Input Component

**Test Cases:**

1. **Basic Functionality**
   - [ ] Value displays correctly
   - [ ] onChange fires on input
   - [ ] Placeholder shows when empty
   - [ ] Label displays above input

2. **Types**
   - [ ] type="text" works
   - [ ] type="email" works
   - [ ] type="password" masks input
   - [ ] type="number" accepts numbers only
   - [ ] type="tel" works
   - [ ] type="url" works

3. **Validation**
   - [ ] Required asterisk shows when required=true
   - [ ] Error message displays when error prop set
   - [ ] Error styling (red border) applies
   - [ ] Helper text shows below input

4. **States**
   - [ ] Disabled state grays out
   - [ ] Focus state highlights border
   - [ ] Error state shows red border

5. **Icon Support**
   - [ ] Icon left position works
   - [ ] Icon right position works
   - [ ] Icon aligns properly

---

#### Select Component

**Test Cases:**

1. **Basic Functionality**
   - [ ] Options render in dropdown
   - [ ] Selected value displays
   - [ ] onChange fires on selection
   - [ ] Placeholder shows when no selection

2. **Validation**
   - [ ] Required asterisk shows
   - [ ] Error message displays
   - [ ] Error styling applies

3. **Options**
   - [ ] Disabled options are grayed out
   - [ ] Options with groups work
   - [ ] Empty options array handled

4. **Searchable** (if implemented)
   - [ ] Search input appears
   - [ ] Filtering works correctly
   - [ ] No results message shows

---

#### TextArea Component

**Test Cases:**

1. **Basic Functionality**
   - [ ] Multi-line input works
   - [ ] Value displays correctly
   - [ ] onChange fires on input
   - [ ] Rows prop sets initial height

2. **Features**
   - [ ] Character count shows when showCharCount=true
   - [ ] maxLength limits input
   - [ ] Auto-resize expands on content (if autoResize=true)

3. **Validation**
   - [ ] Required works
   - [ ] Error displays
   - [ ] Helper text shows

---

#### ProgressBar Component

**Test Cases:**

1. **Functionality**
   - [ ] Value 0-100 displays correctly
   - [ ] Progress fill width matches value
   - [ ] Label shows when showLabel=true

2. **Variants**
   - [ ] Default color (blue)
   - [ ] Success color (green)
   - [ ] Warning color (yellow)
   - [ ] Danger color (red)

3. **Sizes**
   - [ ] Small (sm) - thin bar
   - [ ] Medium (md) - default
   - [ ] Large (lg) - thick bar

4. **Animation**
   - [ ] Animated prop creates animation
   - [ ] Progress changes smoothly

---

#### Badge Component

**Test Cases:**

1. **Variants**
   - [ ] Default (gray)
   - [ ] Success (green)
   - [ ] Warning (yellow)
   - [ ] Danger (red)
   - [ ] Info (blue)

2. **Sizes**
   - [ ] Small (sm)
   - [ ] Medium (md)
   - [ ] Large (lg)

3. **Content**
   - [ ] Text renders
   - [ ] Numbers render
   - [ ] Icons render (if supported)

---

#### LoadingSkeleton Component

**Test Cases:**

1. **Variants**
   - [ ] Text skeleton - multiple lines
   - [ ] Circular skeleton - round shape
   - [ ] Rectangular skeleton - box shape
   - [ ] Card skeleton - card-like shape
   - [ ] Avatar skeleton - circular with specific size

2. **Props**
   - [ ] width prop sets width
   - [ ] height prop sets height
   - [ ] count prop renders multiple skeletons
   - [ ] className applies custom styles

3. **Animation**
   - [ ] Shimmer animation plays
   - [ ] Animation loops continuously

---

### Layer 2: Layout Components

#### AppLayout

**Test Cases:**

1. **Structure**
   - [ ] Sidebar renders on correct side (RTL: right, LTR: left)
   - [ ] Main content area renders
   - [ ] Children content displays

2. **RTL/LTR**
   - [ ] Hebrew (Phase 1-2) shows RTL layout
   - [ ] English (Phase 3) shows LTR layout
   - [ ] dir attribute set correctly

3. **Responsive**
   - [ ] Sidebar visible on desktop (>1024px)
   - [ ] Sidebar collapses on tablet (<1024px)
   - [ ] Mobile layout works (<640px)

4. **Routes**
   - [ ] Sidebar hidden on /login
   - [ ] Sidebar hidden on /clients
   - [ ] Sidebar shown on all other routes

---

#### GlobalNavigation

**Test Cases:**

1. **Menu Items**
   - [ ] Phase 1: Shows 9 discovery modules
   - [ ] Phase 2: Shows implementation spec sections
   - [ ] Phase 3: Shows development views
   - [ ] Active route highlighted

2. **Navigation**
   - [ ] Click navigates to correct route
   - [ ] Active state updates on navigation
   - [ ] Icons display correctly

3. **Language**
   - [ ] Hebrew labels in Phase 1-2
   - [ ] English labels in Phase 3
   - [ ] RTL/LTR alignment correct

---

#### Breadcrumbs

**Test Cases:**

1. **Path Display**
   - [ ] Shows correct path based on current route
   - [ ] Separators display correctly
   - [ ] Home link works

2. **Navigation**
   - [ ] Clicking breadcrumb navigates
   - [ ] Last item not clickable (current page)

3. **Hidden Routes**
   - [ ] Hidden on /login
   - [ ] Hidden on /clients
   - [ ] Hidden on /dashboard

---

#### QuickActions

**Test Cases:**

1. **Actions Display**
   - [ ] Save button visible
   - [ ] Export button visible
   - [ ] Settings button visible
   - [ ] Context-aware actions show

2. **Functionality**
   - [ ] Save triggers save action
   - [ ] Export opens export menu
   - [ ] Settings navigates to settings
   - [ ] Actions work on all phases

---

### Layer 3: Feedback Components

#### AutoSaveIndicator

**Test Cases:**

1. **States**
   - [ ] Saving: Shows spinner + "שומר..."
   - [ ] Saved: Shows checkmark + "נשמר"
   - [ ] Error: Shows X + "שגיאה בשמירה"
   - [ ] Idle: Hidden

2. **Timing**
   - [ ] Appears when saving starts
   - [ ] Disappears after 2 seconds of "saved"
   - [ ] Remains visible during error

3. **Position**
   - [ ] Fixed in bottom-right corner
   - [ ] Above other content (z-index)
   - [ ] Doesn't block interactions

---

#### LoadingSpinner

**Test Cases:**

1. **Rendering**
   - [ ] Spinner animates (rotates)
   - [ ] Size variants work
   - [ ] Color can be customized

2. **Usage**
   - [ ] In buttons (loading state)
   - [ ] Full page loading
   - [ ] Inline loading

---

#### PageTransition

**Test Cases:**

1. **Animation**
   - [ ] Fade-in animation on mount
   - [ ] Fade-out animation on unmount
   - [ ] Smooth transitions (no flicker)

2. **Content**
   - [ ] Children render correctly
   - [ ] Multiple elements supported
   - [ ] Works with different content types

---

#### Toast System

**Test Cases:**

1. **Toast Types**
   - [ ] Success toast (green, checkmark icon)
   - [ ] Error toast (red, X icon)
   - [ ] Warning toast (yellow, alert icon)
   - [ ] Info toast (blue, info icon)

2. **Functionality**
   - [ ] Toast appears on trigger
   - [ ] Multiple toasts stack correctly
   - [ ] Dismiss button closes toast
   - [ ] Auto-dismiss after duration

3. **Content**
   - [ ] Title displays
   - [ ] Message displays (optional)
   - [ ] Icons display correctly

4. **Position**
   - [ ] Top-left corner (LTR)
   - [ ] Top-right corner (RTL)
   - [ ] Above other content

---

## Integration Testing

### AppContent Integration

**Test Cases:**

1. **Layout Wrapping**
   - [ ] AppLayout wraps all routes
   - [ ] Sidebar visible where expected
   - [ ] Breadcrumbs show on appropriate pages

2. **Global Components**
   - [ ] ToastContainer renders
   - [ ] AutoSaveIndicator renders
   - [ ] SyncStatusIndicator still works
   - [ ] PhaseNavigator still shows

3. **No Conflicts**
   - [ ] No duplicate containers
   - [ ] No overlapping components
   - [ ] Z-index stacking correct

---

## User Flow Testing

### Flow 1: Create New Meeting

1. [ ] Navigate to /clients
2. [ ] Click "Create Meeting"
3. [ ] Fill in client details (using Input components)
4. [ ] Toast appears on save
5. [ ] Navigate to dashboard
6. [ ] New meeting appears in list

---

### Flow 2: Complete Discovery Module

1. [ ] Navigate to /module/overview
2. [ ] Fill all required fields
3. [ ] Auto-save indicator shows
4. [ ] Progress bar updates
5. [ ] Navigate away and back
6. [ ] Data persists
7. [ ] Module marked complete

---

### Flow 3: Use Wizard Mode

1. [ ] Navigate to /wizard
2. [ ] WizardStepNavigation shows all steps
3. [ ] Complete step 1
4. [ ] Click "Next"
5. [ ] PageTransition animates
6. [ ] Step 2 loads
7. [ ] Back button works
8. [ ] Progress bar updates

---

### Flow 4: Export Meeting

1. [ ] Complete some modules
2. [ ] Click Export button
3. [ ] Select PDF
4. [ ] Toast shows "Generating..."
5. [ ] PDF downloads
6. [ ] Success toast appears

---

### Flow 5: Phase Transition

1. [ ] Complete all Phase 1 modules
2. [ ] Transition to Phase 2
3. [ ] UI switches to Phase 2 components
4. [ ] Navigation menu updates
5. [ ] Breadcrumbs update
6. [ ] Phase 3 transition works similarly

---

## Regression Testing

### Existing Functionality

**Critical Paths:**

1. [ ] All existing routes still work
2. [ ] Meeting CRUD operations work
3. [ ] Module data saves correctly
4. [ ] Zoho sync still functions
5. [ ] Supabase sync still functions
6. [ ] PDF export still works
7. [ ] Excel export still works
8. [ ] Pain point flagging works
9. [ ] Custom field values work
10. [ ] ROI calculations accurate

---

## Accessibility Testing

### Keyboard Navigation

1. [ ] Tab key moves focus through components
2. [ ] Enter key activates buttons
3. [ ] Escape key closes modals/dropdowns
4. [ ] Arrow keys navigate lists
5. [ ] All interactive elements focusable

### Screen Reader

1. [ ] ARIA labels present
2. [ ] Form fields announced correctly
3. [ ] Buttons announced with role
4. [ ] Errors announced
5. [ ] Status changes announced

### Color Contrast

1. [ ] Text readable against background (WCAG AA)
2. [ ] Buttons have sufficient contrast
3. [ ] Error states clearly visible
4. [ ] Focus indicators visible

---

## Performance Testing

### Load Time

1. [ ] Initial page load < 3 seconds
2. [ ] Route transitions < 500ms
3. [ ] Component renders < 100ms
4. [ ] Auto-save debounce works (1 second)

### Bundle Size

```bash
npm run build
# Check dist/ folder size
```

- [ ] Total bundle < 2MB
- [ ] Vendor chunk < 1MB
- [ ] Component chunks reasonable

### Memory

1. [ ] No memory leaks on navigation
2. [ ] Components cleanup on unmount
3. [ ] Event listeners removed

---

## Cross-Browser Testing

### Desktop Browsers

1. [ ] Chrome (latest)
2. [ ] Firefox (latest)
3. [ ] Safari (latest)
4. [ ] Edge (latest)

### Mobile Browsers

1. [ ] Chrome Mobile (Android)
2. [ ] Safari (iOS)
3. [ ] Samsung Internet

### Screen Sizes

1. [ ] Mobile: 320px - 640px
2. [ ] Tablet: 640px - 1024px
3. [ ] Desktop: 1024px+
4. [ ] Large Desktop: 1920px+

---

## Bug Reporting Template

When issues are found, report using this template:

```markdown
### Bug Title

**Priority:** High | Medium | Low

**Component:** [Component Name]

**Steps to Reproduce:**
1.
2.
3.

**Expected Result:**

**Actual Result:**

**Screenshots:**

**Environment:**
- Browser:
- OS:
- Screen Size:
- Phase:

**Console Errors:**
```

---

## Testing Checklist Summary

### Before Release

- [ ] All Layer 1 components tested
- [ ] All Layer 2 components tested
- [ ] All Layer 3 components tested
- [ ] Integration tests passed
- [ ] User flows completed successfully
- [ ] No regression in existing features
- [ ] Accessibility standards met
- [ ] Performance benchmarks met
- [ ] Cross-browser compatibility verified
- [ ] Documentation updated
- [ ] TypeScript errors resolved (see build output)

### Known Issues

**TypeScript Errors (Not Breaking):**
- Unused imports in Dashboard.tsx
- Type mismatches in LeadsAndSalesModule.tsx
- Missing props in some form components

**Action Items:**
- Clean up unused imports
- Fix type mismatches in modules
- Update form component prop types

These are pre-existing issues not related to Layer 6 integration.

---

## Automated Testing

### Unit Tests

```bash
npm test
```

**Coverage Goals:**
- Base components: > 80%
- Layout components: > 70%
- Feedback components: > 70%

### E2E Tests

```bash
npm run test:e2e
```

**Critical Scenarios:**
- Complete discovery flow
- Phase transitions
- Export functionality
- Form validation

---

## Summary

**Total Test Cases:** 200+

**Estimated Testing Time:**
- Component tests: 4 hours
- Integration tests: 2 hours
- User flow tests: 2 hours
- Regression tests: 2 hours
- Accessibility tests: 1 hour
- Performance tests: 1 hour
- Cross-browser tests: 2 hours

**Total:** ~14 hours of thorough testing

For any questions or issues during testing, refer to:
- INTEGRATION_GUIDE.md
- COMPONENT_USAGE.md
- MIGRATION_GUIDE.md
