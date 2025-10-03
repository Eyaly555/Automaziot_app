# PhaseWorkflow Components

Professional phase navigation and workflow management components for the Discovery Assistant application's three-phase architecture.

## Overview

The PhaseWorkflow components provide a visually appealing, accessible, and fully functional phase navigation system that guides users through the project lifecycle:

1. **Discovery Phase** - Requirements gathering across 9 business modules
   - Sub-phase: Requirements Collection
   - Sub-phase: Client Approval
2. **Implementation Spec Phase** - Technical specifications and system details
3. **Development Phase** - Task management and sprint execution
4. **Completed Phase** - Project completion

## Components

### PhaseNavigator

The main component that renders the complete phase navigation bar.

**Location**: `src/components/PhaseWorkflow/PhaseNavigator.tsx`

**Props**:
- `language?: 'he' | 'en'` - Interface language (default: 'he', changes to 'en' for Phase 3)
- `compact?: boolean` - Render in compact mode with smaller icons (default: false)
- `showProgress?: boolean` - Show progress percentages on active phases (default: true)

**Features**:
- ✅ Visual indicators for all phase states (completed, active, unlocked, locked)
- ✅ Progress rings showing completion percentage for active phases
- ✅ Sub-phase indicators for Requirements Collection and Client Approval
- ✅ Click-to-navigate functionality for completed and unlocked phases
- ✅ Automatic Zoho CRM sync on phase transitions
- ✅ Confirmation dialogs before phase transitions
- ✅ Bilingual support (Hebrew/English)
- ✅ Responsive design (desktop and mobile)
- ✅ Full keyboard navigation support
- ✅ ARIA labels for screen readers

**Usage**:
```tsx
import { PhaseNavigator } from '@/components/PhaseWorkflow';

// Basic usage (shown globally in AppContent)
<PhaseNavigator />

// With custom props
<PhaseNavigator
  language="en"
  compact={false}
  showProgress={true}
/>
```

**Phase State Logic**:
- **Completed**: Phase is before the current phase in the workflow
- **Active**: Current phase based on `meeting.phase` and `meeting.status`
- **Unlocked**: User can transition to this phase (validated via `canTransitionTo()`)
- **Locked**: Cannot access yet (prerequisites not met)

### PhaseStep

Individual phase step component with icon, label, and progress indicator.

**Location**: `src/components/PhaseWorkflow/PhaseStep.tsx`

**Props**:
- `label: string` - Phase name to display
- `icon: LucideIcon` - Icon component from lucide-react
- `state: 'completed' | 'active' | 'unlocked' | 'locked'` - Current state
- `progress?: number` - Completion percentage (0-100)
- `isSubPhase?: boolean` - Whether this is a sub-phase
- `compact?: boolean` - Render in compact mode
- `showProgress?: boolean` - Show progress ring
- `onClick?: () => void` - Click handler
- `description?: string` - Tooltip/aria-label description

**Features**:
- State-based color schemes (green=completed, blue=active, gray=locked)
- Animated progress ring for active phases
- Sub-phase badge indicator
- Hover effects and transitions
- Accessibility attributes (role, aria-label, tabIndex)

### PhaseProgressBar

Connector line with arrow between phase steps.

**Location**: `src/components/PhaseWorkflow/PhaseProgressBar.tsx`

**Props**:
- `isCompleted: boolean` - Whether the connection is completed
- `isSubPhase?: boolean` - Reduce opacity for sub-phase connections
- `compact?: boolean` - Smaller connector for compact mode
- `animated?: boolean` - Enable color transition animations

## Integration with Store

The PhaseNavigator integrates with the Zustand store (`useMeetingStore`) for:

- **Phase state**: `currentMeeting.phase` and `currentMeeting.status`
- **Phase transitions**: `transitionPhase(toPhase, notes)`
- **Validation**: `canTransitionTo(phase)` checks prerequisites
- **Progress tracking**: `getPhaseProgress(phase)` returns completion percentage
- **History**: `currentMeeting.phaseHistory` tracks all transitions

**Store Methods Used**:
```typescript
const {
  currentMeeting,      // Current meeting data
  transitionPhase,     // Execute phase transition
  canTransitionTo,     // Validate if transition is allowed
  getPhaseProgress     // Get completion percentage
} = useMeetingStore();
```

## Phase Configuration

Phases are configured in `PHASE_CONFIGS` array with:

```typescript
{
  id: 'discovery',                    // Unique identifier
  phase: 'discovery',                 // Actual MeetingPhase
  label: { he: 'גילוי', en: 'Discovery' },
  icon: Search,                       // Lucide icon component
  description: { he: '...', en: '...' },
  requiredStatus: ['discovery_in_progress'],
  isSubPhase: false,
  order: 1
}
```

**Sub-phases** (Requirements and Approval) have:
- `isSubPhase: true`
- Same `phase` value as their parent phase
- `order` values between main phases (1.5, 1.9)

## Accessibility

All components follow WCAG 2.1 AA accessibility standards:

- **Keyboard Navigation**: Tab through phases, Enter/Space to activate
- **Screen Readers**: Comprehensive ARIA labels and roles
- **Focus Management**: Clear focus indicators and logical tab order
- **Color Contrast**: All text meets 4.5:1 contrast ratio
- **Tooltips**: Descriptive titles on hover for all interactive elements

## Responsive Design

The PhaseNavigator adapts to different screen sizes:

- **Desktop** (>768px): Full-size with labels and descriptions
- **Mobile** (<768px): Horizontal scroll with compact mode
- **Tablet**: Medium size with abbreviated labels

Use the `compact` prop for smaller displays:
```tsx
<PhaseNavigator compact={window.innerWidth < 768} />
```

## Styling and Theming

Components use Tailwind CSS with consistent color schemes:

**State Colors**:
- **Completed**: Green (`bg-green-500`, `text-green-600`)
- **Active**: Blue (`bg-blue-600`, `text-blue-600`) with pulse animation
- **Unlocked**: Light blue (`bg-blue-100`, `text-blue-600`)
- **Locked**: Gray (`bg-gray-200`, `text-gray-400`)

**Custom Animations**:
- Pulse animation on active phases
- Smooth color transitions (300ms)
- Progress ring animation (500ms)
- Hover scale effects (200ms)

## Phase Transition Flow

1. User clicks on unlocked phase
2. Confirmation dialog appears
3. If confirmed:
   - Call `transitionPhase()` in store
   - Update `phase` and `status` in meeting
   - Log transition in `phaseHistory`
   - Sync to Zoho CRM (if integrated)
   - Navigate to appropriate route
4. UI updates automatically via Zustand reactivity

## Phase-Specific Routes

Each phase has dedicated routes:

- **Discovery**: `/` (Dashboard), `/wizard`, `/module/*`
- **Requirements**: Embedded in Discovery workflow
- **Approval**: `/module/proposal` with approval UI
- **Implementation Spec**: `/phase2`, `/phase2/systems/*`, `/phase2/integrations/*`, `/phase2/agents/*`
- **Development**: `/phase3`, `/phase3/sprints`, `/phase3/systems`, `/phase3/blockers`
- **Completed**: `/summary`

## Testing

**Manual Testing Checklist**:
- [ ] Phase navigator renders on all pages (except login/clients)
- [ ] Locked phases show lock icon and cannot be clicked
- [ ] Active phase shows progress ring with correct percentage
- [ ] Completed phases show checkmark and are clickable
- [ ] Clicking completed phase navigates to that phase's route
- [ ] Clicking unlocked phase shows confirmation dialog
- [ ] Phase transitions update store and sync to Zoho
- [ ] Sub-phases display with smaller scale and badge
- [ ] Tooltips appear on hover
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Language switches to English in Phase 3
- [ ] Responsive layout on mobile devices
- [ ] Phase history link appears when transitions > 1

**Unit Test Example** (to be implemented):
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { PhaseNavigator } from './PhaseNavigator';

test('shows locked icon for future phases', () => {
  // Mock store with discovery phase
  render(<PhaseNavigator />);
  const developmentPhase = screen.getByTitle(/Development/);
  expect(developmentPhase).toContainElement(screen.getByTestId('lock-icon'));
});
```

## Common Issues and Solutions

### Issue: Phase navigator not appearing
**Solution**: Check that `currentMeeting` exists and route is not `/login` or `/clients`

### Issue: Progress not updating
**Solution**: Ensure `getPhaseProgress()` is correctly calculating from module data

### Issue: Can't transition to next phase
**Solution**: Check `canTransitionTo()` validation logic and prerequisites

### Issue: Zoho sync failing on transition
**Solution**: Verify Zoho integration is enabled and `recordId` exists

### Issue: Sub-phases not showing
**Solution**: Ensure `meeting.status` matches `requiredStatus` in phase config

## Future Enhancements

Potential improvements for future sprints:

- [ ] Phase history modal with timeline visualization
- [ ] Drag-and-drop phase reordering (if workflow changes)
- [ ] Custom phase colors/themes
- [ ] Phase completion celebrations (confetti, notifications)
- [ ] Phase duration tracking and estimates
- [ ] Collaborative phase transitions (require multiple approvals)
- [ ] Phase templates for different project types
- [ ] Export phase timeline to PDF/Excel

## Related Files

- **Store**: `src/store/useMeetingStore.ts` - Phase state management
- **Types**: `src/types/index.ts` - MeetingPhase, MeetingStatus types
- **Routes**: `src/components/AppContent.tsx` - Phase-specific routing
- **Zoho API**: `src/services/zohoAPI.ts` - Phase sync to CRM

## Support

For issues or questions about the PhaseWorkflow components:
1. Check this README for common solutions
2. Review the inline code comments
3. Check the MASTER_IMPLEMENTATION_PLAN.md for architecture details
4. Consult the Phase Workflow Specialist agent in `.claude/agents/`
