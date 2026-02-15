import React, { useState, useEffect } from "react";
import NowPoster from "./components/posters/NowPoster.jsx";
import FeaturedPoster from "./components/posters/FeaturedPoster.jsx";
import CaptionMaker from "./components/posters/CaptionMaker.jsx";
import ZenMenu from "./components/posters/ZenMenu.jsx"; // Import the new component
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

  // 1. Data for NowPoster
  const nowGroupProducts = groups.find((g) => g.name === "Now")?.products || [];

  // 2. Data for FeaturedPoster & CaptionMaker (All Products)
  const allProductsMap = {};
  groups.forEach(group => {
    group.products.forEach(product => {
      allProductsMap[product.id] = product;
    });
  });
  const allUniqueProducts = Object.values(allProductsMap);

  // 3. Filtered Data for ZenMenu (Active & In Stock only)
  const zenProducts = allUniqueProducts.filter(p => p.active && p.stock > 0);

  // Helper function for tab styling
  const getTabStyle = (type) => ({
    padding: "10px 15px",
    cursor: "pointer",
    backgroundColor: posterType === type ? "#000" : "#fff",
    color: posterType === type ? "#fff" : "#000",
    border: "1px solid #000",
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s ease"
  });

  return (
    <div style={{ padding: "20px", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>

      {/* --- Navigation Tabs --- */}
      <div style={{
        marginBottom: "25px",
        display: "flex",
        justifyContent: "center",
        gap: "8px",
        flexWrap: "wrap"
      }}>
        <button onClick={() => setPosterType("zen")} style={getTabStyle("zen")}>
          Zen Menu
        </button>
        <button onClick={() => setPosterType("now")} style={getTabStyle("now")}>
          Now Poster
        </button>
        <button onClick={() => setPosterType("featured")} style={getTabStyle("featured")}>
          Featured Poster
        </button>
        <button onClick={() => setPosterType("caption")} style={getTabStyle("caption")}>
          Caption Maker
        </button>
      </div>

      {/* --- Component Views --- */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        {posterType === "now" && (
          <NowPoster products={nowGroupProducts} shop={shop} />
        )}

        {posterType === "featured" && (
          <FeaturedPoster products={allUniqueProducts} shop={shop} />
        )}

        {posterType === "zen" && (
          <ZenMenu groups={groups} shop={shop} />
        )}

        {posterType === "caption" && (
          <CaptionMaker shop={shop} />
        )}
      </div>
    </div>
  );
}
