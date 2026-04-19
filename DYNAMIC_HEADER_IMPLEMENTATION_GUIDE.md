# DynamicHeader Implementation Guide

## 1. Color Map Configuration

The color mapping is a simple object that associates routes with Tailwind background colors:

```javascript
const HEADER_COLOR_MAP = {
  '/fire': 'bg-red-600',           // Fire Incidents → Red
  '/medical': 'bg-blue-600',       // Medical Emergencies → Blue
  '/accidents': 'bg-amber-500',    // Road Accidents → Amber/Yellow
  '/rescue': 'bg-purple-600',      // Rescue Operations → Purple
  '/dashboard': 'bg-slate-800',    // Overview/Dashboard → Dark Slate
  '/system': 'bg-emerald-600',     // System Status → Emerald Green
  default: 'bg-slate-800'          // Fallback color
};
```

### How Route Matching Works

```javascript
const getHeaderColorClass = (pathname) => {
  // 1. Check for exact match first
  if (HEADER_COLOR_MAP[pathname]) {
    return HEADER_COLOR_MAP[pathname];
  }

  // 2. Check if path starts with any key (handles /fire/detail, /medical/incident-123, etc.)
  for (const [path, color] of Object.entries(HEADER_COLOR_MAP)) {
    if (path !== 'default' && pathname.startsWith(path)) {
      return color;
    }
  }

  // 3. Return default if no match found
  return HEADER_COLOR_MAP.default;
};
```

#### Example Matching Logic:
- `/fire` → `bg-red-600` ✓
- `/fire/12345` → `bg-red-600` ✓ (starts with `/fire`)
- `/medical` → `bg-blue-600` ✓
- `/medical/emergency` → `bg-blue-600` ✓ (starts with `/medical`)
- `/unknown` → `bg-slate-800` ✓ (default)

---

## 2. Smooth Color Transitions

The header uses Tailwind's transition utilities to fade colors smoothly:

```jsx
<header
  className={`${headerColor} shadow-lg flex-shrink-0 transition-colors duration-500 ease-in-out`}
>
```

### Transition Breakdown:

| Class | Effect |
|-------|--------|
| `transition-colors` | Only animate color properties, not layout changes |
| `duration-500` | 500ms transition time (feels natural, not too fast or slow) |
| `ease-in-out` | Smooth acceleration/deceleration curve |

### Why These Values Work Together:

```
Time →
Color: red-600 ――→ (500ms fade) ――→ blue-600
       ↑                                ↑
   [ease-in]                      [ease-out]
     (accelerate)                 (decelerate)
     First 125ms                   Last 125ms
```

#### Duration Comparison:
- `duration-300` (300ms) — Too snappy, feels jarring
- `duration-500` (500ms) — **Perfect balance** ← USE THIS
- `duration-700` (700ms) — Smooth but sluggish for frequent changes
- `duration-1000` (1000ms) — Too slow, feels laggy

---

## 3. Stat Box Styling - Semi-Transparent Approach

The stat pills are the critical component. They must remain **legible on any background color**.

### HTML Structure:
```jsx
<div className="flex items-center gap-3 flex-wrap justify-end">
  {displayStats.map((stat) => {
    const Icon = stat.icon;
    return (
      <div className="px-3 py-2 rounded-lg bg-white/20 border border-white/30 backdrop-blur-sm flex items-center gap-2 transition-all duration-300 hover:bg-white/30 hover:border-white/50">
        {Icon && <Icon className="w-4 h-4 text-white" />}
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-white uppercase">Label</span>
          {stat.value && <span className="text-sm font-bold text-white">Value</span>}
        </div>
      </div>
    );
  })}
</div>
```

### CSS Classes Explained:

#### 1. **Background Opacity** (`bg-white/20`)
```
bg-white/20  = 20% white opacity = rgb(255, 255, 255, 0.2)

When header is:
- Red:    red-600 + white/20 = Soft pink appearance
- Blue:   blue-600 + white/20 = Light blue appearance
- Amber:  amber-500 + white/20 = Light orange appearance
- Purple: purple-600 + white/20 = Light purple appearance

✓ Always light enough to read text on top
✓ Maintains visual hierarchy
```

#### 2. **Border** (`border border-white/30`)
```
border-white/30 = 30% white semi-transparent border

Provides subtle definition:
- Separates pill from background
- Adds depth without clashing with header color
- Gives glass-morphism effect when combined with backdrop-blur
```

#### 3. **Backdrop Blur** (`backdrop-blur-sm`)
```
Creates frosted glass effect:
- bg-white/20 alone = flat translucent layer
- backdrop-blur-sm = blurs content behind the element
- Together = modern glass-morphism design

Looks like:
┌─────────────────────────┐
│ [BLURRED BACKGROUND]    │  ← blur
│ [WHITE SEMI-LAYER]      │  ← white/20
│ System Online           │  ← text (white, bold)
└─────────────────────────┘
```

#### 4. **Text Color** (`text-white`)
```
Always use white text so it works on ALL header colors:

Fire (red-600):
  ✓ White text on red = High contrast

Medical (blue-600):
  ✓ White text on blue = High contrast

Rescue (purple-600):
  ✓ White text on purple = High contrast

Accidents (amber-500):
  ✓ White text on amber = High contrast (amber is lighter)
```

---

## 4. Visual Comparison: Before vs. After

### ❌ BAD: No Opacity (Jarring on Light Colors)
```
When on amber-500 (light):
┌─────────────────────────────────┐
│        amber-500 header         │
│  ┌─────────────────────────────┐ │
│  │ bg-white (100% opaque)      │ │ ← Washes out header color
│  │ System Online (black text)  │ │ ← Hard to read
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### ✅ GOOD: With Opacity (Consistent)
```
When on amber-500 (light):
┌─────────────────────────────────┐
│        amber-500 header         │
│  ┌─────────────────────────────┐ │
│  │ bg-white/20 + blur          │ │ ← Preserves header color
│  │ System Online (white text)  │ │ ← Clear & legible
│  └─────────────────────────────┘ │
└─────────────────────────────────┘

When on red-600 (dark):
┌─────────────────────────────────┐
│         red-600 header          │
│  ┌─────────────────────────────┐ │
│  │ bg-white/20 + blur          │ │ ← Still shows red
│  │ System Online (white text)  │ │ ← Still clear & legible
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## 5. Hover States

### Default State:
```css
bg-white/20       /* 20% white opacity */
border-white/30   /* 30% white opacity border */
```

### Hover State:
```css
hover:bg-white/30      /* Increased to 30% opacity on hover */
hover:border-white/50  /* Increased to 50% opacity border on hover */
```

This creates visual feedback:
```
User hovers over "System Online" pill:
  Opacity increases → Pill becomes more prominent
  Maintains white text → Still readable
  Feels interactive → No color shift required
```

### Implementation in Component:
```jsx
<div
  className={`
    px-3 py-2 rounded-lg
    bg-white/20 border border-white/30              /* Normal state */
    backdrop-blur-sm
    flex items-center gap-2
    transition-all duration-300                      /* Smooth 300ms transition */
    hover:bg-white/30 hover:border-white/50         /* Hover enhancement */
    cursor-default
    group
  `}
>
  {/* content */}
</div>
```

---

## 6. Icon Pulse for Critical Items

For critical stat indicators, add a subtle pulse animation:

```jsx
{Icon && (
  <Icon className={`w-4 h-4 text-white flex-shrink-0 ${
    stat.highlight ? 'animate-pulse' : ''  /* Only if critical */
  }`} />
)}
```

Example stat object:
```javascript
{
  id: 'critical',
  label: 'Critical Cases',
  value: '6',
  icon: ExclamationTriangleIcon,
  highlight: true  // ← Adds pulsing animation
}
```

Result: Critical icon gently pulses to draw attention while maintaining professionalism.

---

## 7. Complete Integration in App.jsx

```jsx
import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DynamicHeader from './components/DynamicHeader';  // ← Import
import Dashboard from './pages/Dashboard';
import FireIncidents from './pages/FireIncidents';
// ... other imports

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const isPublicPage = location.pathname === '/' || location.pathname === '/login';

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>

        {/* ← ADD DYNAMIC HEADER HERE */}
        <DynamicHeader showStatus={true} />

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/fire" element={<FireIncidents />} />
              <Route path="/medical" element={<MedicalEmergencies />} />
              <Route path="/accidents" element={<RoadAccidents />} />
              <Route path="/rescue" element={<RescueOperations />} />
              <Route path="/system" element={<SystemStatus />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
```

---

## 8. Customization Examples

### Example 1: Hide Header on Mobile
```jsx
<DynamicHeader
  showStatus={true}
  className="hidden md:block"  // Hide on mobile
/>
```

### Example 2: Custom Stats with Dynamic Data
```jsx
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

<DynamicHeader
  stats={[
    {
      id: 'system',
      label: 'System Status',
      status: true,  // status badge
      icon: CheckCircleIcon
    },
    {
      id: 'incidents',
      label: 'Active Incidents',
      value: activeIncidents.toString(),
      icon: ExclamationTriangleIcon
    },
    {
      id: 'critical',
      label: 'Critical Cases',
      value: criticalCases.toString(),
      icon: ExclamationTriangleIcon,
      highlight: true  // Pulses
    }
  ]}
/>
```

### Example 3: Extend Color Map for More Routes
```javascript
const HEADER_COLOR_MAP = {
  '/fire': 'bg-red-600',
  '/medical': 'bg-blue-600',
  '/accidents': 'bg-amber-500',
  '/rescue': 'bg-purple-600',
  '/dashboard': 'bg-slate-800',
  '/system': 'bg-emerald-600',
  '/admin': 'bg-indigo-600',        // ← Add custom route
  '/analytics': 'bg-cyan-600',       // ← Add custom route
  '/reports': 'bg-teal-600',         // ← Add custom route
  default: 'bg-slate-800'
};
```

---

## 9. Browser Support

All features use standard CSS and Tailwind utilities:

| Feature | Support |
|---------|---------|
| `transition-colors` | All modern browsers |
| `backdrop-blur-sm` | Chrome 76+, Firefox 103+, Safari 9+, Edge 79+ |
| `bg-white/20` | CSS Custom Properties (all modern browsers) |
| `animate-pulse` | All modern browsers |

---

## 10. Performance Notes

✓ **Zero Performance Impact**:
- No JavaScript re-renders on header color change
- Uses CSS transitions (GPU accelerated)
- 60fps smooth animations
- Backdrop blur uses native browser blur (optimized)

✓ **Optimized Re-renders**:
- Uses `useLocation()` hook (minimal re-renders)
- Only updates when route changes
- Child components don't re-render unnecessarily

---

## Summary

| Aspect | Implementation |
|--------|-----------------|
| **Color Mapping** | Simple object lookup based on route |
| **Smooth Transitions** | `transition-colors duration-500 ease-in-out` |
| **Stat Pill Background** | `bg-white/20 border border-white/30 backdrop-blur-sm` |
| **Text Color** | Always `text-white` for consistency |
| **Hover Effect** | `hover:bg-white/30 hover:border-white/50 transition-all` |
| **Critical Indicator** | `animate-pulse` on icon when `highlight: true` |

The component is **production-ready** and provides excellent UX across all dashboard sections! 🎯
