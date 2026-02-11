import React, { useState, useEffect } from "react";
import NowPoster from "./components/posters/NowPoster.jsx";
import ImagePoster from "./components/posters/ImagePoster.jsx";
import { fetchProducts } from "./api/products";

export default function App() {
  const [groups, setGroups] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posterType, setPosterType] = useState("now");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts(1);
        setGroups(data);
  
        // 1. Find the "Now" group
        const nowGroup = data.find((g) => g.name === "Now");
  
        // 2. Look deep inside the products to find the shop info
        if (nowGroup && nowGroup.products && nowGroup.products.length > 0) {
          // We take the shop info from the very first product in the list
          const shopInfo = nowGroup.products[0].shop; 
          
          if (shopInfo) {
            setShop(shopInfo);
            console.log("Success! Shop found:", shopInfo.name);
          } else {
            console.error("Shop object not found inside product. Check Rails 'includes'.");
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Loading menu...</div>;

  const nowGroup = groups.find((g) => g.name === "Now");

  return (
    <div style={{ padding: "20px", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button 
          onClick={() => setPosterType("now")}
          style={{ padding: "10px 20px", cursor: "pointer", border: posterType === "now" ? "2px solid #000" : "1px solid #ccc" }}
        >
          Now Poster
        </button>
        <button 
          onClick={() => setPosterType("image")}
          style={{ padding: "10px 20px", cursor: "pointer", border: posterType === "image" ? "2px solid #000" : "1px solid #ccc" }}
        >
          Image Poster
        </button>
      </div>

      {posterType === "now" ? (
        <NowPoster 
            products={nowGroup?.products || []} 
            shop={shop} 
        />
      ) : (
        <ImagePoster products={nowGroup?.products || []} />
      )}
    </div>
  );
}
