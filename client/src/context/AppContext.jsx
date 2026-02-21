import { createContext, useContext, useState, useEffect, useCallback, useRef, useEffect } from "react";
import { fetchEntries, getPreferences, getSpotifyStatus, generateMusic } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { fetchEntries } from "../services/api";

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
  const [preferences, setPreferences] = useState(null);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCovertMode, setIsCovertMode] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchEntries();
        if (data && data.entries) {
          // Normalize entries if needed (timestamp vs createdAt)
          const normalized = data.entries.map(e => ({
            ...e,
            timestamp: e.timestamp || e.createdAt || e.created_at
          }));
          setEntries(normalized);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };
    loadHistory();
  }, []);
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [nowPlaying, setNowPlaying] = useState(null);
  const musicAudioRef = useRef(null);
  const spotifyTracksRef = useRef(null);
  const trackIndexRef = useRef(0);
  const { user } = useAuth();

  // Fetch user preferences on mount
  const loadPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(null);
      setPreferencesLoaded(true);
      return;
    }
    try {
      const data = await getPreferences();
      setPreferences(data.preferences || null);
    } catch (err) {
      console.error("Failed to load preferences:", err);
      setPreferences(null);
    } finally {
      setPreferencesLoaded(true);
    }
  }, [user]);

  // Fetch past entries from MongoDB when the user is authenticated
  const loadEntries = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchEntries();
      if (data.success && data.entries) {
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
    loadPreferences();
    loadEntries();
  }, [loadPreferences, loadEntries]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        musicAudioRef.current = null;
      }
    };
  }, []);

  const isMusicOnRef = useRef(false);

  const playSpotifyTrack = useCallback((tracks, index) => {
    if (!isMusicOnRef.current) return; // stopped — don't advance
    if (index >= tracks.length) index = 0;
    const track = tracks[index];
    trackIndexRef.current = index;
    setNowPlaying({ name: track.name, artist: track.artist });

    if (musicAudioRef.current) {
      musicAudioRef.current.onended = null;
      musicAudioRef.current.onerror = null;
      musicAudioRef.current.pause();
    }

    const audio = new Audio(track.previewUrl);
    audio.onended = () => {
      if (isMusicOnRef.current) playSpotifyTrack(tracks, index + 1);
    };
    audio.onerror = () => {
      if (!isMusicOnRef.current) return;
      if (index + 1 < tracks.length) playSpotifyTrack(tracks, index + 1);
      else { isMusicOnRef.current = false; setIsMusicOn(false); setNowPlaying(null); }
    };
    audio.play().catch(() => { isMusicOnRef.current = false; setIsMusicOn(false); setNowPlaying(null); });
    musicAudioRef.current = audio;
  }, []);

  const toggleMusic = useCallback(async () => {
    if (isMusicOn) {
      // Stop music
      isMusicOnRef.current = false;
      if (musicAudioRef.current) {
        musicAudioRef.current.onended = null;
        musicAudioRef.current.onerror = null;
        musicAudioRef.current.pause();
        musicAudioRef.current = null;
      }
      setIsMusicOn(false);
      setNowPlaying(null);
      return;
    }

    setIsMusicOn(true);
    isMusicOnRef.current = true;

    try {
      // Try Spotify tracks first
      if (!spotifyTracksRef.current) {
        try {
          const spotifyData = await getSpotifyStatus();
          if (spotifyData.musicTaste?.topTracks?.length > 0) {
            const withPreviews = spotifyData.musicTaste.topTracks.filter(t => t.previewUrl);
            if (withPreviews.length > 0) {
              spotifyTracksRef.current = [...withPreviews].sort(() => Math.random() - 0.5);
            }
          }
        } catch (_) {
          // No spotify — will fall back
        }
      }

      if (spotifyTracksRef.current && spotifyTracksRef.current.length > 0) {
        playSpotifyTrack(spotifyTracksRef.current, 0);
        return;
      }

      // Fallback: ElevenLabs ambient music
      setNowPlaying({ name: "Ambient Music", artist: "Generated" });
      const result = await generateMusic();
      if (result.audioUrl) {
        const audio = new Audio(result.audioUrl);
        audio.loop = true;
        audio.onerror = () => { setIsMusicOn(false); setNowPlaying(null); };
        audio.play().catch(() => { setIsMusicOn(false); setNowPlaying(null); });
        musicAudioRef.current = audio;
      } else {
        setIsMusicOn(false);
        setNowPlaying(null);
      }
    } catch {
      setIsMusicOn(false);
      setNowPlaying(null);
    }
  }, [isMusicOn, playSpotifyTrack]);

  const addEntry = (entry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  const toggleCovertMode = () => {
    setIsCovertMode((prev) => !prev);
  };

  const value = {
    sessionId,
    entries,
    setEntries,
    addEntry,
    loadEntries,
    preferences,
    preferencesLoaded,
    loadPreferences,
    isLoading,
    setIsLoading,
    isCovertMode,
    toggleCovertMode,
    isMusicOn,
    nowPlaying,
    toggleMusic,
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


