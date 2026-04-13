import React, { useState, useEffect } from "react";
import NowPoster from "./components/posters/NowPoster.jsx";
import FeaturedPoster from "./components/posters/FeaturedPoster.jsx";
import CaptionMaker from "./components/posters/CaptionMaker.jsx";
import BilaoPoster from "./components/posters/BilaoPoster.jsx";
import CommunityPoster from "./components/posters/CommunityPoster.jsx";
import { fetchProducts } from "./api/products";

export default function App() {
  const [groups, setGroups] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posterType, setPosterType] = useState("now");
  const [community, setCommunity] = useState(null);

  // ✅ 1. Load Community Data
  useEffect(() => {
    const loadCommunity = async () => {
      const isDev = process.env.NODE_ENV === 'development';
      const communityId = isDev ? 2 : 1;
      
      const API_BASE = isDev 
        ? "http://127.0.0.1:3000/api/v1" 
        : "https://mb-menu-poster.netlify.app/api/v1";
      
      try {
        const response = await fetch(`${API_BASE}/communities/${communityId}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error(`Server status: ${response.status}`);
        
        const data = await response.json();
        setCommunity(data);
      } catch (err) {
        console.error("Error fetching community:", err);
      }
    };
    loadCommunity();
  }, []);

  // ✅ 2. Load Shop Products
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

  // ✅ 3. Data Filtering & Logic
  const nowGroupProducts = groups.find((g) => g.name === "Now")?.products || [];

  const allProductsMap = {};
  groups.forEach(group => {
    if (group.name.toLowerCase() !== "preorder") {
      group.products.forEach(product => {
        allProductsMap[product.id] = product;
      });
    }
  });
  const allUniqueProducts = Object.values(allProductsMap);

  const getTabStyle = (type) => ({
    padding: "10px 15px",
    cursor: "pointer",
    backgroundColor: posterType === type ? "#000" : "#fff",
    color: posterType === type ? "#fff" : "#000",
    border: "1px solid #000",
    borderRadius: "4px",
    fontSize: "12px",
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
        <button onClick={() => setPosterType("now")} style={getTabStyle("now")}>
          Now Poster
        </button>
        <button onClick={() => setPosterType("community")} style={getTabStyle("community")}>
          Community Poster
        </button>
        <button onClick={() => setPosterType("bilao")} style={getTabStyle("bilao")}>
          Bilao Poster
        </button>
        <button onClick={() => setPosterType("featured")} style={getTabStyle("featured")}>
          Featured Poster
        </button>
        <button onClick={() => setPosterType("caption")} style={getTabStyle("caption")}>
          Caption Maker
        </button>
      </div>

      {/* --- Main View --- */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        {posterType === "now" && (
          <NowPoster products={nowGroupProducts} shop={shop} />
        )}

        {posterType === "bilao" && (
          <BilaoPoster products={nowGroupProducts} shop={shop} />
        )}

        {posterType === "featured" && (
          <FeaturedPoster products={allUniqueProducts} shop={shop} />
        )}

        {posterType === "caption" && (
          <CaptionMaker shop={shop} />
        )}

        {posterType === "community" && (
          <CommunityPoster community={community} />
        )}
      </div>
    </div>
  );
}
