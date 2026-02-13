import React, { useState, useEffect, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import "./FeaturedPoster.css";

export default function FeaturedPoster({ products = [], shop }) {
  const [selectedProducts, setSelectedProducts] = useState({});
  const posterRef = useRef();

  // ✅ Only products that:
  // 1. Have an image
  // 2. Have stock > 0
  const imageProducts = useMemo(() => {
    return products.filter(
      (p) => p.image_url && Number(p.stock) > 0
    );
  }, [products]);

  // ✅ Load selection
  useEffect(() => {
    const saved = localStorage.getItem(
      `featured-selection-${shop?.id || "default"}`
    );

    const init = {};

    if (saved) {
      const parsed = JSON.parse(saved);

      // Keep only products still valid
      imageProducts.forEach((p) => {
        init[p.id] = parsed[p.id] ?? true;
      });
    } else {
      imageProducts.forEach((p) => {
        init[p.id] = true;
      });
    }

    setSelectedProducts(init);
  }, [imageProducts, shop?.id]);

  // ✅ Save selection
  useEffect(() => {
    if (Object.keys(selectedProducts).length > 0) {
      localStorage.setItem(
        `featured-selection-${shop?.id || "default"}`,
        JSON.stringify(selectedProducts)
      );
    }
  }, [selectedProducts, shop?.id]);

  const toggleProduct = (id) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDownload = async () => {
    if (!posterRef.current) return;

    const element = posterRef.current;
    const originalWidth = element.style.width;

    // Force width for high-quality capture
    element.style.width = "500px";

    try {
      const canvas = await html2canvas(element, {
        scale: 4,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `Artistic_Featured_Poster.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed", err);
    }

    element.style.width = originalWidth;
  };

  if (!imageProducts.length) {
    return (
      <div className="featured-page-container">
        No featured products available.
      </div>
    );
  }

  return (
    <div className="featured-page-container">
      
      {/* --- Poster Preview --- */}
      <div ref={posterRef} className="featured-capture-area">
        <div className="collage-masonry">
          {imageProducts.map(
            (p) =>
              selectedProducts[p.id] && (
                <div key={p.id} className="collage-item">
                  <img
                    src={p.image_url}
                    className="collage-image"
                    crossOrigin="anonymous"
                    alt={p.name}
                  />
                </div>
              )
          )}
        </div>
      </div>

      {/* --- Controls --- */}
      <div className="controls-container">
        <div
          className="controls-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h4 style={{ margin: 0 }}>Select Gallery Items</h4>
          <button
            onClick={handleDownload}
            className="download-btn"
          >
            Download Image
          </button>
        </div>

        <div className="checklist-grid">
          {imageProducts.map((p) => (
            <label
              key={p.id}
              className={`checklist-item ${
                selectedProducts[p.id] ? "checked" : ""
              }`}
            >
              <input
                type="checkbox"
                hidden
                checked={!!selectedProducts[p.id]}
                onChange={() => toggleProduct(p.id)}
              />
              <span className="item-text">{p.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
