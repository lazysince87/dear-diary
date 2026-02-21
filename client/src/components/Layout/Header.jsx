import { NavLink } from 'react-router-dom';
import { BookHeart, Library, Heart, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Header() {
    const { isCovertMode, toggleCovertMode } = useApp();

    return (
        <header className="sticky top-0 z-50 backdrop-blur-md bg-cream/80 border-b border-warm-200/50">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <NavLink to="/" className="flex items-center gap-2 no-underline">
                    <span className="text-2xl">🌹</span>
                    <h1
                        className="text-xl font-semibold text-text-primary"
                        style={{ fontFamily: 'var(--font-serif)' }}
                    >
                        {isCovertMode ? 'My Recipes' : 'Rosie'}
                    </h1>
                </NavLink>

                {/* Navigation */}
                <nav className="flex items-center gap-1">
                    <NavLink
                        to="/"
                        className={({ isActive }) => `nav-link flex items-center gap-1.5 ${isActive ? 'active' : ''}`}
                    >
                        <BookHeart size={16} />
                        <span className="hidden sm:inline">{isCovertMode ? 'Notes' : 'Journal'}</span>
                    </NavLink>

                    <NavLink
                        to="/patterns"
                        className={({ isActive }) => `nav-link flex items-center gap-1.5 ${isActive ? 'active' : ''}`}
                    >
                        <Library size={16} />
                        <span className="hidden sm:inline">{isCovertMode ? 'Cookbook' : 'Patterns'}</span>
                    </NavLink>

                    <NavLink
                        to="/resources"
                        className={({ isActive }) => `nav-link flex items-center gap-1.5 ${isActive ? 'active' : ''}`}
                    >
                        <Heart size={16} />
                        <span className="hidden sm:inline">{isCovertMode ? 'Tips' : 'Resources'}</span>
                    </NavLink>

                    {/* Covert Mode Toggle */}
                    <button
                        onClick={toggleCovertMode}
                        className="ml-2 p-2 rounded-full transition-all duration-300 hover:bg-warm-200/50"
                        title={isCovertMode ? 'Exit safe mode' : 'Enter safe mode'}
                        aria-label="Toggle covert mode"
                    >
                        <Shield
                            size={18}
                            className={isCovertMode ? 'text-sage-dark' : 'text-text-muted'}
                        />
                    </button>
                </nav>
            </div>
        </header>
    );
}
