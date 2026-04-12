import React, { useState, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import "./NowPoster.css"; 

export default function CommunityPoster({ community }) {
  const [isCapturing, setIsCapturing] = useState(false);
  const posterRef = useRef();

  // Fallback image URL (A clean, neutral food placeholder)
  const FALLBACK_IMAGE = "https://via.placeholder.com/300x300?text=Delicious+Food";

  const featuredProducts = useMemo(() => {
    if (!community?.shops) return [];
    
    const allFeatured = [];
    community.shops.forEach(shop => {
      if (shop.products) {
        shop.products.forEach(p => {
          // 1. Basic Requirements
          const isFeatured = p.featured === true;
          const hasImage = p.image_url && p.image_url.trim() !== "";

          // 2. Conditional Active Logic
          let isActive = false;
          const hasVariants = p.variants && p.variants.length > 0;

          if (hasVariants) {
            // If it has variants, at least one must be checked (active)
            isActive = p.variants.some(v => v.active === true);
          } else {
            // If no variants, at least one delivery group must be checked (active)
            isActive = p.product_delivery_groups?.some(dg => dg.active === true);
          }

          if (isFeatured && hasImage && isActive) {
            allFeatured.push({ 
              ...p, 
              shopName: shop.name 
            });
          }
        });
      }
    });
    return allFeatured;
  }, [community]);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setIsCapturing(true);
    setTimeout(async () => {
      const canvas = await html2canvas(posterRef.current, { 
        scale: 3, 
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff"
      });
      const link = document.createElement("a");
      link.download = `Community_Featured_${community?.name}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setIsCapturing(false);
    }, 150);
  };

  if (!community) return <div style={{ padding: "20px", textAlign: "center" }}>Loading Community Favorites...</div>;

  return (
    <div className="poster-page-container">
      <div className="poster-scale-wrapper">
        <div ref={posterRef} className={`poster-capture-area ${isCapturing ? "capture-mode" : ""}`}>
          <div className="poster-internal-frame" style={{ borderColor: '#d4af37' }}>
            <header className="poster-header">
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, color: '#d4af37' }}>{community.area}</p>
              <h1 className="poster-title" style={{ color: '#d4af37', fontSize: '28px' }}>Community Favorites</h1>
              <div className="poster-divider" style={{ backgroundColor: '#d4af37' }}></div>
            </header>

            <div className="poster-content-list">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((p) => (
                  <div key={p.id} className="product-item" style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center' }}>
                    {/* Image Area with Fallback Logic */}
                    <div className="product-image-wrapper" style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                      <img 
                        src={p.image_url || FALLBACK_IMAGE} 
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>

                    <div className="product-main-info" style={{ flexGrow: 1 }}>
                      <h3 className="product-name" style={{ margin: 0, fontSize: '18px' }}>{p.name}</h3>
                      <p style={{ margin: 0, fontSize: '12px', color: '#d4af37', fontWeight: 'bold' }}>{p.shopName}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: '800' }}>₱{p.price}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>No featured items today.</p>
              )}
            </div>

            <footer className="poster-footer" style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <div className="app-link-box" style={{ background: '#fff9e6', border: '1px dashed #d4af37' }}>
                <div className="instruction-steps">
                  <span>📲 Use App</span>
                  <span className="step-arrow">→</span>
                  <span>🛵 Delivered</span>
                  <span className="step-arrow">→</span>
                  <span>😋 Enjoy!</span>
                </div>
                <code style={{ fontSize: '10px', marginTop: '8px', display: 'block', color: '#666' }}>
                  order-po.netlify.app/?community={community.id}
                </code>
              </div>
            </footer>
          </div>
        </div>
      </div>

      <button onClick={handleDownload} className="download-btn" style={{ marginTop: '20px', backgroundColor: '#d4af37' }}>
        Download Community Poster
      </button>
    </div>
  );
}
