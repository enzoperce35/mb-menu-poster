import React from "react";

export default function ImagePoster({ products }) {
  return (
    <div
      style={{
        border: "2px solid #333",
        padding: "20px",
        backgroundColor: "#fff",
        width: "600px",
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
      }}
    >
      {products
        .filter((p) => p.selected)
        .map((p) => (
          <div key={p.id} style={{ width: "180px" }}>
            <img
              src={p.image_url}
              alt={p.name}
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </div>
        ))}
    </div>
  );
}
