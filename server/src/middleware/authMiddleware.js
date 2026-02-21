const { supabase } = require('../lib/supabase');

/**
 * Middleware to verify Supabase JWT and attach user to request
 */
async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Please sign in to continue.'
            });
        }

        const token = authHeader.split(' ')[1];

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                error: 'Your session has expired. Please sign in again.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            error: 'Authentication failed. Please try signing in again.'
        });
    }
}

module.exports = { requireAuth };
