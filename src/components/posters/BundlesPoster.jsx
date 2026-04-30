import React from "react";
import "./BundlesPoster.css";

// 1. Import your images at the top
import bundle1 from "../../assets/images/mb-bundles-poster.png";
import bundle2 from "../../assets/images/mb-bundles-poster2.png";

// 2. Reference the imported variables in your array
const BUNDLE_IMAGES = [
  { id: 1, name: "Family Feast Bundle", src: bundle1 },
  { id: 2, name: "Barkada Treat", src: bundle2 },
];

export default function BundlesPoster() {
  const downloadImage = (src, name) => {
    const link = document.createElement("a");
    link.href = src;
    link.download = `${name.replace(/\s+/g, "_")}_Poster.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bundles-page-container">
      <div className="bundles-header">
        <h2>Available Bundles</h2>
      </div>

      <div className="bundles-grid">
        {BUNDLE_IMAGES.map((bundle) => (
          <div key={bundle.id} className="bundle-card">
            <div className="bundle-image-wrapper">
              <img src={bundle.src} alt={bundle.name} className="bundle-image" />
            </div>
            <div className="bundle-info">
              <h4 className="bundle-name">{bundle.name}</h4>
              <button 
                className="bundle-download-btn"
                onClick={() => downloadImage(bundle.src, bundle.name)}
              >
                Download Poster
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
