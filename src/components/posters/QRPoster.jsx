import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";

export default function QRPoster() {
  const shopRef = useRef(null);
  const bundleRef = useRef(null);

  const shopQR =
    "https://order-po.netlify.app/products?shop_id=1";
  const bundlesQR =
    "https://mb-bundles.netlify.app/";

  // ================= DOWNLOAD =================
  const downloadPNG = async (ref, filename) => {
    if (!ref.current) return;

    const canvas = await html2canvas(ref.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>QR Poster Generator</h2>

      {/* ================= SIMPLE UI ================= */}
      <div style={styles.row}>

        {/* ================= SHOP CARD ================= */}
        <div style={styles.card}>
          <h3>MB SHOP</h3>
          <QRCodeSVG value={shopQR} size={180} />
          <button
            style={styles.btn}
            onClick={() =>
              downloadPNG(shopRef, "mb-shop.png")
            }
          >
            Download Shop Poster
          </button>
        </div>

        {/* ================= BUNDLES CARD ================= */}
        <div style={styles.card}>
          <h3>MB BUNDLES</h3>
          <QRCodeSVG value={bundlesQR} size={180} />
          <button
            style={styles.btnGreen}
            onClick={() =>
              downloadPNG(bundleRef, "mb-bundles.png")
            }
          >
            Download Bundles Poster
          </button>
        </div>

      </div>

      {/* ================= EXPORT POSTER (SHOP - PREMIUM) ================= */}
      <div ref={shopRef} style={styles.exportPoster}>
        <div style={styles.headerBlack}>MB SHOP</div>

        <div style={styles.qrFrame}>
          <QRCodeSVG value={shopQR} size={260} level="H" />
        </div>

        <div style={styles.cta}>SCAN TO ORDER NOW</div>

        <div style={styles.footer}>
          order-po.netlify.app/products?shop_id=1
        </div>
      </div>

      {/* ================= EXPORT POSTER (BUNDLES - PREMIUM) ================= */}
      <div ref={bundleRef} style={styles.exportPosterGreen}>
        <div style={styles.headerGreen}>MB BUNDLES</div>

        <div style={styles.qrFrame}>
          <QRCodeSVG value={bundlesQR} size={260} level="H" />
        </div>

        <div style={styles.ctaGreen}>SCAN FOR BUNDLES</div>

        <div style={styles.footer}>
          mb-bundles.netlify.app
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    padding: "20px",
    fontFamily: "Arial",
    textAlign: "center",
  },

  title: {
    marginBottom: "20px",
  },

  /* ================= SIMPLE UI ================= */
  row: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "40px",
  },

  card: {
    width: "300px",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    background: "#fff",
  },

  btn: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    border: "none",
    background: "#111",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
  },

  btnGreen: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    border: "none",
    background: "#2ecc71",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
  },

  /* ================= EXPORT POSTER (SHOP PREMIUM) ================= */
  exportPoster: {
    position: "absolute",
    left: "-9999px",
    width: "800px",
    height: "1100px",
    background: "#ffffff",
    padding: "60px 40px",
    boxSizing: "border-box",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerBlack: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#111",
  },

  exportPosterGreen: {
    position: "absolute",
    left: "-9999px",
    width: "800px",
    height: "1100px",
    background: "#f6fff8",
    padding: "60px 40px",
    boxSizing: "border-box",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerGreen: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#2ecc71",
  },

  qrFrame: {
    padding: "25px",
    border: "3px solid #111",
    borderRadius: "20px",
    background: "#fff",
  },

  cta: {
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "2px",
  },

  ctaGreen: {
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "2px",
    color: "#2ecc71",
  },

  footer: {
    fontSize: "11px",
    color: "#888",
  },
};
