import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import "./OrderSlip.css";

export default function OrderSlip({ products = [], shop }) {
  const slipRef = useRef();
  const [reference, setReference] = useState("Juan Dela Cruz");

  // Flatten all variants from products into an array of items for keying
  const allVariants = products.flatMap((p) =>
    (p.variants || []).map((v) => ({
      variantId: v.id,
      productId: p.id,
      productName: p.name,
      variantName: v.name,
      displayName: `${p.name} (${v.name})`,
      price: v.price || p.price,
    }))
  );

  // Load initial variant selections from localStorage (default to all unchecked: false)
  const [selectedVariants, setSelectedVariants] = useState(() => {
    const saved = localStorage.getItem("orderslip_selected_variants");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load saved variant selections", e);
      }
    }
    return allVariants.reduce((obj, item) => {
      obj[item.variantId] = false; // Default to unchecked
      return obj;
    }, {});
  });

  // Persist selections across interactions
  useEffect(() => {
    localStorage.setItem(
      "orderslip_selected_variants",
      JSON.stringify(selectedVariants)
    );
  }, [selectedVariants]);

  const toggleVariant = (id) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDownload = async () => {
    if (!slipRef.current) return;
    const canvas = await html2canvas(slipRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });

    const link = document.createElement("a");
    link.download = `OrderSlip_${reference.replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const visibleVariants = allVariants.filter((v) => selectedVariants[v.variantId]);

  return (
    <div className="order-slip-page">
      {/* --- PREVIEW PANEL --- */}
      <div className="order-slip-preview">
        <div ref={slipRef} className="order-slip-paper">
          {/* Header */}
          <div className="slip-header">
            <h2 className="shop-title">{shop?.name || "Your Shop Name"}</h2>
            <div className="receipt-divider-dashed" />
          </div>

          {/* Reference Info */}
          <div className="slip-meta">
            <span className="label">Order Reference</span>
            <h3 className="reference-value">{reference || "—"}</h3>
          </div>

          <div className="receipt-divider" />

          {/* Product Checklist Section */}
          <div className="slip-products-section">
            <div className="products-header">
              <span className="label">Items Ordered</span>
              <span className="label-count">{visibleVariants.length} items</span>
            </div>

            {visibleVariants.length > 0 ? (
              <ul className="slip-products-list">
                {visibleVariants.map((item) => (
                  <li key={item.variantId} className="slip-product-item">
                    <span className="checkmark">✓</span>
                    <span className="product-name">{item.displayName}</span>
                    {item.price && (
                      <span className="product-price">
                        ${Number(item.price).toFixed(2)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-products-notice">No items selected.</p>
            )}
          </div>

          <div className="receipt-divider-dashed" />

          {/* Thank You & Review Call-to-Action */}
          <div className="slip-footer">
            <h4 className="greeting-title">Hello! Thank you for choosing us today. 🌟</h4>
            <p className="thank-you-text">
              Leave us a quick review and help our kitchen grow!
            </p>

            <div className="qr-box">
              <div className="qr-placeholder">
                <span>SCAN TO REVIEW</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTROLS PANEL --- */}
      <div className="order-slip-controls">
        <div className="controls-header">
          <h3>Slip Settings</h3>
          <p>Customize information and items before exporting.</p>
        </div>

        <div className="control-group">
          <label htmlFor="order-ref-input" className="control-label">
            Order Reference / Customer Name
          </label>
          <input
            id="order-ref-input"
            type="text"
            className="control-input"
            value={reference}
            placeholder="e.g. Juan Dela Cruz"
            onChange={(e) => setReference(e.target.value)}
          />
        </div>

        <div className="control-group">
          <label className="control-label">Select Variants</label>

          <div className="products-checklist">
            {products.map((p) => (
              <div key={p.id} className="product-group">
                <span className="product-group-title">{p.name}</span>
                {(p.variants || []).map((v) => (
                  <label key={v.id} className="checkbox-row variant-row">
                    <input
                      type="checkbox"
                      checked={!!selectedVariants[v.id]}
                      onChange={() => toggleVariant(v.id)}
                    />
                    <span className="checkbox-label">{v.name}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        <button className="download-button" onClick={handleDownload}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PNG
        </button>
      </div>
    </div>
  );
}
