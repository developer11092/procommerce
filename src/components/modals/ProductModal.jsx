"use client";

import { ArrowUpRight } from "lucide-react";
import { productGallery, isVideoSrc } from "../../data/catalog";
import { onImgError } from "../../data/site";

export default function ProductModal({ open, product, slide, setSlide, onClose, onAddToCalculator }) {
  return (
    <div className={`modal-overlay ${open ? "show" : ""}`} onClick={onClose}>
      <div className="modal-container product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Hardware Specifications</h3>
            <p style={{ fontSize: "0.85rem", marginBottom: 0 }}>Official Square Device details and connectivity.</p>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {product && (
            <div className="product-detail-wrap">
              <div className="product-detail-visual">
                {(() => {
                  const media = product.images || productGallery;
                  const len = media.length;
                  const idx = ((slide % len) + len) % len;
                  const src = media[idx];
                  const single = len <= 1;
                  return (
                    <div className="product-gallery">
                      {/* Only the active item is mounted — the real product files are
                          large (some 5–6 MB), so we never load the whole set at once. */}
                      {isVideoSrc(src) ? (
                        <video key={src} className="active" src={src} controls playsInline preload="metadata" />
                      ) : (
                        <img
                          key={src}
                          className="active"
                          src={src}
                          alt={`${product.name} — image ${idx + 1} of ${len}`}
                          onError={onImgError("/hero_pos_scene.jpg")}
                        />
                      )}

                      {!single && (
                        <>
                          <button type="button" className="gallery-nav prev" aria-label="Previous item" onClick={() => setSlide((s) => (s - 1 + len) % len)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </button>
                          <button type="button" className="gallery-nav next" aria-label="Next item" onClick={() => setSlide((s) => (s + 1) % len)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </button>
                          <div className="product-gallery-dots">
                            {media.map((m, gi) => (
                              <button key={gi} type="button" aria-label={(isVideoSrc(m) ? "Video " : "Image ") + (gi + 1)} className={idx === gi ? "active" : ""} onClick={() => setSlide(gi)}></button>
                            ))}
                          </div>
                          <span className="gallery-counter">{idx + 1} / {len}</span>
                        </>
                      )}
                    </div>
                  );
                })()}
                <div className="product-detail-pricing" style={{ marginTop: "1.5rem", textAlign: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Official Price:</span>
                  <strong style={{ fontSize: "1.35rem", color: "var(--charcoal-dark)" }}>{product.price}</strong>
                </div>
              </div>

              <div className="product-detail-info">
                <h4 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", color: "var(--charcoal-dark)", fontWeight: 700 }}>{product.name}</h4>
                <p style={{ fontSize: "0.95rem", color: "var(--text-main)", marginBottom: "1.5rem", lineHeight: "1.5" }}>{product.desc}</p>

                <div className="specs-section" style={{ marginBottom: "1.5rem" }}>
                  <h5 style={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 700 }}>Technical Specifications</h5>
                  <ul style={{ listStyle: "disc", paddingLeft: "1.2rem", fontSize: "0.85rem", color: "var(--text-main)", lineHeight: "1.6" }}>
                    {product.specs.map((spec, idx) => (
                      <li key={idx} style={{ marginBottom: "0.4rem" }}>{spec}</li>
                    ))}
                  </ul>
                </div>

                <div className="best-for-section" style={{ marginBottom: "2rem", background: "var(--blue-soft)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--blue-soft-border)" }}>
                  <h5 style={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", color: "var(--blue-dark)", marginBottom: "0.25rem", fontWeight: 700 }}>Best For</h5>
                  <p style={{ fontSize: "0.85rem", color: "var(--blue-dark)", marginBottom: 0 }}>{product.bestFor}</p>
                </div>

                <div className="product-detail-actions" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <button className="btn primary" style={{ width: "100%" }} onClick={() => onAddToCalculator(product.name)}>
                    Add to Monthly Estimate
                  </button>
                  <button className="btn secondary" style={{ width: "100%" }} onClick={() => window.open(product.url, "_blank", "noopener,noreferrer")}>
                    Open Square Store Checkout <ArrowUpRight size={16} />
                  </button>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center", display: "block", marginTop: "0.25rem" }}>
                    🔒 Security Note: Square&apos;s checkout domain blocks embedded framing. Clicking opens a secure window.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
