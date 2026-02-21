import { NavLink, useNavigate } from 'react-router-dom';
import { BookHeart, Library, Heart, Shield, LogOut, User, Music } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ onLogoutClick }) {
  const { isCovertMode, toggleCovertMode, isMusicOn, nowPlaying, toggleMusic } = useApp();
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

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `nav-link flex items-center gap-1.5 ${isActive ? "active" : ""}`
            }
          >
            <User size={16} />
            <span className="hidden sm:inline">Profile</span>
          </NavLink>

          {/* Music Toggle */}
          {user && (
            <button
              onClick={toggleMusic}
              className="nav-link flex items-center gap-1.5"
              title={isMusicOn && nowPlaying ? `Now playing: ${nowPlaying.name} - ${nowPlaying.artist}` : 'Play music'}
              style={{
                color: isMusicOn ? '#c9748a' : undefined,
                position: 'relative',
              }}
            >
              <Music size={16} className={isMusicOn ? 'animate-pulse-soft' : ''} />
              <span className="hidden sm:inline">{isMusicOn ? 'Stop' : 'Music'}</span>
              {isMusicOn && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '-2px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#c9748a',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              )}
            </button>
          )}

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

      {/* Now Playing Bar */}
      {isMusicOn && nowPlaying && (
        <div style={{
          background: 'rgba(201, 116, 138, 0.08)',
          borderTop: '1px solid rgba(201, 116, 138, 0.15)',
          padding: '4px 16px',
          textAlign: 'center',
          fontFamily: "'Pixelify Sans', sans-serif",
          fontSize: '10px',
          color: '#9a8282',
          letterSpacing: '0.5px',
        }}>
          Now playing: {nowPlaying.name} — {nowPlaying.artist}
        </div>
      )}
    </header>
  );
}

