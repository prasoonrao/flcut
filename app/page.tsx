"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortLink, setShortLink] = useState("");

  return (
    <div style={{ padding: "40px" }}>
      <h1>FLCut</h1>

      <p>Shorten links for FLC events.</p>

      <input
        type="text"
        placeholder="Paste your long URL here"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          marginRight: "10px",
        }}
      />

     <button
  onClick={async () => {
    const response = await fetch("/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        originalUrl: url,
      }),
    });

    const data = await response.json();

    setShortLink(`http://localhost:3000/${data.shortCode}`);
  }}
  style={{
    padding: "10px 20px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  }}
>
  Shorten
</button>

      <p>You typed: {url}</p>
      {shortLink && (
  <p>
    Your short link: {shortLink}
  </p>
)}
    </div>
  );
}