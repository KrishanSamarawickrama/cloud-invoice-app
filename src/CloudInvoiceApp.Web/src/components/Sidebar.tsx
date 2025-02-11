import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="bg-slate-900 text-white w-72 min-h-screen p-6 shadow-xl">
      <div className="text-2xl font-bold mb-10 bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
        Cloud Invoice App
      </div>
      <nav>
        <ul className="space-y-3">
          <li>
            <Link
              to="/invoices"
              className={`flex items-center space-x-3 py-3 px-4 rounded-lg transition-all duration-200 ${
                location.pathname === '/invoices'
                  ? 'bg-blue-700 text-white'
                  : 'hover:bg-gray-700'
              }`}
            >
              Invoices
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
