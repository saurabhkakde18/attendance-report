import React from 'react';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Clock,
  CalendarCheck,
  CalendarDays,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  Smartphone,
  LogOut,
  Building2,
  Download,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout: () => void;
  onSwitchToEmployeeView: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onLogout,
  onSwitchToEmployeeView,
  isOpen = false,
  onClose,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'employees', label: 'Employee Management', icon: Users },
    { id: 'geofence', label: 'Office GPS & 50m Geofence', icon: MapPin },
    { id: 'attendance', label: 'Live Attendance & Audits', icon: Clock },
    { id: 'calendar', label: 'Attendance Calendar', icon: CalendarDays },
    { id: 'leaves', label: 'Leave Policy & Requests', icon: CalendarCheck },
    { id: 'payroll', label: 'Salary & Payroll Engine', icon: FileSpreadsheet },
    { id: 'reports', label: 'Monthly Reports & Export', icon: FileSpreadsheet },
    { id: 'settings', label: 'System & Policy Config', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Dark Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Aside */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-navy-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 shrink-0 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:w-64 md:z-auto ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm tracking-wide">Attendance Report</h1>
              <p className="text-xs text-brand-sky font-medium flex items-center mt-0.5">
                <ShieldCheck className="w-3 h-3 mr-1" /> OMSAIRAM GPS 50m
              </p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition-colors"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Enterprise HR Modules
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-md shadow-blue-600/20'
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Switch to Employee Portal Mode & Logout */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <a
            href="/AttendanceReport.apk"
            download="AttendanceReport.apk"
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-700/30"
            title="Download Android APK for Mobile"
          >
            <Download className="w-4 h-4" />
            <span>Download Android APK</span>
          </a>

          <button
            onClick={() => {
              onSwitchToEmployeeView();
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-brand-sky transition-colors border border-slate-700"
          >
            <Smartphone className="w-4 h-4" />
            <span>Test Employee Mobile App View</span>
          </button>

          <button
            onClick={() => {
              onLogout();
              if (onClose) onClose();
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
};
