import React, { useState, useEffect } from "react";
import NowPoster from "./components/posters/NowPoster.jsx";
import ImagePoster from "./components/posters/ImagePoster.jsx";
import { fetchProducts } from "./api/products";

export default function App() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posterType, setPosterType] = useState("now");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts(1);
        setGroups(data);
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
    <div style={{ padding: "20px" }}>
      <h3>MB-Menu-Poster</h3>

      <div style={{ marginBottom: "15px" }}>
        <button onClick={() => setPosterType("now")}>
          Now Poster
        </button>
        <button onClick={() => setPosterType("image")}>
          Image Poster
        </button>
      </div>

      {posterType === "now" ? (
        <NowPoster products={nowGroup?.products || []} />
      ) : (
        <ImagePoster products={nowGroup?.products || []} />
      )}
    </div>
  );
}
