import React, { useState, useRef, useMemo, useEffect } from "react";
import html2canvas from "html2canvas";
import InitialsLogo from "../../utils/InitialsLogo";
import "./CommunityPoster.css";

export default function CommunityPoster({ community }) {
  const [isCapturing, setIsCapturing] = useState(false);
  const posterRef = useRef();

  // 1. FILTER LOGIC: Now correctly passing the logo/name to the item
  const featuredProducts = useMemo(() => {
    if (!community?.shops) return [];
    
    const allFeatured = [];
    community.shops.forEach(shop => {
      if (shop.products) {
        shop.products.forEach(p => {
          const isFeatured = p.featured === true;
          const hasImage = p.image_url && p.image_url.trim() !== "";

          let isActive = false;
          const hasVariants = p.variants && p.variants.length > 0;

          if (hasVariants) {
            isActive = p.variants.some(v => v.active === true);
          } else {
            isActive = p.product_delivery_groups?.some(dg => dg.active === true);
          }

          if (isFeatured && hasImage && isActive) {
            allFeatured.push({ 
              ...p, 
              shopName: shop.name,
              shopLogo: shop.image_url // ✅ FIX: Added this so production sees the logo
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
      try {
        const canvas = await html2canvas(posterRef.current, { 
          scale: 4, 
          useCORS: true,
          backgroundColor: "#ffffff"
        });
        const link = document.createElement("a");
        link.download = `Artistic_Community_${community?.name}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (error) {
        console.error("Download failed:", error);
      } finally {
        setIsCapturing(false);
      }
    }, 150);
  };

  if (!community) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
        Loading Community Favorites...
      </div>
    );
  }

  return (
    <div className="poster-page-container">
      <div className="poster-scale-wrapper">
        <div ref={posterRef} className={`poster-capture-area ${isCapturing ? "capture-mode" : ""}`}>
          <div className="poster-internal-frame" style={{ border: 'none', background: '#fff' }}>
            
            <header className="poster-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px', color: '#d4af37', margin: 0 }}>
                {community.area}
              </p>
              <h1 style={{ fontFamily: 'serif', fontSize: '32px', margin: '5px 0', color: '#1a1a1a' }}>
                Community Favorites
              </h1>
              <div style={{ width: '40px', height: '2px', background: '#d4af37', margin: '10px auto' }}></div>
            </header>

            <div className="collage-masonry">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((p) => (
                  <div key={p.id} className="collage-item">
                    <img 
                      src={p.image_url} 
                      alt={p.name}
                      className="collage-image"
                    />

                    {/* ✅ SHOP BADGE: Fallback now works because p.shopLogo is defined */}
                    <div className="shop-badge-overlay" style={{ position: 'absolute', top: '6px', left: '6px', zIndex: 10 }}>
                      {p.shopLogo ? (
                        <img 
                          src={p.shopLogo} 
                          alt={p.shopName} 
                          style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid white' }} 
                        />
                      ) : (
                        <InitialsLogo name={p.shopName} size={24} />
                      )}
                    </div>

                    <div className="collage-overlay">
                      <span className="collage-price">₱{p.price}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#999', padding: '40px', width: '100%' }}>
                  No featured items available in this community.
                </p>
              )}
            </div>

            <footer className="poster-footer" style={{ marginTop: '30px', textAlign: 'center' }}>
               <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '12px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 5px 0' }}>📲 Order po kayo dito:</p>
                  <code style={{ color: '#d4af37', fontSize: '11px' }}>
                    order-po.netlify.app/?community={community.id}
                  </code>
               </div>
            </footer>
          </div>
        </div>
      </div>

      <button onClick={handleDownload} className="download-btn">
        Download Artistic Poster
      </button>
    </div>
  );
}
