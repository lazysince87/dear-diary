import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, Heart } from 'lucide-react';

export default function LoginPage() {
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
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
                    navigate('/');
                }
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
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
            setError(err.message || 'Something went wrong with Google sign in');
        } finally {
            setLoading(false);
        }
    };

    if (confirmationSent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-cream)' }}>
                <div className="glass-card p-8 md:p-10 max-w-md w-full text-center animate-fade-in">
                    <div className="text-5xl mb-4">💌</div>
                    <h2
                        className="text-2xl font-bold text-text-primary mb-3"
                        style={{ fontFamily: 'var(--font-serif)' }}
                    >
                        Check your email
                    </h2>
                    <p className="text-text-secondary leading-relaxed">
                        We sent a confirmation link to <strong>{email}</strong>.
                        Click the link to activate your account, then come back and sign in.
                    </p>
                    <button
                        onClick={() => { setConfirmationSent(false); setIsSignUp(false); }}
                        className="btn-secondary mt-6"
                    >
                        Back to Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-cream)' }}>
            {/* Background decorations */}
            <div className="bg-decoration bg-decoration-1" />
            <div className="bg-decoration bg-decoration-2" />
            <div className="bg-decoration bg-decoration-3" />

            <div className="glass-card p-8 md:p-10 max-w-md w-full animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3 animate-float">🌹</div>
                    <h1
                        className="text-3xl font-bold text-text-primary mb-2"
                        style={{ fontFamily: 'var(--font-serif)' }}
                    >
                        {isSignUp ? 'Create Your Space' : 'Welcome Back'}
                    </h1>
                    <p className="text-text-secondary text-sm">
                        {isSignUp
                            ? 'A safe place to reflect and grow.'
                            : 'Your journal is waiting for you.'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Your name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="How should we call you?"
                                className="w-full px-4 py-3 rounded-xl border-1.5 border-warm-200 bg-white/70 text-text-primary placeholder-text-muted focus:border-dusty-rose focus:ring-2 focus:ring-dusty-rose-light/30 outline-none transition-all"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-xl border-1.5 border-warm-200 bg-white/70 text-text-primary placeholder-text-muted focus:border-dusty-rose focus:ring-2 focus:ring-dusty-rose-light/30 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={isSignUp ? 'At least 6 characters' : '••••••••'}
                            className="w-full px-4 py-3 rounded-xl border-1.5 border-warm-200 bg-white/70 text-text-primary placeholder-text-muted focus:border-dusty-rose focus:ring-2 focus:ring-dusty-rose-light/30 outline-none transition-all"
                            minLength={6}
                            required
                        />
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-sm animate-fade-in">
                            {error}
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        className="btn-primary w-full flex items-center justify-center gap-2 !py-3"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>{isSignUp ? 'Creating your space...' : 'Signing in...'}</span>
                            </>
                        ) : (
                            <>
                                <Heart size={16} />
                                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                            </>
                        )}
                    </button>

                    {/* OR Separator */}
                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-warm-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white/70 px-2 text-text-muted">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign In Button */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="btn-secondary w-full flex items-center justify-center gap-3 !py-3 bg-white/50 border-1.5 border-warm-200 hover:border-dusty-rose transition-all"
                        disabled={loading}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Google</span>
                    </button>
                </form>

                {/* Toggle sign in / sign up */}
                <div className="text-center mt-6">
                    <p className="text-sm text-text-muted">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                            className="text-dusty-rose-dark hover:text-rose-500 font-semibold transition-colors underline underline-offset-2"
                        >
                            {isSignUp ? 'Sign In' : 'Create one'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
