import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { X, Check } from "lucide-react";
import Header from "./Header";
import { useAuth } from "../../contexts/AuthContext";
import cloudsImg from "../../assets/clouds.png";
import greenCloudsImg from "../../assets/green-clouds.png";
import purpleCloudsImg from "../../assets/purple-clouds.png";
import blueCloudsImg from "../../assets/blue-clouds.png";

export default function Layout() {
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getBackgroundImage = () => {
    if (location.pathname === '/patterns') return greenCloudsImg;
    if (location.pathname === '/resources') return purpleCloudsImg;
    if (location.pathname === '/profile') return blueCloudsImg;
    return cloudsImg;
  };

  const handleSignOut = async () => {
    await signOut();
    setShowConfirmLogout(false);
    navigate('/login');
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        transition: 'background-image 0.5s ease',
      }}
    >
      {/* Background decorations */}
      <div className="bg-decoration bg-decoration-1" />
      <div className="bg-decoration bg-decoration-2" />
      <div className="bg-decoration bg-decoration-3" />

      <Header onLogoutClick={() => setShowConfirmLogout(true)} />

      <main className={`flex justify-center px-4 py-6 md:py-10 relative z-10 transition-all duration-300 ${showConfirmLogout ? 'blur-sm pointer-events-none' : ''}`}>
        <div style={{ width: '100%', maxWidth: '1100px' }}>
          <Outlet />
        </div>
      </main>
      <footer className="text-center py-6 text-text-muted text-sm"></footer>

      {/* Logout Confirmation Modal */}
      {showConfirmLogout && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 p-4 bg-black/40 backdrop-blur-md animate-fade-in-fast">
          <div
            className="bg-[#fffaf7] border-2 border-[#e8d5c4] shadow-[4px_4px_0_#e0c4c4] p-6 max-w-sm w-full animate-fade-in"
            style={{ borderRadius: '2px' }}
          >
            <div className="text-center">
              <div className="text-4xl mb-4"></div>
              <h2 className="text-xl font-bold mb-2 uppercase tracking-wide" style={{ fontFamily: 'var(--font-serif)', color: '#3d2c2c' }}>
                Sign out?
              </h2>
              <p className="text-[#6b5454] text-sm mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                Are you sure you want to sign out of your diary?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmLogout(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[#e8d5c4] text-[#9a8282] hover:bg-[#f5ebe0] transition-colors"
                  style={{ fontFamily: 'var(--font-serif)', fontSize: '12px', textTransform: 'uppercase', borderRadius: '2px' }}
                >
                  <X size={14} />
                  Stay
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[#c9a0a0] text-[#a67b7b] hover:bg-[#fff5f5] transition-colors"
                  style={{ fontFamily: 'var(--font-serif)', fontSize: '12px', textTransform: 'uppercase', borderRadius: '2px' }}
                >
                  <Check size={14} />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
