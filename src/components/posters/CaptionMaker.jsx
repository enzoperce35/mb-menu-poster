import React, { useState } from "react";
import "./CaptionMaker.css";

export default function CaptionMaker({ shop }) {
  const [copied, setCopied] = useState(false);
  const shopLink = `https://order-po.netlify.app/products?shop_id=${shop?.id || 1}`;
  // Your personal Messenger link
  const messengerLink = `https://m.me/mb.castro.779`;

  const getGreeting = () => {
    const hour = new Date().getHours();
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    if (hour < 12) return `Good morning! Happy ${day}.`;
    if (hour < 18) return `Happy ${day} afternoon!`;
    return `Have a great ${day} evening!`;
  };

  const greeting = getGreeting();

  const templates = [
    {
      id: "vibe",
      label: "Social Vibe",
      text: `${greeting} ✨\n\nOpen po kami today! Ang mga available po ngayon ay nasa image sa ibaba.\n\nMessage nyo lang po kami dito sa Messenger:\n📲 ${messengerLink}\n\nO gamitin ang aming app para sa list ng products:\n🛒 ${shopLink}\n\nThank You!`
    },
    {
      id: "direct",
      label: "Direct & Clean",
      text: `${greeting} ✨\n\nHello! Check nyo po ang mga available namin sa ibaba. Marami pa po kaming choice sa aming app!\n\nOrder here (Messenger):\n📲 ${messengerLink}\n\nView Menu (App):\n🛒 ${shopLink}\n\nThank You!`
    },
    {
      id: "minimal",
      label: "Short / Bio",
      text: `${greeting} ✨\n\nHi, order na po kayo!\n\nMessenger: ${messengerLink}\nApp: ${shopLink}\n\nThank You!`
    }
  ];

  const [activeTemplate, setActiveTemplate] = useState(templates[0]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeTemplate.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="caption-maker-container">
      <div className="caption-card">
        <div className="template-tabs">
          {templates.map(t => (
            <button 
              key={t.id} 
              className={activeTemplate.id === t.id ? "tab-active" : "tab-inactive"}
              onClick={() => setActiveTemplate(t)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="caption-textarea-wrapper">
          <textarea 
            readOnly 
            value={activeTemplate.text}
            spellCheck="false"
          />
        </div>

        <button 
          className={`copy-main-btn ${copied ? "is-copied" : ""}`} 
          onClick={copyToClipboard}
        >
          {copied ? "✓ Copied!" : "Copy Caption for FB"}
        </button>
      </div>
      
      <p className="caption-footer-hint">
        💡 FB Tip: Paste this into your post. Both links will become clickable automatically.
      </p>
    </div>
  );
}