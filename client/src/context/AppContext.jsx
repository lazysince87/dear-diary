import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

// Generate or retrieve a persistent session ID
function getSessionId() {
    let sessionId = localStorage.getItem('rosie_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('rosie_session_id', sessionId);
    }
    return sessionId;
}

export function AppProvider({ children }) {
    const [sessionId] = useState(getSessionId);
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCovertMode, setIsCovertMode] = useState(false);

    // Add a new analyzed entry to the local state
    const addEntry = (entry) => {
        setEntries((prev) => [entry, ...prev]);
    };

    // Toggle covert mode
    const toggleCovertMode = () => {
        setIsCovertMode((prev) => !prev);
    };

    const value = {
        sessionId,
        entries,
        setEntries,
        addEntry,
        isLoading,
        setIsLoading,
        isCovertMode,
        toggleCovertMode,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
