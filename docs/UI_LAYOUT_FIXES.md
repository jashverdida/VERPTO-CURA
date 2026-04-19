# UI Layout Fixes: Map Overflow & Tooltip Persistence

## Overview
Two critical UI bugs have been fixed:
1. **Map Container Overflow** - Leaflet map bleeding into right sidebar
2. **Tooltip Disappearing on Hover** - Custom modal vanishes when cursor moves to it

---

## Bug #1: Map Container Overflow

### Problem
The Leaflet map was breaking out of its parent container and overlapping the right-hand sidebar, especially on 2-column layouts.

### Root Cause
The map container didn't have strict geometry constraints:
- Missing `min-h-0` on flex child (allows flex item to shrink below content height)
- Leaflet MapContainer had `height: '100%'` but flex parent wasn't properly constrained
- `overflow-hidden` on grandparent didn't constrain flex child properly

### Solution

#### 1. Update MapContainer Wrapper (MapContainer.jsx)
```jsx
// BEFORE (BROKEN):
<div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-slate-200">
  <div className="flex-1 relative" ref={mapWrapperRef}>
    <LeafletMapContainer style={{ height: '100%', width: '100%' }} />
  </div>
</div>

// AFTER (FIXED):
<div className="h-full w-full flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
  {/* Header with flex-shrink-0 to prevent shrinking */}
  <div className="...flex-shrink-0">...</div>

  {/* Strictly constrained map wrapper */}
  <div className="flex-1 min-w-0 min-h-0 relative" ref={mapWrapperRef}>
    <LeafletMapContainer
      style={{ width: '100%', height: '100%' }}
    />
  </div>
</div>
```

**Key Tailwind Classes:**
- `h-full w-full` - Take full parent dimensions
- `flex-1` - Grow to fill available space
- `min-w-0` - Allow shrink below content width (prevent overflow)
- `min-h-0` - Allow shrink below content height (prevent overflow)
- `overflow-hidden` - Clip any content exceeding bounds
- `flex-shrink-0` on header - Prevent header from shrinking

**Inline Styles:**
- `style={{ width: '100%', height: '100%' }}` - MapContainer respects parent
- NOT `height: '100vh'` or `position: absolute` (breaks flex)

#### 2. Parent Layout (FireIncidents.jsx, Dashboard.jsx, etc.)
```jsx
<div className="flex-1 flex gap-4 p-4 min-h-0 overflow-hidden">
  {/* Map Container - flex-1 grows to fill, min-w-0 prevents overflow */}
  <div className="flex-1 min-w-0">
    <MapContainer />
  </div>

  {/* Right Sidebar - fixed width, overflow-y-auto for scrolling */}
  <div className="w-96 bg-white border rounded-lg shadow-sm flex flex-col overflow-hidden">
    ...
  </div>
</div>
```

**Why This Works:**
- `flex-1` on parent = flex row with equal distribution
- `min-w-0` on map wrapper = prevents flex item from forcing minimum width
- `overflow-hidden` on parent = clips any overflow
- `w-96` on sidebar = fixed width, doesn't flex
- Result: Map shrinks to fit, never overflows into sidebar

---

## Bug #2: Tooltip Disappearing on Hover

### Problem
When the user hovers over a heatmap hotspot, the tooltip appears. But when they try to interact with the tooltip, the cursor leaves the hotspot area, the tooltip immediately disappears, and they can't click anything.

### Root Cause
No debounce on hover leave event:
- `onMouseOut` from hotspot → immediately hides tooltip
- Tooltip appears ~ 15px from cursor
- User moves cursor to tooltip → leaves hotspot → tooltip hidden instantly
- User can't interact with tooltip

### Solution

#### Implementation: Debounced Hover State (HeatmapTooltipPortal.jsx)

```jsx
const HeatmapTooltipPortal = ({ hotspot, mapRef, onHotspotChange }) => {
  const [displayedHotspot, setDisplayedHotspot] = useState(null);
  const leaveTimeoutRef = useRef(null);

  // When hotspot prop changes
  useEffect(() => {
    if (hotspot) {
      // Clear any pending hide
      clearTimeout(leaveTimeoutRef.current);
      // Show immediately
      setDisplayedHotspot(hotspot);
    } else {
      // Debounce hide by 150ms - gives user time to move cursor to tooltip
      leaveTimeoutRef.current = setTimeout(() => {
        setDisplayedHotspot(null);
        clearTimeout(leaveTimeoutRef.current);
      }, 150);
    }

    return () => clearTimeout(leaveTimeoutRef.current);
  }, [hotspot]);

  // Tooltip element - can handle hover itself
  return createPortal(
    <div
      ref={tooltipRef}
      className="pointer-events-auto"
      style={{ zIndex: 9999 }}
      onMouseEnter={() => {
        // User hovering tooltip - cancel pending hide
        clearTimeout(leaveTimeoutRef.current);
        leaveTimeoutRef.current = null;
      }}
      onMouseLeave={() => {
        // User left tooltip - debounce hide
        leaveTimeoutRef.current = setTimeout(() => {
          setDisplayedHotspot(null);
          onHotspotChange(null);
        }, 100);
      }}
    >
      {/* Tooltip content */}
    </div>,
    document.body
  );
};
```

**How It Works:**

1. **Hotspot Hover** → `hotspot` prop set
   - Clear any pending timeout
   - Show tooltip immediately

2. **Hotspot Leave** → `hotspot` prop becomes null
   - Set 150ms timeout to hide tooltip
   - User has 150ms to move cursor to tooltip

3. **Cursor Enter Tooltip** → `onMouseEnter` fires
   - Clear timeout
   - Tooltip stays visible and interactive

4. **Cursor Leave Tooltip** → `onMouseLeave` fires
   - Set 100ms timeout to hide
   - Allows user to move cursor back to hotspot without flickering

**Debounce Timings:**
- `150ms` on hotspot leave - Enough time to move cursor (average ~100ms)
- `100ms` on tooltip leave - Faster cleanup, prevents flicker

**Critical: `pointer-events-auto`**
```css
/* Without this, modal isn't clickable */
className="pointer-events-auto"
```

---

## Implementation Checklist

### MapContainer.jsx
- ✅ Add `w-full` to outer container
- ✅ Add `overflow-hidden` to outer container
- ✅ Add `flex-shrink-0` to header
- ✅ Change map wrapper to `flex-1 min-w-0 min-h-0 relative`
- ✅ Ensure MapContainer has `style={{ width: '100%', height: '100%' }}`

### HeatmapTooltipPortal.jsx
- ✅ Add `onHotspotChange` prop
- ✅ Add `displayedHotspot` state (separate from `hotspot` prop)
- ✅ Add `leaveTimeoutRef` to track hide timeout
- ✅ Implement debounce logic in `useEffect`
- ✅ Add `onMouseEnter` / `onMouseLeave` to tooltip div
- ✅ Ensure tooltip has `pointer-events-auto`

### All Layout Pages (FireIncidents, MedicalEmergencies, RoadAccidents, RescueOperations)
```jsx
<div className="flex-1 flex gap-4 p-4 min-h-0 overflow-hidden">
  <div className="flex-1 min-w-0">
    <MapContainer />
  </div>
  <div className="w-96 bg-white border rounded-lg shadow-sm flex flex-col overflow-hidden">
    {/* Sidebar content */}
  </div>
</div>
```

---

## Testing

### Test #1: Map Doesn't Overflow
1. Open FireIncidents page (or any page with 2-column layout)
2. Map should stay within left column bounds
3. Resize window - map should shrink/grow without overflowing sidebar
4. Sidebar should remain fixed width (w-96)

### Test #2: Tooltip Stays Visible
1. Hover over heatmap hotspot
2. Move cursor towards tooltip (should NOT disappear in transition)
3. Move cursor onto tooltip itself
4. Tooltip should stay visible
5. Move cursor away from both - tooltip should fade after 100ms

### Test #3: Tooltip Interaction
1. Hover over tooltip to keep it visible
2. Try clicking on any modal content
3. Should be fully interactive (no pointer-events-none)

---

## Browser Compatibility
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers

---

## Performance Notes
- Debounce reduces unnecessary re-renders
- Timeout refs prevent memory leaks
- Portal keeps tooltip outside layout flow
- No impact on map or heatmap rendering

---

## Common Pitfalls to Avoid

❌ **Don't:**
- Remove `min-w-0` or `min-h-0` - map will overflow
- Use `height: 100vh` on map - breaks flex layout
- Use `pointer-events-none` on tooltip - can't interact
- Use `overflow: visible` on parent - allows overflow
- Set fixed height on map container - breaks responsive design

✅ **Do:**
- Use `flex` with `flex-1 min-w-0 min-h-0` for flex children
- Use `style={{ width: '100%', height: '100%' }}` for nested containers
- Add `pointer-events-auto` to interactive elements in portals
- Use `ref` to track elements for debounce logic
- Clean up timeouts in `useEffect` return function
