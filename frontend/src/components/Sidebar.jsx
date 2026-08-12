import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, ArrowLeftRight, UsersRound, ClipboardList } from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'],
    },
    {
      name: 'Purchases',
      path: '/purchases',
      icon: ShoppingCart,
      roles: ['ADMIN', 'LOGISTICS_OFFICER'],
    },
    {
      name: 'Transfers',
      path: '/transfers',
      icon: ArrowLeftRight,
      roles: ['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER'],
    },
    {
      name: 'Assignments',
      path: '/assignments',
      icon: UsersRound,
      roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'],
    },
  ];

  if (!user) return null;

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/40 p-4">
      <div className="space-y-4">
        <div className="px-3 py-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
          Tactical Operations
        </div>
        <nav className="space-y-1">
          {menuItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-500 border-l-2 border-amber-500'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              );
            })}
        </nav>
      </div>
    </aside>
  );
}
