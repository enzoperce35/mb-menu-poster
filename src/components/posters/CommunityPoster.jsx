import React, { useState, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import InitialsLogo from "../../utils/InitialsLogo";
import "./CommunityPoster.css";

export default function CommunityPoster({ community }) {
  const [isCapturing, setIsCapturing] = useState(false);
  const posterRef = useRef();

  const featuredProducts = useMemo(() => {
    if (!community?.shops) return [];
    
    // 1. Group products by shop first
    const shopBuckets = community.shops.map(shop => {
      const validProducts = (shop.products || [])
        .filter(p => {
          const isFeatured = p.featured === true;
          const hasImage = p.image_url && p.image_url.trim() !== "";
          const hasVariants = p.variants && p.variants.length > 0;
          const isActive = hasVariants 
            ? p.variants.some(v => v.active === true)
            : p.product_delivery_groups?.some(dg => dg.active === true);
          
          return isFeatured && hasImage && isActive;
        })
        .map(p => ({
          ...p,
          shopName: shop.name,
          shopLogo: shop.image_url
        }));

      // Shuffle individual shop products so their "first" item isn't always the same one
      return validProducts.sort(() => Math.random() - 0.5);
    });

    // 2. Round Robin selection (Ensures all shops get 1 entry, then 2, etc.)
    const combined = [];
    let hasMore = true;
    let layer = 0;

    while (hasMore && combined.length < 20) {
      hasMore = false;
      for (const bucket of shopBuckets) {
        if (bucket[layer] && combined.length < 20) {
          combined.push(bucket[layer]);
          hasMore = true;
        }
      }
      layer++;
    }

    // 3. Final shuffle of the 20 items so they are mixed on the poster
    return combined.sort(() => Math.random() - 0.5);
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
        link.download = `Community_Favorites_${community?.name}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (error) {
        console.error("Download failed:", error);
      } finally {
        setIsCapturing(false);
      }
    }, 150);
  };

  if (!community) return <div className="cp-loading">Loading Community Favorites...</div>;

  return (
    <div className="cp-page-container">
      <div className="cp-scale-wrapper">
        <div ref={posterRef} className={`cp-capture-area ${isCapturing ? "cp-capturing" : ""}`}>
          <div className="cp-internal-frame">
            
            <header className="cp-header">
              <p className="cp-area-tag">{community.area}</p>
              <h1 className="cp-main-title">Community Favorites</h1>
              <div className="cp-divider"></div>
            </header>

            <div className="cp-masonry-grid">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((p) => (
                  <div key={p.id} className="cp-collage-item">
                    <img src={p.image_url} alt={p.name} className="cp-item-image" />

                    <div className="cp-shop-badge">
                      {p.shopLogo ? (
                        <img src={p.shopLogo} alt={p.shopName} className="cp-badge-img" />
                      ) : (
                        <InitialsLogo name={p.shopName} size={30} />
                      )}
                    </div>

                    <div className="cp-price-tag">
                      <span>₱{p.price}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="cp-no-data">No featured items available.</p>
              )}
            </div>

            <footer className="cp-footer">
               <div className="cp-link-box">
                  <p className="cp-order-text">Order na po kayo!</p>
                  <code className="cp-app-url">
                    📲 Click nyo lang po  ang link sa caption
                  </code>
               </div>
            </footer>
          </div>
        </div>
      </div>

      <button onClick={handleDownload} className="cp-download-btn">
        Download Artistic Poster
      </button>
    </div>
  );
}
