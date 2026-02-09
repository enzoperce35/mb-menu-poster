import React, { useState, useEffect } from "react";
import axios from "axios";
import NowPoster from "./components/posters/NowPoster.jsx";
import ImagePoster from "./components/posters/ImagePoster.jsx";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posterType, setPosterType] = useState("now"); // "now" or "image"

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/v1/products?shop_id=1"
        );
        const nowGroup = res.data.find((g) => g.name === "Now");
        if (nowGroup) {
          // prepare for ImagePoster selection
          const productsWithSelection = nowGroup.products.map((p) => ({
            ...p,
            selected: true, // default all selected
          }));
          setProducts(productsWithSelection);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div>Loading menu...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h3>MB-Menu-Poster</h3>

      <div style={{ marginBottom: "15px" }}>
        <button
          onClick={() => setPosterType("now")}
          style={{
            marginRight: "10px",
            padding: "8px 15px",
            backgroundColor: posterType === "now" ? "#333" : "#eee",
            color: posterType === "now" ? "#fff" : "#000",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Now Poster
        </button>
        <button
          onClick={() => setPosterType("image")}
          style={{
            padding: "8px 15px",
            backgroundColor: posterType === "image" ? "#333" : "#eee",
            color: posterType === "image" ? "#fff" : "#000",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Image Poster
        </button>
      </div>

      {posterType === "now" ? (
        <NowPoster shopId={1} />
      ) : (
        <ImagePoster products={products} />
      )}
    </div>
  );
}
