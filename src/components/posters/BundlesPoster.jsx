import React from "react";
import "./BundlesPoster.css";

// 1. Import your images at the top
import bundle1 from "../../assets/images/mb-bundles-poster.png";
import bundle2 from "../../assets/images/mb-bundles-poster2.png";
import catalog from "../../assets/images/mb-bundles-masonry.png"; 

// New Food Image Imports
import carbonara from "../../assets/images/carbonara.jpg";
import chickenWings from "../../assets/images/chicken wings.jpg";
import chickenFillet from "../../assets/images/chicken_fillet.jpg";
import palabok from "../../assets/images/palabok.jpg";
import pansitBihon from "../../assets/images/pansit-bihon.jpg";
import puto from "../../assets/images/puto.jpg";
import shanghai from "../../assets/images/shanghai.jpg";
import siomai from "../../assets/images/siomai.jpg";
import spaghetti from "../../assets/images/spaghetti.jpg";

// 2. Reference the imported variables in your array
const BUNDLE_IMAGES = [
  { id: 1, name: "Family Feast Bundle", src: bundle1 },
  //{ id: 2, name: "Barkada Treat", src: bundle2 },
  { id: 3, name: "Product Masonry", src: catalog },
  { id: 4, name: "Carbonara", src: carbonara },
  { id: 5, name: "Chicken Wings", src: chickenWings },
  { id: 6, name: "Chicken Fillet", src: chickenFillet },
  { id: 7, name: "Palabok", src: palabok },
  { id: 8, name: "Pansit Bihon", src: pansitBihon },
  { id: 9, name: "Puto", src: puto },
  { id: 10, name: "Shanghai", src: shanghai },
  { id: 11, name: "Siomai", src: siomai },
  { id: 12, name: "Spaghetti", src: spaghetti },
];

export default function BundlesPoster() {
  const downloadImage = async (src, name) => {
    try {
      // 1. Fetch the actual file data
      const response = await fetch(src);
      const blob = await response.blob();
      
      // 2. Create a local URL for the binary data
      const blobUrl = window.URL.createObjectURL(blob);
      
      // 3. Trigger the download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${name.replace(/\s+/g, "_")}_HighRes.jpg`;
      
      document.body.appendChild(link);
      link.click();
      
      // 4. Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("High-quality download failed:", error);
      
      // Fallback to basic download if fetch fails
      const link = document.createElement("a");
      link.href = src;
      link.download = `${name.replace(/\s+/g, "_")}_Poster.jpg`;
      link.click();
    }
  };

  return (
    <div className="bundles-page-container">
      <div className="bundles-header">
        <h2>Available Bundles & Products</h2>
      </div>

      <div className="bundles-grid">
        {BUNDLE_IMAGES.map((bundle) => (
          <div key={bundle.id} className="bundle-card">
            <div className="bundle-image-wrapper">
              <img 
                src={bundle.src} 
                alt={bundle.name} 
                className="bundle-image" 
                loading="lazy"
              />
            </div>
            <div className="bundle-info">
              <h4 className="bundle-name">{bundle.name}</h4>
              <button 
                className="bundle-download-btn"
                onClick={() => downloadImage(bundle.src, bundle.name)}
              >
                Download High-Res Poster
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}