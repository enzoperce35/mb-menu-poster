import React, { useRef, useState, useEffect, useMemo } from "react";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import { createFeedbackCard } from "../../api/feedbackCards";
import "./OrderSlip.css";

export default function OrderSlip({ products = [], shop }) {
    const slipRef = useRef();
    const [reference, setReference] = useState("Juan Dela Cruz");
    const [feedbackUrl, setFeedbackUrl] = useState("");
    const [loadingCard, setLoadingCard] = useState(false);

    // Active tab state for filtering checklist: 'preorder' | 'regular'
    const [activeFilter, setActiveFilter] = useState("preorder");

    // Categorize products into PreOrder and Regular products
    const { preOrderProducts, regularProducts } = useMemo(() => {
        const preOrder = [];
        const regular = [];

        products.forEach((p) => {
            const rawGroups = p.delivery_groups || p.deliveryGroups || p.groups || [];

            // Extract group names whether they are strings, Rails DeliveryGroup objects, or simple objects
            const groupNames = rawGroups.map((g) => {
                if (typeof g === "string") return g.trim().toLowerCase();
                if (g && typeof g === "object") return (g.name || g.label || "").trim().toLowerCase();
                return "";
            }).filter(Boolean);

            // Check if product belongs to PreOrder
            const isPreOrder = groupNames.includes("preorder");

            if (isPreOrder) {
                preOrder.push(p);
            } else {
                regular.push(p);
            }
        });

        return { preOrderProducts: preOrder, regularProducts: regular };
    }, [products]);

    // Flatten all variants for preview keying & calculation
    const allVariants = useMemo(() => {
        return products.flatMap((p) =>
            (p.variants || []).map((v) => ({
                variantId: v.id,
                productId: p.id,
                productName: p.name,
                variantName: v.name,
                displayName: `${p.name} (${v.name})`,
                price: v.price || p.price,
            }))
        );
    }, [products]);

    // Saved selection state
    const [selectedVariants, setSelectedVariants] = useState(() => {
        const saved = localStorage.getItem("orderslip_selected_variants");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to load saved variant selections", e);
            }
        }
        return allVariants.reduce((obj, item) => {
            obj[item.variantId] = false;
            return obj;
        }, {});
    });

    useEffect(() => {
        localStorage.setItem(
            "orderslip_selected_variants",
            JSON.stringify(selectedVariants)
        );
    }, [selectedVariants]);

    const toggleVariant = (id) => {
        setSelectedVariants((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Determine current list based on selected filter
    const activeProductList = activeFilter === "preorder" ? preOrderProducts : regularProducts;

    const handleDownload = async () => {
        try {
            setLoadingCard(true);

            const selectedProductIds = products
                .filter((product) =>
                    product.variants?.some((v) => selectedVariants[v.id])
                )
                .map((product) => product.id);

            const response = await createFeedbackCard({
                customer_name: reference,
                product_ids: selectedProductIds,
            });

            setFeedbackUrl(response.feedback_url);

            await new Promise((resolve) => setTimeout(resolve, 300));

            const canvas = await html2canvas(slipRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: "#ffffff",
            });

            const link = document.createElement("a");
            link.download = `OrderSlip_${reference.replace(/\s+/g, "_")}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (err) {
            console.error(err);
            alert("Unable to generate feedback card.");
        } finally {
            setLoadingCard(false);
        }
    };

    const visibleVariants = allVariants.filter((v) => selectedVariants[v.variantId]);

    return (
        <div className="order-slip-page">
            {/* --- PREVIEW PANEL --- */}
            <div className="order-slip-preview">
                <div ref={slipRef} className="order-slip-paper">
                    {/* Header */}
                    <div className="slip-header">
                        <h2 className="shop-title">{shop?.name || "Your Shop Name"}</h2>
                        <div className="receipt-divider-dashed" />
                    </div>

                    {/* Reference Info */}
                    <div className="slip-meta">
                        <span className="label">Order Reference</span>
                        <h3 className="reference-value">{reference || "—"}</h3>
                    </div>

                    <div className="receipt-divider" />

                    {/* Product Checklist Section */}
                    <div className="slip-products-section">
                        <div className="products-header">
                            <span className="label">Items Ordered</span>
                            <span className="label-count">{visibleVariants.length} items</span>
                        </div>

                        {visibleVariants.length > 0 ? (
                            <ul className="slip-products-list">
                                {visibleVariants.map((item) => (
                                    <li key={item.variantId} className="slip-product-item">
                                        <span className="checkmark">✓</span>
                                        <span className="product-name">{item.displayName}</span>
                                        {item.price && (
                                            <span className="product-price">
                                                ${Number(item.price).toFixed(2)}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-products-notice">No items selected.</p>
                        )}
                    </div>

                    <div className="receipt-divider-dashed" />

                    {/* Thank You & Review Call-to-Action */}
                    <div className="slip-footer">
                        <h4 className="greeting-title">Hello! Thank you for choosing us today. 🌟</h4>
                        <p className="thank-you-text">
                            Leave us a quick review and help our kitchen grow!
                        </p>

                        <div className="qr-box">
                            {feedbackUrl ? (
                                <QRCodeSVG
                                    value={feedbackUrl}
                                    size={120}
                                    bgColor="#FFFFFF"
                                    fgColor="#000000"
                                    level="M"
                                    includeMargin
                                />
                            ) : (
                                <div className="qr-placeholder">
                                    <span>Generate Card First</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONTROLS PANEL --- */}
            <div className="order-slip-controls">
                <div className="controls-header">
                    <h3>Slip Settings</h3>
                    <p>Customize information and items before exporting.</p>
                </div>

                <div className="control-group">
                    <label htmlFor="order-ref-input" className="control-label">
                        Order Reference / Customer Name
                    </label>
                    <input
                        id="order-ref-input"
                        type="text"
                        className="control-input"
                        value={reference}
                        placeholder="e.g. Juan Dela Cruz"
                        onChange={(e) => setReference(e.target.value)}
                    />
                </div>

                <div className="control-group">
                    <div className="products-control-bar">
                        <label className="control-label" style={{ margin: 0 }}>Select Variants</label>
                        
                        {/* --- Clickable Filter Links --- */}
                        <div className="category-tabs">
                            <button
                                type="button"
                                className={`tab-link ${activeFilter === "preorder" ? "active" : ""}`}
                                onClick={() => setActiveFilter("preorder")}
                            >
                                PreOrder
                            </button>
                            <span className="tab-separator">|</span>
                            <button
                                type="button"
                                className={`tab-link ${activeFilter === "regular" ? "active" : ""}`}
                                onClick={() => setActiveFilter("regular")}
                            >
                                Regular
                            </button>
                        </div>
                    </div>

                    <div className="products-checklist">
                        {activeProductList.length > 0 ? (
                            activeProductList.map((p) => (
                                <div key={p.id} className="product-group">
                                    <span className="product-group-title">{p.name}</span>
                                    {(p.variants || []).map((v) => (
                                        <label key={v.id} className="checkbox-row variant-row">
                                            <input
                                                type="checkbox"
                                                checked={!!selectedVariants[v.id]}
                                                onChange={() => toggleVariant(v.id)}
                                            />
                                            <span className="checkbox-label">{v.name}</span>
                                        </label>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <p className="no-products-notice">No items available in this category.</p>
                        )}
                    </div>
                </div>

                <button
                    className="download-button"
                    onClick={handleDownload}
                    disabled={loadingCard}
                >
                    {loadingCard ? "Generating..." : "Download PNG"}
                </button>
            </div>
        </div>
    );
}
