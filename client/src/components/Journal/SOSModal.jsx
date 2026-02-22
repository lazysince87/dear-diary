import { useState, useEffect } from "react";
import { ShieldAlert, MapPin } from "lucide-react";
import { triggerEmergencySOS } from "../../services/api";
import { useApp } from "../../context/AppContext";

/**
 * SOSModal — urgent full-screen modal that appears when Gemini flags
 * requires_immediate_intervention. Asks the user if they are safe,
 * requests location permission, and sends a covert SOS text via Twilio.
 */
export default function SOSModal({ visible, entryContent, onClose }) {
    const { preferences } = useApp();
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState("idle"); // idle | requesting | granted | denied

    // Request location when modal becomes visible
    useEffect(() => {
        if (visible && locationStatus === "idle" && navigator.geolocation) {
            setLocationStatus("requesting");
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setLocationStatus("granted");
                },
                () => {
                    setLocationStatus("denied");
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    }, [visible]);

    const handleSOS = async () => {
        setSending(true);
        setError(null);
        try {
            await triggerEmergencySOS(
                preferences?.displayName || "",
                entryContent || "",
                location
            );
            setSent(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    if (!visible) return null;

    return (
        <>
            <style>{`
        .sos-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: sos-fade-in 0.25s ease;
        }

        @keyframes sos-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes sos-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201, 54, 90, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(201, 54, 90, 0); }
        }

        .sos-modal {
          background: #fff;
          border: 3px solid #c9365a;
          border-radius: 4px;
          max-width: 420px;
          width: 100%;
          padding: 32px 28px;
          text-align: center;
          animation: sos-pulse 2s infinite;
        }

        .sos-icon {
          color: #c9365a;
          margin-bottom: 12px;
        }

        .sos-title {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 20px;
          font-weight: 600;
          color: #c9365a;
          margin-bottom: 12px;
        }

        .sos-body {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 13px;
          color: #6b5454;
          line-height: 1.8;
          margin-bottom: 20px;
        }

        .sos-location {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 11px;
          color: #9a8282;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: 16px;
        }

        .sos-location-granted {
          color: #1DB954;
        }

        .sos-send-btn {
          width: 100%;
          padding: 14px;
          background: #c9365a;
          border: none;
          color: #fff;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          border-radius: 2px;
          cursor: pointer;
          transition: background 0.15s;
          margin-bottom: 12px;
        }

        .sos-send-btn:hover:not(:disabled) {
          background: #a82848;
        }

        .sos-send-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .sos-dismiss-btn {
          background: none;
          border: none;
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 11px;
          color: #c9b4b4;
          cursor: pointer;
          letter-spacing: 1px;
        }

        .sos-dismiss-btn:hover {
          color: #9a8282;
        }

        .sos-sent-msg {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 14px;
          color: #1DB954;
          font-weight: 600;
          margin-bottom: 16px;
          line-height: 1.6;
        }

        .sos-error {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 11px;
          color: #c9365a;
          margin-bottom: 12px;
        }
      `}</style>

            <div className="sos-overlay">
                <div className="sos-modal">
                    <ShieldAlert size={40} className="sos-icon" />

                    {sent ? (
                        <>
                            <div className="sos-title">Help is on the way.</div>
                            <div className="sos-sent-msg">
                                A message has been sent. You are not alone.
                                {location && (
                                    <><br />Your location was shared to help find you.</>
                                )}
                            </div>
                            <button className="sos-dismiss-btn" onClick={onClose}>
                                Close
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="sos-title">Are you safe right now?</div>
                            <div className="sos-body">
                                What you described sounds like you may be in danger.
                                I can silently text for help right now — no one will know it came from this app.
                            </div>

                            <div className={`sos-location ${locationStatus === "granted" ? "sos-location-granted" : ""}`}>
                                <MapPin size={14} />
                                {locationStatus === "requesting" && "Requesting your location..."}
                                {locationStatus === "granted" && "Location ready — will be shared with your SOS"}
                                {locationStatus === "denied" && "Location unavailable — SOS will still be sent"}
                                {locationStatus === "idle" && "Location not available"}
                            </div>

                            <button
                                className="sos-send-btn"
                                onClick={handleSOS}
                                disabled={sending}
                            >
                                {sending ? "Sending..." : "Yes, text for help now"}
                            </button>

                            {error && <div className="sos-error">{error}</div>}

                            <button className="sos-dismiss-btn" onClick={onClose}>
                                I'm okay, dismiss
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
