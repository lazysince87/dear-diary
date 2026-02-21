import { NavLink, useNavigate } from 'react-router-dom';
import { BookHeart, Library, Heart, Shield, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ onLogoutClick }) {
  const { isCovertMode, toggleCovertMode } = useApp();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b border-warm-200/50" style={{ backgroundColor: '#fdf7fa' }}>
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 no-underline">
          <h1
            className="text-xl font-semibold text-text-primary"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {isCovertMode ? "My Recipes" : "Rosie"}
          </h1>
        </NavLink>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-link flex items-center gap-1.5 ${isActive ? "active" : ""}`
            }
          >
            <BookHeart size={16} />
            <span className="hidden sm:inline">Journal</span>
          </NavLink>

          <NavLink
            to="/patterns"
            className={({ isActive }) =>
              `nav-link flex items-center gap-1.5 ${isActive ? "active" : ""}`
            }
          >
            <Library size={16} />
            <span className="hidden sm:inline">Patterns</span>
          </NavLink>

          <NavLink
            to="/resources"
            className={({ isActive }) =>
              `nav-link flex items-center gap-1.5 ${isActive ? "active" : ""}`
            }
          >
            <Heart size={16} />
            <span className="hidden sm:inline">Resources</span>
          </NavLink>

          {/* Covert Mode Toggle */}
          {/* <button
            onClick={toggleCovertMode}
            className="ml-2 p-2 rounded-full transition-all duration-300 hover:bg-warm-200/50"
            title={isCovertMode ? 'Exit safe mode' : 'Enter safe mode'}
            aria-label="Toggle covert mode"
          >
            <Shield
              size={18}
              className={isCovertMode ? 'text-sage-dark' : 'text-text-muted'}
            />
          </button> */}

          {/* Auth Button */}
          {user ? (
            <button
              onClick={onLogoutClick}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 hover:bg-rose-50 text-text-muted hover:text-rose-600"
              title="Sign out"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline text-xs font-medium uppercase tracking-wider" style={{ fontFamily: 'var(--font-serif)' }}>Logout</span>
            </button>
          ) : (
            <NavLink
              to="/login"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 hover:bg-rose-50 text-text-muted hover:text-dusty-rose-dark"
              title="Sign in"
            >
              <LogOut size={18} className="rotate-180" />
              <span className="hidden sm:inline text-xs font-medium uppercase tracking-wider" style={{ fontFamily: 'var(--font-serif)' }}>Login</span>
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
