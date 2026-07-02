"use client";

import { ShieldCheck, FileText } from "lucide-react";
import { BusinessTypeSelect, HoneypotField } from "../FormControls";

export default function UploadModal({ open, onClose, success, form, setForm, onSubmit, onFileChange, loadingAction }) {
  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className={`modal-overlay ${open ? "show" : ""}`}>
      <div className="modal-container" style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <div>
            <h3>Upload Statement</h3>
            <p style={{ fontSize: "0.85rem", marginBottom: 0 }}>Upload your recent processing statement for rates comparison.</p>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {success ? (
            <div style={{ textAlign: "center", padding: "3rem 0" }}>
              <div style={{ display: "inline-grid", placeItems: "center", width: "64px", height: "64px", borderRadius: "9999px", background: "var(--success-soft)", color: "var(--success)", marginBottom: "1rem" }}>
                <ShieldCheck size={36} />
              </div>
              <h3>Statement Uploaded Privately</h3>
              <p style={{ margin: "1rem 0 2rem", color: "var(--text-muted)" }}>Your merchant statements have been stored securely in our private drive for analysis. The Pro Commerce Solutions team will build your customized savings estimate.</p>
              <div className="btn-row" style={{ justifyContent: "center" }}>
                <button className="btn primary" onClick={onClose}>Done</button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <HoneypotField value={form.website} onChange={set("website")} />
              <div className="form-grid">
                <div className="form-group">
                  <label>Business Name *</label>
                  <input type="text" placeholder="Your business name" required value={form.businessName} onChange={set("businessName")} />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" placeholder="Your email address" required value={form.email} onChange={set("email")} />
                </div>
                <div className="form-group">
                  <label>Current Processor *</label>
                  <input type="text" placeholder="e.g. Clover, Toast, Chase Paymentech" required value={form.currentProcessor} onChange={set("currentProcessor")} />
                </div>
                <div className="form-group">
                  <label>Business Type *</label>
                  <BusinessTypeSelect value={form.businessType} onChange={set("businessType")} required includeServices />
                </div>
                <div className="form-group">
                  <label>Avg. Monthly Card Volume ($) *</label>
                  <input type="text" placeholder="e.g. 45,000" required value={form.monthlyVolume} onChange={set("monthlyVolume")} />
                </div>
                <div className="form-group">
                  <label>Number of Locations *</label>
                  <input type="number" min="1" placeholder="1" required value={form.numLocations} onChange={set("numLocations")} />
                </div>
                <div className="form-group full">
                  <label>Current Monthly Processing Fees ($) <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>(optional)</span></label>
                  <input type="text" placeholder="Approx. total monthly fees, if known" value={form.monthlyFees} onChange={set("monthlyFees")} />
                </div>
                <div className="form-group full">
                  <label>Upload Statement File *</label>
                  <div className="upload-area" onClick={() => document.getElementById("modal-file-input").click()}>
                    <div className="upload-area-icon">
                      <FileText size={32} />
                    </div>
                    <p>Drag statement file here or <strong>browse files</strong></p>
                    <input type="file" id="modal-file-input" style={{ display: "none" }} required onChange={(e) => onFileChange(e, "upload")} />
                    {form.fileName && (
                      <span className="upload-filename" style={{ display: "block" }}>{form.fileName}</span>
                    )}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "1rem", lineHeight: "1.4" }}><strong>Privacy note:</strong> Your credit card processing statement contains sensitive business identifiers and volume details. Files are uploaded directly to our secure private folder.</p>
              <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn primary" disabled={loadingAction === "upload"}>
                  {loadingAction === "upload" ? "Submitting..." : "Submit Statement"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
