import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchEntries } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const AppContext = createContext(null);

// Generate or retrieve a persistent session ID
function getSessionId() {
  let sessionId = localStorage.getItem("rosie_session_id");
  if (!sessionId) {
    sessionId =
      "session_" +
      Date.now() +
      "_" +
      Math.random().toString(36).substring(2, 9);
    localStorage.setItem("rosie_session_id", sessionId);
  }
  return sessionId;
}

export function AppProvider({ children }) {
  const [sessionId] = useState(getSessionId);
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCovertMode, setIsCovertMode] = useState(false);
  const { user } = useAuth();

  // Fetch past entries from MongoDB when the user is authenticated
  const loadEntries = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchEntries();
      if (data.success && data.entries) {
        // Map MongoDB entries to frontend shape
        const mapped = data.entries.map((e) => ({
          content: e.content,
          analysis: e.analysis,
          mood: e.mood || null,
          timestamp: e.createdAt,
          _id: e._id,
        }));
        setEntries(mapped);
      }
    } catch (err) {
      console.error("Failed to load past entries:", err);
    }
  }, [user]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Add a new analyzed entry to the local state (prepend)
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
    loadEntries,
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
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

