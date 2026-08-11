import React, { useState, useEffect } from "react";
import NowPoster from "./components/posters/NowPoster.jsx";
import FeaturedPoster from "./components/posters/FeaturedPoster.jsx";
import CaptionMaker from "./components/posters/CaptionMaker.jsx";
import BilaoPoster from "./components/posters/BilaoPoster.jsx";
import QRPoster from "./components/posters/QRPoster.jsx";
import BundlesPoster from "./components/posters/BundlesPoster.jsx";
import OrderSlip from "./components/posters/OrderSlip";
import { fetchProducts } from "./api/products";

export default function App() {
  const [groups, setGroups] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posterType, setPosterType] = useState("now");

  // Load Shop Products
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

  // --- Products Data Filtering ---
  
  // 1. Products in the "Now" delivery group
  const nowGroupProducts = groups.find((g) => g.name === "Now")?.products || [];

  // 2. All unique products EXCLUDING PreOrder (for FeaturedPoster, etc.)
  const regularProductsMap = {};
  groups.forEach(group => {
    if (group.name.toLowerCase() !== "preorder") {
      (group.products || []).forEach(product => {
        regularProductsMap[product.id] = product;
      });
    }
  });
  const regularUniqueProducts = Object.values(regularProductsMap);

  // 3. ALL unique products INCLUDING PreOrder (specifically for OrderSlip)
  const allProductsMap = {};
  groups.forEach(group => {
    (group.products || []).forEach(product => {
      // Attach/ensure delivery group info is present on the product
      const existingGroups = product.delivery_groups || product.deliveryGroups || [];
      const hasGroup = existingGroups.some(g => 
        (typeof g === "string" ? g : g?.name)?.toLowerCase() === group.name.toLowerCase()
      );

      const updatedGroups = hasGroup 
        ? existingGroups 
        : [...existingGroups, { name: group.name }];

      allProductsMap[product.id] = {
        ...product,
        delivery_groups: updatedGroups
      };
    });
  });
  const allUniqueProductsWithPreOrder = Object.values(allProductsMap);

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
        <button onClick={() => setPosterType("bilao")} style={getTabStyle("bilao")}>
          Bilao Poster
        </button>
        <button onClick={() => setPosterType("featured")} style={getTabStyle("featured")}>
          Featured Poster
        </button>
        <button onClick={() => setPosterType("bundles")} style={getTabStyle("bundles")}>
          Bundles Poster
        </button>
        <button onClick={() => setPosterType("qr")} style={getTabStyle("qr")}>
          QR Poster
        </button>
        <button onClick={() => setPosterType("caption")} style={getTabStyle("caption")}>
          Caption Maker
        </button>
        <button onClick={() => setPosterType("order-slip")} style={getTabStyle("order-slip")}>
          Order Slip
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
          <FeaturedPoster products={regularUniqueProducts} shop={shop} />
        )}

        {posterType === "bundles" && (
          <BundlesPoster />
        )}

        {posterType === "caption" && (
          <CaptionMaker shop={shop} />
        )}

        {posterType === "qr" && (
          <QRPoster />
        )}

        {posterType === "order-slip" && (
          <OrderSlip
            products={allUniqueProductsWithPreOrder}
            shop={shop}
          />
        )}
      </div>
    </div>
  );
}
