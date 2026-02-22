import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2, Book, ArrowLeft } from "lucide-react";
import cloudsImg from "../assets/backgrounds/clouds.png";

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, { full_name: name });
        if (error) {
          setError(error);
        } else {
          setConfirmationSent(true);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error);
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) setError(error);
    } catch (err) {
      setError(err.message || "Something went wrong with Google sign in");
    } finally {
      setLoading(false);
    }
  };

  if (confirmationSent) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: "#f5d5dd",
        }}
      >
        <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&display=swap');
                    .lp-book {
                        background: #fffaf7;
                        border: 1px solid #e8d5c4;
                        border-radius: 16px;
                        box-shadow: 3px 3px 0 #e0c4c4, 6px 6px 0 rgba(201,160,160,0.2);
                        max-width: 450px;
                        width: 100%;
                        overflow: hidden;
                    }
                    .lp-inner { display: flex; }
                    .lp-spine {
                        width: 28px;
                        background: #fcf6f9;
                        border-right: 1px solid #d4b096;
                        border-radius: 16px 0 0 16px;
                        flex-shrink: 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 16px 0;
                        gap: 10px;
                    }
                    .lp-spine-dot {
                        width: 6px; height: 6px;
                        background: #fffaf7;
                        border: 1px solid #c9a0a0;
                        border-radius: 1px;
                    }
                    .lp-content { flex: 1; padding: 32px 32px 24px; }
                    .lp-title {
                        font-family: 'Pixelify Sans', sans-serif;
                        font-size: 24px;
                        color: #3d2c2c;
                        margin-bottom: 8px;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                    }
                    .lp-subtitle {
                        font-family: 'Pixelify Sans', sans-serif;
                        font-size: 12px;
                        color: #9a8282;
                        margin-bottom: 24px;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                    }
                `}</style>
        <div className="lp-book animate-fade-in">
          <div className="lp-inner">
            <div className="lp-spine">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="lp-spine-dot" />
              ))}
            </div>
            <div className="lp-content text-center">
              <div className="text-5xl mb-4"></div>
              <h2 className="lp-title">Check your email</h2>
              <p
                className="lp-subtitle"
                style={{ textTransform: "none", fontSize: "14px" }}
              >
                We sent a link to <strong>{email}</strong>.<br />
                Activate your account, then come back and sign in.
              </p>
              <button
                onClick={() => {
                  setConfirmationSent(false);
                  setIsSignUp(false);
                }}
                className="je-submit mt-4"
                style={{ width: "100%" }}
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "#f5d5dd",
      }}
    >
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&display=swap');
                
                .lp-book {
                    background: #fffaf7;
                    border: 1px solid #e8d5c4;
                    border-radius: 16px;
                    box-shadow: 3px 3px 0 #e0c4c4, 6px 6px 0 rgba(201,160,160,0.2);
                    max-width: 450px;
                    width: 100%;
                    overflow: hidden;
                }

                .lp-inner {
                    display: flex;
                }

                .lp-spine {
                    width: 28px;
                    background: #fcf6f9;
                    border-right: 1px solid #d4b096;
                    border-radius: 16px 0 0 16px;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 16px 0;
                    gap: 10px;
                }

                .lp-spine-dot {
                    width: 6px;
                    height: 6px;
                    background: #fffaf7;
                    border: 1px solid #c9a0a0;
                    border-radius: 1px;
                }

                .lp-content {
                    flex: 1;
                    padding: 32px 32px 24px;
                }

                .lp-title {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 24px;
                    color: #3d2c2c;
                    margin-bottom: 8px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .lp-subtitle {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 11px;
                    color: #9a8282;
                    margin-bottom: 24px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }

                .lp-label {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 10px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: #9a8282;
                    display: block;
                    margin-bottom: 8px;
                }

                .lp-input {
                    width: 100%;
                    background: #fffaf7;
                    border: 1px solid #e8d5c4;
                    border-radius: 2px;
                    padding: 10px 12px;
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 14px;
                    color: #3d2c2c;
                    margin-bottom: 16px;
                    outline: none;
                    transition: all 0.1s;
                }

                .lp-input:focus {
                    border-color: #c9a0a0;
                    background: #fdf6f0;
                }

                .lp-submit {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 12px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    padding: 12px;
                    width: 100%;
                    border: 1px solid #c9a0a0;
                    background: transparent;
                    color: #6b5454;
                    cursor: pointer;
                    border-radius: 2px;
                    transition: all 0.15s;
                    margin-top: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .lp-submit:hover:not(:disabled) {
                    background: #f5ebe0;
                    border-color: #a67b7b;
                    color: #3d2c2c;
                }

                .lp-submit:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .lp-divider {
                    position: relative;
                    margin: 24px 0;
                    text-align: center;
                }

                .lp-divider::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    border-top: 1px dashed #e8d5c4;
                    z-index: 0;
                }

                .lp-divider span {
                    background: #fffaf7;
                    padding: 0 12px;
                    position: relative;
                    z-index: 1;
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 10px;
                    color: #c9b4b4;
                    letter-spacing: 1px;
                }

                .lp-google {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 11px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    padding: 10px;
                    width: 100%;
                    border: 1px solid #e8d5c4;
                    background: transparent;
                    color: #9a8282;
                    cursor: pointer;
                    border-radius: 2px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.1s;
                }

                .lp-google:hover {
                    border-color: #c9a0a0;
                    color: #6b5454;
                    background: #fdf6f0;
                }

                .lp-toggle {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 11px;
                    color: #9a8282;
                    margin-top: 20px;
                    text-align: center;
                }

                .lp-toggle button {
                    color: #c9a0a0;
                    background: none;
                    border: none;
                    cursor: pointer;
                    text-decoration: underline;
                    padding-left: 4px;
                }
                
                .lp-error {
                    font-family: 'Pixelify Sans', sans-serif;
                    font-size: 11px;
                    color: #c9365a;
                    margin-bottom: 16px;
                    letter-spacing: 1px;
                    text-align: center;
                }
            `}</style>

      <div className="lp-book animate-fade-in">
        <div className="lp-inner">
          <div className="lp-spine">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="lp-spine-dot" />
            ))}
          </div>

          <div className="lp-content">
            {/* Header */}
            <div className="text-center">
              <div className="text-5xl mb-4 animate-float"></div>
              <h1 className="lp-title">
                {isSignUp ? "New Diary" : "Open Diary"}
              </h1>
            </div>

            {/* Error Message */}
            {error && <div className="lp-error">{error}</div>}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {isSignUp && (
                <>
                  <label className="lp-label">Your Name</label>
                  <input
                    type="text"
                    className="lp-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="How should I call you?"
                    required
                  />
                </>
              )}

              <label className="lp-label">Email</label>
              <input
                type="email"
                className="lp-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <label className="lp-label">Password</label>
              <input
                type="password"
                className="lp-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
              />

              <button type="submit" className="lp-submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Wait...</span>
                  </>
                ) : (
                  <span>{isSignUp ? "Create Space" : "Sign In"}</span>
                )}
              </button>
            </form>

            {/* OR Separator */}
            <div className="lp-divider">
              <span>Or use Google</span>
            </div>

            {/* Google Button */}
            <button
              type="button"
              className="lp-google"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Google Auth</span>
            </button>

            {/* Toggle */}
            <div className="lp-toggle">
              {isSignUp ? "Already have a diary?" : "New here?"}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
              >
                {isSignUp ? "Sign In" : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
