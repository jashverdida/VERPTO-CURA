import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MapIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  ServerIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const CorporateSidebar = ({ collapsed, onToggle, variant = 'dark' }) => {
  const location = useLocation();

  const navItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: MapIcon,
      path: '/',
      description: 'Operations overview'
    },
    {
      id: 'incidents',
      name: 'Incidents',
      icon: ExclamationTriangleIcon,
      path: '/incidents',
      description: 'Active emergencies',
      badge: 5, // Critical count
      badgeType: 'critical'
    },
    {
      id: 'notifications',
      name: 'Alerts',
      icon: BellIcon,
      path: '/notifications',
      description: 'AI notifications',
      badge: 3,
      badgeType: 'warning'
    },
    {
      id: 'pcr',
      name: 'PCR Log',
      icon: ClipboardDocumentListIcon,
      path: '/pcr',
      description: 'Patient records'
    },
    {
      id: 'system',
      name: 'System Status',
      icon: ServerIcon,
      path: '/system',
      description: 'Infrastructure monitoring'
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const sidebarClass = variant === 'dark'
    ? 'corporate-sidebar'
    : 'corporate-sidebar-light';

  const textClass = variant === 'dark'
    ? 'text-white'
    : 'text-slate-900';

  const secondaryTextClass = variant === 'dark'
    ? 'text-slate-300'
    : 'text-slate-600';

  const navItemClass = variant === 'dark'
    ? 'sidebar-nav-item'
    : 'sidebar-nav-item-light';

  return (
    <div className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Sidebar Container */}
      <div className={`h-full ${sidebarClass} flex flex-col`}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200/10">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/cura-logo.png" alt="CURA Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className={`font-bold text-lg ${textClass}`}>
                  CURA
                </h1>
                <p className={`text-xs font-medium ${secondaryTextClass}`}>
                  Command Center
                </p>
              </div>
            </div>
          )}

          <button
            onClick={onToggle}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              variant === 'dark'
                ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* System Status - Only show when expanded */}
        {!collapsed && (
          <div className="p-4 border-b border-slate-200/10">
            <div className={`p-3 rounded-lg ${
              variant === 'dark'
                ? 'bg-emerald-600/10 border border-emerald-600/20'
                : 'bg-emerald-50 border border-emerald-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className={`text-xs font-medium ${
                    variant === 'dark' ? 'text-emerald-300' : 'text-emerald-700'
                  }`}>
                    System Operational
                  </span>
                </div>
                <span className={`text-xs font-mono ${secondaryTextClass}`}>
                  99.9%
                </span>
              </div>
              <p className={`text-xs ${secondaryTextClass}`}>
                All nodes responding
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`relative ${navItemClass} ${active ? 'active' : ''} group`}
                title={collapsed ? item.name : ''}
              >
                <div className="flex items-center min-w-0">
                  <IconComponent className={`w-5 h-5 ${collapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />

                  {!collapsed && (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {item.name}
                        </div>
                        <div className={`text-xs ${secondaryTextClass} truncate`}>
                          {item.description}
                        </div>
                      </div>

                      {/* Badge */}
                      {item.badge && (
                        <div className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.badgeType === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.badge}
                        </div>
                      )}
                    </>
                  )}

                  {/* Collapsed badge indicator */}
                  {collapsed && item.badge && (
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                      item.badgeType === 'critical'
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}>
                      {item.badge}
                    </div>
                  )}
                </div>

                {/* Hover tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-slate-300">{item.description}</div>
                    {/* Tooltip arrow */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full">
                      <div className="w-2 h-2 bg-slate-800 transform rotate-45"></div>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/10">
          {!collapsed ? (
            <div className="space-y-3">
              {/* Emergency Contact */}
              <div className={`p-3 rounded-lg ${
                variant === 'dark'
                  ? 'bg-red-600/10 border border-red-600/20'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${
                    variant === 'dark' ? 'text-red-300' : 'text-red-700'
                  }`}>
                    Emergency Hotline
                  </span>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <div className={`text-xl font-bold font-mono ${
                  variant === 'dark' ? 'text-white' : 'text-red-900'
                }`}>
                  911
                </div>
              </div>

              {/* Version */}
              <div className="text-center">
                <div className={`text-xs font-medium ${secondaryTextClass}`}>
                  v1.0.0 • Edge AI Enabled
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-sm">!</span>
              </div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full mx-auto"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorporateSidebar;