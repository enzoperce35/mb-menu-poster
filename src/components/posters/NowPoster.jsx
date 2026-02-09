import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";

export default function NowPoster({ shopId }) {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const posterRef = useRef();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/v1/products?shop_id=${shopId}`
        );
        // Find the "Now" group
        const nowGroup = res.data.find((g) => g.name === "Now");
        if (nowGroup) {
          setProducts(nowGroup.products);
          // initialize selectedProducts state
          const initSelection = {};
          nowGroup.products.forEach((p) => {
            initSelection[p.id] = { selected: true, variants: {} };
            p.variants.forEach((v) => {
              initSelection[p.id].variants[v.id] = true; // all variants selected by default
            });
          });
          setSelectedProducts(initSelection);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [shopId]);

  const toggleProduct = (productId) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        selected: !prev[productId].selected,
      },
    }));
  };

  const toggleVariant = (productId, variantId) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        variants: {
          ...prev[productId].variants,
          [variantId]: !prev[productId].variants[variantId],
        },
      },
    }));
  };

  const handleDownload = async () => {
    if (!posterRef.current) return;
    const canvas = await html2canvas(posterRef.current);
    const link = document.createElement("a");
    link.download = `NowPoster.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (loading) return <div>Loading Now products...</div>;

  return (
    <div>
      <h4>Now Poster</h4>

      <div
        ref={posterRef}
        style={{
          border: "2px solid #333",
          padding: "20px",
          backgroundColor: "#fff",
          width: "600px",
        }}
      >
        {products.map((p) =>
          selectedProducts[p.id]?.selected ? (
            <div
              key={p.id}
              style={{
                marginBottom: "15px",
                padding: "10px",
                border: "1px dashed #aaa",
                borderRadius: "8px",
              }}
            >
              <h5>{p.name}</h5>
              <p>{p.description}</p>
              <p>
                Price: {p.price} | Stock: {p.stock}
              </p>

              {p.variants.length > 0 && (
                <div style={{ marginTop: "5px" }}>
                  <strong>Variants:</strong>
                  {p.variants.map((v) => (
                    <div key={v.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedProducts[p.id].variants[v.id]}
                          onChange={() => toggleVariant(p.id, v.id)}
                        />{" "}
                        {v.name} - {v.price}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null
        )}
      </div>

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleDownload} style={{ padding: "10px 20px" }}>
          Download Poster
        </button>
      </div>
    </div>
  );
}
