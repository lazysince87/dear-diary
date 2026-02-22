import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { spotifyCallback } from "../services/api";

export default function SpotifyCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("Connecting to Spotify...");

    useEffect(() => {
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
            setStatus("Spotify connection was cancelled.");
            setTimeout(() => window.location.href = "/", 2000);
            return;
        }

        if (code) {
            spotifyCallback(code)
                .then(() => {
                    setStatus("Spotify connected! Redirecting...");
                    setTimeout(() => window.location.href = "/", 1500);
                })
                .catch((err) => {
                    console.error("Spotify callback error:", err);
                    setStatus("Failed to connect Spotify. Redirecting...");
                    setTimeout(() => window.location.href = "/", 2000);
                });
        } else {
            setStatus("No authorization code found.");
            setTimeout(() => window.location.href = "/", 2000);
        }
    }, [searchParams]);

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#1a0e12",
                fontFamily: "'Pixelify Sans', sans-serif",
                color: "#f2c4ce",
                fontSize: "14px",
                letterSpacing: "1px",
            }}
        >
            {status}
        </div>
    );
}
