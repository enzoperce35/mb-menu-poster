import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import "./NowPoster.css"; // Reusing your existing CSS for consistency

export default function BilaoPoster({ shop }) {
  const [selectedProducts, setSelectedProducts] = useState({});
  const [isCapturing, setIsCapturing] = useState(false);
  const posterRef = useRef();

  // Hard-coded Static Data for Bilao
  const bilaoItems = [
    { id: 'b1', name: "Palabok", variants: [
      { id: 'v1', name: "Medium (10 pax)", price: "500" },
      { id: 'v2', name: "Large (15 pax)", price: "700" },
      { id: 'v3', name: "XL (20 pax)", price: "850" }
    ]},
    { id: 'b2', name: "Carbonara", variants: [
      { id: 'v4', name: "Medium (10 pax)", price: "550" },
      { id: 'v5', name: "Large (15 pax)", price: "750" },
      { id: 'v6', name: "XL (20 pax)", price: "950" }
    ]},
    { id: 'b3', name: "Spaghetti", variants: [
      { id: 'v7', name: "Medium (10 pax)", price: "550" },
      { id: 'v8', name: "Large (15 pax)", price: "750" },
      { id: 'v9', name: "XL (20 pax)", price: "950" }
    ]},
    { id: 'b4', name: "Pansit Bihon", variants: [
      { id: 'v10', name: "Medium (10 pax)", price: "600" },
      { id: 'v11', name: "Large (15 pax)", price: "850" },
      { id: 'v12', name: "XL (20 pax)", price: "1050" }
    ]},
    { id: 'b5', name: "Puto", variants: [
      { id: 'v13', name: "Small 25pcs (10-12 pax)", price: "200" },
      { id: 'v14', name: "Medium 40pcs (20-25 pax)", price: "300" },
      { id: 'v15', name: "Large 50pcs (25-30 pax)", price: "370" },
      { id: 'v16', name: "XL 75pcs (30-40 pax)", price: "550" }
    ]},
    { id: 'b6', name: "Chicken Fillet", variants: [
      { id: 'v17', name: "Small (5-7 pax)", price: "320" },
      { id: 'v18', name: "Medium (12-15 pax)", price: "610" },
      { id: 'v19', name: "Large (18-22 pax)", price: "900" },
      { id: 'v20', name: "XL (25-30 pax)", price: "1200" }
    ]},
    { id: 'b7', name: "Chicken Wings", variants: [
      { id: 'v21', name: "Medium 30pcs (7-10 pax)", price: "730" },
      { id: 'v22', name: "Large 40pcs (10-14 pax)", price: "900" },
      { id: 'v23', name: "XL 50pcs (13-18 pax)", price: "1100" }
    ]},
    { id: 'b8', name: "Siomai", variants: [
      { id: 'v24', name: "Small 30pcs (6-8 pax)", price: "250" },
      { id: 'v25', name: "Medium 50pcs (10-12 pax)", price: "400" },
      { id: 'v26', name: "Large 75pcs (15-18 pax)", price: "600" },
      { id: 'v27', name: "XL 100pcs (20-25 pax)", price: "800" }
    ]},
    { id: 'b9', name: "Lumpiang Shanghai", variants: [
      { id: 'v28', name: "Medium 72pcs", price: "500" },
      { id: 'v29', name: "Large 108pcs", price: "750" },
      { id: 'v30', name: "XL 144pcs", price: "1000" },
    ]}
  ];

  useEffect(() => {
    const initSelection = {};
    bilaoItems.forEach((p) => {
      initSelection[p.id] = { selected: true };
    });
    setSelectedProducts(initSelection);
  }, []);

  const toggleProduct = (productId) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], selected: !prev[productId]?.selected },
    }));
  };

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setIsCapturing(true);
    setTimeout(async () => {
      const canvas = await html2canvas(posterRef.current, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `PreOrder_Bilao_${new Date().toLocaleDateString()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setIsCapturing(false);
    }, 150);
  };

  return (
    <div className="poster-page-container">
      <div className="poster-scale-wrapper">
        <div ref={posterRef} className={`poster-capture-area ${isCapturing ? "capture-mode" : ""}`}>
          <div className="poster-internal-frame">
            <header className="poster-header">
              <h1 className="poster-title">Pre Order Bilao</h1>
              <div className="poster-divider"></div>
            </header>

            <div className="poster-content-list">
              {bilaoItems.map((p) => selectedProducts[p.id]?.selected && (
                <div key={p.id} className="product-item">
                  <div className="product-main-info">
                    <h3 className="product-name" style={{ color: '#d42121' }}>{p.name}</h3>
                  </div>
                  <div className="variant-list">
                    {p.variants.map((v) => (
                      <div key={v.id} className="variant-item">
                        <span>{v.name}</span>
                        <span style={{ fontWeight: 'bold' }}>₱{v.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
                  <p style={{ margin: 0, fontSize: "12px", textTransform: "uppercase", color: "#888" }}>Exclusively from</p>
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

      <div className="controls-container">
        <div className="controls-header">
          <h4 style={{ margin: 0 }}>Select Bilao Types</h4>
          <button onClick={handleDownload} className="download-btn">Download Poster</button>
        </div>
        <div className="checklist-grid">
          {bilaoItems.map((p) => (
            <label key={p.id} className={`checklist-item ${selectedProducts[p.id]?.selected ? "checked" : ""}`}>
              <input type="checkbox" hidden onChange={() => toggleProduct(p.id)} />
              <span className="item-text">{p.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
