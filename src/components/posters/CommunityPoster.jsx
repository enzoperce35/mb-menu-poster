import React, { useState, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import "./CommunityPoster.css"; // Ensure you add the masonry CSS below

export default function CommunityPoster({ community }) {
  const [isCapturing, setIsCapturing] = useState(false);
  const posterRef = useRef();

  // 1. FILTER LOGIC: Strict check for Featured, Image, and Active status
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
            allFeatured.push({ ...p, shopName: shop.name });
          }
        });
      }
    });
    return allFeatured;
  }, [community]);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setIsCapturing(true);
    
    // Slight delay to ensure capture-mode styles (like hiding buttons) apply
    setTimeout(async () => {
      const canvas = await html2canvas(posterRef.current, { 
        scale: 4, // High quality for Facebook
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      const link = document.createElement("a");
      link.download = `Artistic_Community_${community?.name}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setIsCapturing(false);
    }, 150);
  };

  if (!community) return <div style={{ padding: "40px", textAlign: "center" }}>Loading Community Favorites...</div>;

  return (
    <div className="poster-page-container">
      <div className="poster-scale-wrapper">
        <div ref={posterRef} className={`poster-capture-area ${isCapturing ? "capture-mode" : ""}`}>
          <div className="poster-internal-frame" style={{ border: 'none', background: '#fff' }}>
            
            <header className="poster-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px', color: '#d4af37' }}>
                {community.area}
              </p>
              <h1 style={{ fontFamily: 'serif', fontSize: '32px', margin: '5px 0', color: '#1a1a1a' }}>
                Community Favorites
              </h1>
              <div style={{ width: '40px', height: '2px', background: '#d4af37', margin: '10px auto' }}></div>
            </header>

            {/* --- Masonry Collage Layout --- */}
            <div className="collage-masonry">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((p) => (
                  <div key={p.id} className="collage-item">
                    <img 
                      src={p.image_url} 
                      alt={p.name}
                      className="collage-image"
                    />
                    <div className="collage-overlay">
                      <span className="collage-price">₱{p.price}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#999', padding: '40px' }}>
                  No featured items available.
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
