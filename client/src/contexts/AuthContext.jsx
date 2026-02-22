import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            setLoading(false)
        }

        getInitialSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => subscription?.unsubscribe()
    }, [])

    // Sign up function
    const signUp = async (email, password, metadata = {}) => {
        try {
            setLoading(true)
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                    emailRedirectTo: window.location.origin
                }
            })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    // Sign in function
    const signIn = async (email, password) => {
        try {
            setLoading(true)
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    // Sign out function
    const signOut = async () => {
        try {
            setLoading(true)
            const { error } = await supabase.auth.signOut()
            if (error) throw error
        } catch (error) {
            console.error('Error signing out:', error.message)
        } finally {
            setLoading(false)
        }
    }

    // Reset password function
    const resetPassword = async (email) => {
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error: error.message }
        }
    }

    // Sign in with Google function
    const signInWithGoogle = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}`
                }
            })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    // Update password function
    const updatePassword = async (newPassword) => {
        try {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error: error.message }
        }
    }

    const value = {
        user,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
