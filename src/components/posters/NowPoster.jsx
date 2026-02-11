import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import "./NowPoster.css"; // Import the new CSS file

export default function NowPoster({ products = [], shop }) {
  const [selectedProducts, setSelectedProducts] = useState({});
  const posterRef = useRef();

  useEffect(() => {
    const savedSelection = localStorage.getItem(`poster-selection-${shop?.id || 'default'}`);

    if (savedSelection) {
      setSelectedProducts(JSON.parse(savedSelection));
    } else {
      const initSelection = {};
      products.forEach((p) => {
        const variantMap = {};
        p.variants?.forEach((v) => { variantMap[v.id] = true; });
        initSelection[p.id] = { selected: true, variants: variantMap };
      });
      setSelectedProducts(initSelection);
    }
  }, [products, shop?.id]);

  useEffect(() => {
    if (Object.keys(selectedProducts).length > 0) {
      localStorage.setItem(`poster-selection-${shop?.id || 'default'}`, JSON.stringify(selectedProducts));
    }
  }, [selectedProducts, shop?.id]);

  const toggleProduct = (productId) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        selected: !prev[productId]?.selected,
      },
    }));
  };

  const handleDownload = async () => {
    if (!posterRef.current) return;

    const element = posterRef.current;

    // 1. Store original styles to restore them later
    const originalWidth = element.style.width;
    const originalTransform = element.style.transform;

    // 2. FORCE fixed dimensions for the capture
    // This ensures the canvas is always 500px wide, even on a 375px phone screen
    element.style.width = "500px";
    element.style.transform = "none";

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Keeps it high-res for Facebook (1000px wide total)
        useCORS: true,
        backgroundColor: "#ffffff",
        // windowWidth ensures html2canvas "sees" the full width even if off-screen
        windowWidth: 500
      });

      const link = document.createElement("a");
      link.download = `Available_Now_Poster.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      // 3. Restore original styles so the UI looks right on the mobile screen again
      element.style.width = originalWidth;
      element.style.transform = originalTransform;
    }
  };

  if (!products.length) return <div className="poster-page-container">No products available.</div>;

  return (
    <div className="poster-page-container">

      {/* --- Poster Preview --- */}
      <div ref={posterRef} className="poster-capture-area">
        <header className="poster-header">
          <h1 className="poster-title">Available Now</h1>
          <div className="poster-divider"></div>
        </header>

        <div style={{ minHeight: "300px" }}>
          {products.map((p) =>
            selectedProducts[p.id]?.selected ? (
              <div key={p.id} className="product-item">
                <div className="product-main-info">
                  <h3 className="product-name">{p.name}</h3>
                  {/* Price hidden if variants exist */}
                  {(!p.variants || p.variants.length === 0) && (
                    <span className="product-price">₱{p.price}</span>
                  )}
                </div>

                {p.description && <p className="product-description">{p.description}</p>}

                {p.variants?.length > 0 && (
                  <div className="variant-list">
                    {p.variants.map((v) => (
                      <div key={v.id} className="variant-item">
                        <span>{v.name}</span>
                        <span>₱{v.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null
          )}
        </div>

        <footer className="poster-footer">
          <div className="footer-content">
            {shop?.image_url && (
              <img src={shop.image_url} alt="Logo" className="shop-logo" crossOrigin="anonymous" />
            )}
            <div>
              <p style={{ margin: 0, fontSize: "12px", textTransform: "uppercase", color: "#888" }}>Exclusively from</p>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>{shop?.name || "Our Shop"}</h2>
              <p className="footer-disclaimer">
                "for more products and advanced orders, please check our app from the link above"
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* --- Controls Section --- */}
      {/* --- Controls Section --- */}
      <div className="controls-container">
        <div className="controls-header">
          <h4 style={{ margin: 0 }}>Checklist</h4>
          <button onClick={handleDownload} className="download-btn">
            Download Poster
          </button>
        </div>

        <div className="checklist-sections">
          {/* 1. Render Checked Items First */}
          <div className="checklist-group">
            <p className="group-label">Included in Poster</p>
            <div className="checklist-grid">
              {products
                .filter((p) => selectedProducts[p.id]?.selected)
                .map((p) => (
                  <label key={p.id} className="checklist-item checked">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => toggleProduct(p.id)}
                      style={{ marginRight: "10px" }}
                    />
                    <span className="item-text">{p.name}</span>
                  </label>
                ))}
            </div>
          </div>

          {/* 2. Render Unchecked Items Bottom */}
          <div className="checklist-group" style={{ marginTop: '20px' }}>
            <p className="group-label">Excluded</p>
            <div className="checklist-grid">
              {products
                .filter((p) => !selectedProducts[p.id]?.selected)
                .map((p) => (
                  <label key={p.id} className="checklist-item">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => toggleProduct(p.id)}
                      style={{ marginRight: "10px" }}
                    />
                    <span className="item-text">{p.name}</span>
                  </label>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}