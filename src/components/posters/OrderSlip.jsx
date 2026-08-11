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

            const groupNames = rawGroups.map((g) => {
                if (typeof g === "string") return g.trim().toLowerCase();
                if (g && typeof g === "object") return (g.name || g.label || "").trim().toLowerCase();
                return "";
            }).filter(Boolean);

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

    // Multiplier / Quantity state
    const [variantQuantities, setVariantQuantities] = useState(() => {
        const saved = localStorage.getItem("orderslip_variant_quantities");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to load saved variant quantities", e);
            }
        }
        return allVariants.reduce((obj, item) => {
            obj[item.variantId] = 1;
            return obj;
        }, {});
    });

    useEffect(() => {
        localStorage.setItem(
            "orderslip_selected_variants",
            JSON.stringify(selectedVariants)
        );
    }, [selectedVariants]);

    useEffect(() => {
        localStorage.setItem(
            "orderslip_variant_quantities",
            JSON.stringify(variantQuantities)
        );
    }, [variantQuantities]);

    const toggleVariant = (id) => {
        setSelectedVariants((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleQuantityChange = (id, delta) => {
        setVariantQuantities((prev) => {
            const currentQty = prev[id] || 1;
            const newQty = Math.max(1, currentQty + delta);
            return {
                ...prev,
                [id]: newQty,
            };
        });
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
                .map((product) => Number(product.id))
                .filter((id) => !isNaN(id) && id > 0);

            if (selectedProductIds.length === 0) {
                alert("Please select at least one item before downloading.");
                setLoadingCard(false);
                return;
            }

            try {
                const response = await createFeedbackCard({
                    customer_name: reference || "Customer",
                    product_ids: selectedProductIds,
                });

                if (response && response.feedback_url) {
                    setFeedbackUrl(response.feedback_url);
                }
            } catch (apiErr) {
                console.error("API error creating feedback card:", apiErr);
            }

            await new Promise((resolve) => setTimeout(resolve, 500));

            const canvas = await html2canvas(slipRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
                onclone: (clonedDoc) => {
                    const svgElements = clonedDoc.querySelectorAll("svg");
                    svgElements.forEach((svg) => {
                        svg.setAttribute("width", "120");
                        svg.setAttribute("height", "120");
                    });
                },
            });

            const link = document.createElement("a");
            link.download = `OrderSlip_${(reference || "Order").replace(/\s+/g, "_")}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (err) {
            console.error("Export Error:", err);
            alert("Unable to generate PNG order slip.");
        } finally {
            setLoadingCard(false);
        }
    };

    const visibleVariants = allVariants
        .filter((v) => selectedVariants[v.variantId])
        .map((v) => ({
            ...v,
            quantity: variantQuantities[v.variantId] || 1,
        }));

    const totalItemCount = visibleVariants.reduce((sum, item) => sum + item.quantity, 0);

    const grandTotal = visibleVariants.reduce((sum, item) => {
        const itemPrice = item.price ? Number(item.price) : 0;
        return sum + itemPrice * item.quantity;
    }, 0);

    return (
        <div className="order-slip-page">
            {/* --- PREVIEW PANEL --- */}
            <div className="order-slip-preview">
                <div ref={slipRef} className="order-slip-paper">
                    <div className="receipt-edge" />

                    {/* Header */}
                    <div className="slip-header">
                        <span className="receipt-badge">ORDER SLIP</span>
                        <h2 className="shop-title">{shop?.name || "Your Shop Name"}</h2>
                        <div className="receipt-divider-dashed" />
                    </div>

                    {/* Reference Info */}
                    <div className="slip-meta">
                        <div className="meta-col">
                            <span className="label">Order Ref</span>
                            <h3 className="reference-value">{reference || "—"}</h3>
                        </div>
                    </div>

                    <div className="receipt-divider" />

                    {/* Product Checklist Section */}
                    <div className="slip-products-section">
                        <div className="products-header">
                            <span className="label">Items Ordered</span>
                            <span className="label-count">{totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}</span>
                        </div>

                        {visibleVariants.length > 0 ? (
                            <>
                                <ul className="slip-products-list">
                                    {visibleVariants.map((item) => {
                                        const rowTotalPrice = item.price ? Number(item.price) * item.quantity : 0;
                                        return (
                                            <li key={item.variantId} className="slip-product-item">
                                                <span className="checkmark">✓</span>
                                                <div className="product-details">
                                                    <span className="product-name">
                                                        {item.quantity > 1 ? `${item.quantity}x ` : ""}
                                                        {item.displayName}
                                                    </span>
                                                </div>
                                                <span className="product-price">
                                                    ₱{rowTotalPrice.toFixed(2)}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>

                                <div className="receipt-divider-dashed" />

                                {/* Total Summary */}
                                <div className="receipt-totals">
                                    <div className="total-row grand-total">
                                        <span>TOTAL AMOUNT</span>
                                        <span>₱{grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="no-products-notice">No items selected.</p>
                        )}
                    </div>

                    <div className="receipt-divider-dashed" />

                    {/* Thank You & Review Call-to-Action */}
                    <div className="slip-footer">
                        <h4 className="greeting-title">Thank you for ordering! 🌟</h4>
                        <p className="thank-you-text">
                            Scan the QR code below to leave us a quick review.
                        </p>

                        <div className="qr-box">
                            {feedbackUrl ? (
                                <QRCodeSVG
                                    value={feedbackUrl}
                                    size={120}
                                    bgColor="#FFFFFF"
                                    fgColor="#0f172a"
                                    level="M"
                                    includeMargin
                                />
                            ) : (
                                <div className="qr-placeholder">
                                    <span>QR Code</span>
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
                                    {(p.variants || []).map((v) => {
                                        const isChecked = !!selectedVariants[v.id];
                                        const qty = variantQuantities[v.id] || 1;

                                        return (
                                            <div key={v.id} className="variant-row-container">
                                                <label className="checkbox-row variant-row">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleVariant(v.id)}
                                                    />
                                                    <span className="checkbox-label">{v.name}</span>
                                                </label>

                                                {isChecked && (
                                                    <div className="quantity-controls">
                                                        <button
                                                            type="button"
                                                            className="qty-btn"
                                                            onClick={() => handleQuantityChange(v.id, -1)}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="qty-value">{qty}</span>
                                                        <button
                                                            type="button"
                                                            className="qty-btn"
                                                            onClick={() => handleQuantityChange(v.id, 1)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
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
