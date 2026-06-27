"use client";

import { ArrowUpRight } from "lucide-react";
import { isVideoSrc } from "../../data/catalog";

export default function VideoModal({ open, onClose, src, title }) {
  return (
    <div className={`modal-overlay ${open ? "show" : ""}`} onClick={onClose}>
      <div className="modal-container video-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{title}</h3>
            <p style={{ fontSize: "0.85rem", marginBottom: 0 }}>Step-by-step Pro Commerce Solutions setup tutorial.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="btn ghost small"
              style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem", whiteSpace: "nowrap", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
            >
              Open in New Tab <ArrowUpRight size={12} />
            </a>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
        </div>
        <div className="modal-body" style={{ padding: 0, overflow: "hidden", background: "#000" }}>
          {open && (
            <div className="video-iframe-container">
              {isVideoSrc(src) ? (
                <video src={src} controls autoPlay playsInline title={title} />
              ) : (
                <iframe
                  src={src}
                  width="100%"
                  height="100%"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title={title}
                  style={{ border: "none" }}
                  loading="lazy"
                ></iframe>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
