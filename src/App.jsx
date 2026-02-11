import React, { useState, useEffect } from "react";
import NowPoster from "./components/posters/NowPoster.jsx";
import FeaturedPoster from "./components/posters/FeaturedPoster.jsx";
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
  
        // Find shop info from the first available product in any group
        const firstGroupWithProducts = data.find(g => g.products && g.products.length > 0);
        if (firstGroupWithProducts) {
          setShop(firstGroupWithProducts.products[0].shop);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading menu...</div>;

  // 1. Data for NowPoster: Only products from the "Now" group
  const nowGroupProducts = groups.find((g) => g.name === "Now")?.products || [];

  // 2. Data for FeaturedPoster: ALL products from ALL groups, duplicates removed
  const allProductsMap = {};
  groups.forEach(group => {
    group.products.forEach(product => {
      allProductsMap[product.id] = product;
    });
  });
  const allUniqueProducts = Object.values(allProductsMap);

  return (
    <div style={{ padding: "20px", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
        <button 
          onClick={() => setPosterType("now")}
          style={{ 
            padding: "10px 20px", cursor: "pointer", 
            backgroundColor: posterType === "now" ? "#000" : "#fff",
            color: posterType === "now" ? "#fff" : "#000",
            border: "1px solid #000", borderRadius: "4px"
          }}
        >
          Menu (Now Group Only)
        </button>
        <button 
          onClick={() => setPosterType("featured")}
          style={{ 
            padding: "10px 20px", cursor: "pointer", 
            backgroundColor: posterType === "featured" ? "#000" : "#fff",
            color: posterType === "featured" ? "#fff" : "#000",
            border: "1px solid #000", borderRadius: "4px"
          }}
        >
          Featured (All Products)
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        {posterType === "now" ? (
          <NowPoster products={nowGroupProducts} shop={shop} />
        ) : (
          <FeaturedPoster products={allUniqueProducts} shop={shop} />
        )}
      </div>
    </div>
  );
}