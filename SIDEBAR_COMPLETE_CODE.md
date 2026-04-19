# Complete Updated Sidebar.jsx Component

## Full Component Code

```jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MapIcon,
  ServerIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ShieldCheckIcon,
  PhoneIcon,
  FireIcon,
  HeartIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

// ==========================================
// THEME COLOR MAPPING (Strict Dictionary)
// No dynamic class construction - safe from Tailwind purging
// ==========================================
const CATEGORY_COLOR_MAP = {
  fire:       { bg: 'bg-red-600',      shadow: 'shadow-red-900/30',      badgeBg: 'bg-white',      badgeText: 'text-red-600' },
  medical:    { bg: 'bg-blue-600',     shadow: 'shadow-blue-900/30',     badgeBg: 'bg-white',      badgeText: 'text-blue-600' },
  accidents:  { bg: 'bg-amber-500',    shadow: 'shadow-amber-900/30',    badgeBg: 'bg-slate-900',  badgeText: 'text-amber-500' },
  rescue:     { bg: 'bg-purple-600',   shadow: 'shadow-purple-900/30',   badgeBg: 'bg-white',      badgeText: 'text-purple-600' },
  dashboard:  { bg: 'bg-emerald-600',  shadow: 'shadow-emerald-900/30',  badgeBg: 'bg-white',      badgeText: 'text-emerald-600' },
  system:     { bg: 'bg-emerald-600',  shadow: 'shadow-emerald-900/30',  badgeBg: 'bg-white',      badgeText: 'text-emerald-600' },
  default:    { bg: 'bg-emerald-600',  shadow: 'shadow-emerald-900/30',  badgeBg: 'bg-white',      badgeText: 'text-emerald-600' }
};

// Route-to-category mapping
const ROUTE_CATEGORY_MAP = {
  '/dashboard':  'dashboard',
  '/fire':       'fire',
  '/medical':    'medical',
  '/accidents':  'accidents',
  '/rescue':     'rescue',
  '/system':     'system'
};

// Helper function: Get category from pathname
const getCategoryFromPath = (pathname) => {
  if (ROUTE_CATEGORY_MAP[pathname]) {
    return ROUTE_CATEGORY_MAP[pathname];
  }
  for (const [path, category] of Object.entries(ROUTE_CATEGORY_MAP)) {
    if (pathname.startsWith(path)) {
      return category;
    }
  }
  return 'default';
};

// Helper function: Get theme colors for a category
const getThemeColors = (category) => {
  return CATEGORY_COLOR_MAP[category] || CATEGORY_COLOR_MAP.default;
};

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    navigate('/');
  };

  // Get active category from current route
  const activeCategory = getCategoryFromPath(location.pathname);
  const activeTheme = getThemeColors(activeCategory);

  // Consistent dark slate theme for sidebar
  const sidebarColors = {
    bg: 'bg-gradient-to-b from-slate-900 to-slate-950',
    border: 'border-slate-700/50',
    primary: 'bg-emerald-600',
    hover: 'hover:bg-slate-800',
    text: 'text-slate-300',
    textSecondary: 'text-slate-400',
  };

  const navItems = [
    {
      id: 'dashboard',
      name: 'Overview',
      icon: MapIcon,
      path: '/dashboard',
      description: 'Command center overview',
      category: 'dashboard'
    },
    {
      id: 'fire',
      name: 'Fire Incidents',
      icon: FireIcon,
      path: '/fire',
      description: 'Fire emergencies',
      badge: 2,
      category: 'fire'
    },
    {
      id: 'medical',
      name: 'Medical Emergencies',
      icon: HeartIcon,
      path: '/medical',
      description: 'Medical calls & PCR',
      badge: 5,
      category: 'medical'
    },
    {
      id: 'accidents',
      name: 'Road Accidents',
      icon: TruckIcon,
      path: '/accidents',
      description: 'Traffic incidents',
      badge: 3,
      category: 'accidents'
    },
    {
      id: 'rescue',
      name: 'Rescue Operations',
      icon: MagnifyingGlassIcon,
      path: '/rescue',
      description: 'Search & rescue',
      badge: 1,
      category: 'rescue'
    },
    {
      id: 'system',
      name: 'System Status',
      icon: ServerIcon,
      path: '/system',
      description: 'Edge monitoring',
      category: 'system'
    }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      <div className={`h-full ${sidebarColors.bg} text-white flex flex-col shadow-2xl`}>

        {/* Logo Section */}
        <div className={`p-4 border-b ${sidebarColors.border}`}>
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/50">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">CURA</h1>
                  <p className="text-xs text-slate-400">Command Center</p>
                </div>
              </div>
            )}

            {collapsed && (
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={onToggle}
            className={`mt-3 w-full p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200 flex items-center justify-center`}
          >
            {collapsed ? <Bars3Icon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);
            const itemTheme = getThemeColors(item.category);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`relative w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out group ${
                  active
                    ? `text-white ${itemTheme.bg} shadow-lg ${itemTheme.shadow}`
                    : `${sidebarColors.text} ${sidebarColors.hover} hover:text-white`
                }`}
              >
                <IconComponent className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />

                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.badge && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold transition-colors duration-300 ${
                        active
                          ? `${itemTheme.badgeBg} ${itemTheme.badgeText}`
                          : 'bg-slate-600 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {collapsed && item.badge && (
                  <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center transition-colors duration-300 ${
                    active
                      ? `${itemTheme.badgeBg} ${itemTheme.badgeText}`
                      : 'bg-slate-600 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section: User Profile + Emergency Hotline */}
        <div className={`p-3 border-t ${sidebarColors.border} space-y-3`}>

          {/* User Profile Block */}
          {!collapsed ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all duration-200"
              >
                <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-white">Admin User</div>
                  <div className="text-xs text-slate-400">Operator</div>
                </div>
                <Cog6ToothIcon className="w-4 h-4 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-slate-700">
                    <div className="text-sm font-semibold text-white">Admin User</div>
                    <div className="text-xs text-slate-400">admin@cura.gov.ph</div>
                  </div>
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center space-x-2 px-3 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2.5 text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors group"
              >
                <UserCircleIcon className="w-6 h-6 text-slate-400 mx-auto group-hover:text-white" />
              </button>
              {showUserMenu && (
                <div className="absolute left-full bottom-0 ml-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 w-48">
                  <div className="p-3 border-b border-slate-700">
                    <div className="text-sm font-semibold text-white">Admin User</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2.5 text-red-400 hover:bg-red-900/30 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Emergency Hotline */}
          {!collapsed ? (
            <div className="bg-red-950/50 border border-red-900/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-medium text-red-300">Emergency</span>
                </div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-xl font-bold text-white font-mono">911</div>
            </div>
          ) : (
            <div className="bg-red-950/50 border border-red-900/50 rounded-lg p-2 flex items-center justify-center">
              <PhoneIcon className="w-5 h-5 text-red-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
```

---

## 🎯 What Changed

### 1. Added Color Map Configuration (Lines 19-31)
- Maps each category to theme colors
- Includes background, shadow, badge inversion colors

### 2. Added Route-Category Mapping (Lines 33-41)
- Maps URL paths to category keys

### 3. Added Helper Functions (Lines 43-59)
- `getCategoryFromPath()` - determines category from URL
- `getThemeColors()` - retrieves theme for a category

### 4. Active Theme Detection (Lines 72-74)
- Detects active category from current route
- Gets theme colors for that category

### 5. Updated NavItems Structure
- Added `category` property to each nav item
- Removed hardcoded `badgeColor` property

### 6. Dynamic Link Styling (Lines 194-198)
- Changed from hardcoded `bg-emerald-600` to `${itemTheme.bg}`
- Added smooth transition: `transition-all duration-300 ease-in-out`
- Dynamic shadow color: `${itemTheme.shadow}`

### 7. Dynamic Badge Styling (Lines 206-212 & 218-224)
- Badges now invert colors when active
- Added transition-colors: `transition-colors duration-300`
- Normal state: `bg-slate-600 text-white`
- Active state: `${itemTheme.badgeBg} ${itemTheme.badgeText}`

---

## 🔍 Visual Results

### Before (Static)
```
Fire Incidents    [2]  → Always bg-emerald-600 with white badge
Medical           [5]  → Always bg-emerald-600 with white badge
Road Accidents    [3]  → Always bg-emerald-600 with white badge
```

### After (Dynamic)
```
Fire Incidents    [2]  → bg-red-600 with white bg + red text badge
Medical           [5]  → bg-blue-600 with white bg + blue text badge
Road Accidents    [3]  → bg-amber-500 with dark bg + amber text badge
Rescue            [1]  → bg-purple-600 with white bg + purple text badge
Overview              → bg-emerald-600 with white bg + emerald text badge
```

All transitions smooth over 300ms! ✨

---

## ✅ Testing

Run your dev server and navigate:
```bash
npm run dev
```

Then:
1. Click "Fire Incidents" → Red highlight, white badge with red text
2. Click "Medical" → Blue highlight, white badge with blue text
3. Click "Road Accidents" → Amber highlight, dark badge with amber text
4. Click "Rescue" → Purple highlight, white badge with purple text

All colors fade smoothly! 🎨
