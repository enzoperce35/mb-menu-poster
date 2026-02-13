import React, { useState, useEffect, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import "./NowPoster.css";

export default function NowPoster({ products = [], shop }) {
  const [selectedProducts, setSelectedProducts] = useState({});
  const [isCapturing, setIsCapturing] = useState(false);
  const posterRef = useRef();

  // ✅ Only include products with stock > 0
  const availableProducts = useMemo(() => {
    return products.filter((p) => Number(p.stock) > 0);
  }, [products]);

  // ✅ Load selection from localStorage
  useEffect(() => {
    const savedSelection = localStorage.getItem(
      `now-poster-selection-${shop?.id || "default"}`
    );

    const initSelection = {};

    if (savedSelection) {
      const parsed = JSON.parse(savedSelection);

      // Only keep products that are still available
      availableProducts.forEach((p) => {
        initSelection[p.id] = {
          selected: parsed[p.id]?.selected ?? true,
        };
      });
    } else {
      availableProducts.forEach((p) => {
        initSelection[p.id] = { selected: true };
      });
    }

    setSelectedProducts(initSelection);
  }, [availableProducts, shop?.id]);

  // ✅ Save selection
  useEffect(() => {
    if (Object.keys(selectedProducts).length > 0) {
      localStorage.setItem(
        `now-poster-selection-${shop?.id || "default"}`,
        JSON.stringify(selectedProducts)
      );
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

    setIsCapturing(true);

    setTimeout(async () => {
      try {
        const canvas = await html2canvas(posterRef.current, {
          scale: 3,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        const link = document.createElement("a");
        link.download = `Menu_Now_${shop?.name || "Poster"}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (error) {
        console.error("Download failed", error);
      } finally {
        setIsCapturing(false);
      }
    }, 150);
  };

  if (!availableProducts.length) {
    return (
      <div className="poster-page-container">
        No products available.
      </div>
    );
  }

  return (
    <div className="poster-page-container">

      {/* --- Poster Preview Section --- */}
      <div className="poster-scale-wrapper">
        <div
          ref={posterRef}
          className={`poster-capture-area ${isCapturing ? "capture-mode" : ""}`}
        >
          <div className="poster-internal-frame">
            <header className="poster-header">
              <h1 className="poster-title">Available Now</h1>
              <div className="poster-divider"></div>
            </header>

            <div className="poster-content-list">
              {availableProducts.map((p) =>
                selectedProducts[p.id]?.selected ? (
                  <div key={p.id} className="product-item">
                    <div className="product-main-info">
                      <h3 className="product-name">{p.name}</h3>

                      {(!p.variants || p.variants.length === 0) && (
                        <span className="product-price">₱{p.price}</span>
                      )}
                    </div>

                    {p.description && (
                      <p className="product-description">{p.description}</p>
                    )}

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
                  <img
                    src={shop.image_url}
                    alt="Logo"
                    className="shop-logo"
                    crossOrigin="anonymous"
                  />
                )}
                <div className="footer-shop-info">
                  <h2 className="footer-shop-name">
                    {shop?.name || "Our Shop"}
                  </h2>
                  <p className="footer-disclaimer">
                    "for more products and advanced orders, please check our app from the link above"
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* --- Controls Section --- */}
      <div className="controls-container">
        <div className="controls-header">
          <h4 style={{ margin: 0 }}>Select Items</h4>
          <button onClick={handleDownload} className="download-btn">
            Download PNG
          </button>
        </div>

        <div className="checklist-sections">
          <div className="checklist-group">
            <p className="group-label">Included</p>
            <div className="checklist-grid">
              {availableProducts
                .filter((p) => selectedProducts[p.id]?.selected)
                .map((p) => (
                  <label key={p.id} className="checklist-item checked">
                    <input
                      type="checkbox"
                      hidden
                      onChange={() => toggleProduct(p.id)}
                    />
                    <span className="item-text">{p.name}</span>
                  </label>
                ))}
            </div>
          </div>

          <div
            className="checklist-group"
            style={{ marginTop: "20px" }}
          >
            <p className="group-label">Excluded</p>
            <div className="checklist-grid">
              {availableProducts
                .filter((p) => !selectedProducts[p.id]?.selected)
                .map((p) => (
                  <label key={p.id} className="checklist-item">
                    <input
                      type="checkbox"
                      hidden
                      onChange={() => toggleProduct(p.id)}
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
