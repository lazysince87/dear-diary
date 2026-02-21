import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { BookHeart, Library, Heart, Shield, LogOut, User, Music, History } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ onLogoutClick }) {
  const { isCovertMode, toggleCovertMode, isMusicOn, nowPlaying, toggleMusic } = useApp();
  const { user } = useAuth();
  const location = useLocation();

  const getTitleColor = () => {
    if (location.pathname === '/patterns') return '#4a7c59';
    if (location.pathname === '/resources') return '#7b5ea7';
    if (location.pathname === '/profile') return '#4a6fa5';
    if (location.pathname === '/entries') return '#a5794aff';
    return '#c9748a';
  };

  return (
    <header
      className="sticky top-0 z-50 mt-3 ml-3 mr-3 backdrop-blur-md border-warm-200/50"
      style={{
        backgroundColor: "white",
        borderRadius: "20px",
        padding: "0px 0px",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between">
        <NavLink to="/" className="flex items-center gap-2 no-underline">
          <h1
            className="text-left text-xl font-semibold"
            style={{ fontFamily: "var(--font-serif)", color: getTitleColor(), transition: "color 0.3s ease" }}
          >
            Dear Diary
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
            <span className="hidden sm:inline">Write</span>
          </NavLink>

          <NavLink
            to="/entries"
            className={({ isActive }) =>
              `nav-link flex items-center gap-1.5 ${isActive ? "active" : ""}`
            }
          >
            <History size={16} />
            <span className="hidden sm:inline">Entries</span>
          </NavLink>

          <NavLink
            to="/patterns"
            className={({ isActive }) =>
              `nav-link flex items-center gap-1.5 ${isActive ? "active" : ""}`
            }
          >
            <Library size={16} />
            <span className="hidden sm:inline">Learn</span>
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
              <span
                className="hidden sm:inline text-xs font-medium uppercase tracking-wider"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Logout
              </span>
            </button>
          ) : (
            <NavLink
              to="/login"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 hover:bg-rose-50 text-text-muted hover:text-dusty-rose-dark"
              title="Sign in"
            >
              <LogOut size={18} className="rotate-180" />
              <span
                className="hidden sm:inline text-xs font-medium uppercase tracking-wider"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Login
              </span>
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

