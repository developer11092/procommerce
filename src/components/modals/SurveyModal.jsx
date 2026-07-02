"use client";

import { ShieldCheck, FileText } from "lucide-react";
import { BusinessTypeSelect, HoneypotField } from "../FormControls";

export default function SurveyModal({ open, onClose, success, step, setStep, form, setForm, onSubmit, onNext, onFileChange, loadingAction }) {
  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className={`modal-overlay ${open ? "show" : ""}`}>
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <h3>Merchant Setup Survey</h3>
            <p style={{ fontSize: "0.85rem", marginBottom: 0 }}>Configure your customized Square recommendation.</p>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {success ? (
            <div style={{ textAlign: "center", padding: "3rem 0" }}>
              <div style={{ display: "inline-grid", placeItems: "center", width: "64px", height: "64px", borderRadius: "9999px", background: "var(--success-soft)", color: "var(--success)", marginBottom: "1rem" }}>
                <ShieldCheck size={36} />
              </div>
              <h3>Survey Captured!</h3>
              <p style={{ margin: "1rem 0 2rem", color: "var(--text-muted)" }}>Your information has been logged securely in our pipeline. The team at Pro Commerce Solutions will evaluate your details and prepare custom POS recommendations.</p>
              <div className="btn-row" style={{ justifyContent: "center" }}>
                <button className="btn primary" onClick={onClose}>Done</button>
              </div>
            </div>
          ) : (
            <>
              <div className="survey-progress">
                <div className={`survey-progress-step ${step >= 1 ? "active" : ""}`}></div>
                <div className={`survey-progress-step ${step >= 2 ? "active" : ""}`}></div>
                <div className={`survey-progress-step ${step >= 3 ? "active" : ""}`}></div>
              </div>

              <form onSubmit={onSubmit}>
                <HoneypotField value={form.website} onChange={set("website")} />
                {step === 1 && (
                  <div className="survey-step active">
                    <h4 style={{ marginBottom: "1rem" }}>Step 1: Contact Information</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>First Name *</label>
                        <input type="text" placeholder="First name" required value={form.firstName} onChange={set("firstName")} />
                      </div>
                      <div className="form-group">
                        <label>Last Name *</label>
                        <input type="text" placeholder="Last name" required value={form.lastName} onChange={set("lastName")} />
                      </div>
                      <div className="form-group">
                        <label>Email Address *</label>
                        <input type="email" placeholder="Email address" required value={form.email} onChange={set("email")} />
                      </div>
                      <div className="form-group">
                        <label>Phone Number <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>(optional)</span></label>
                        <input type="tel" placeholder="Phone number" value={form.phone} onChange={set("phone")} />
                      </div>
                    </div>
                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                      <button type="button" className="btn primary" onClick={onNext}>Next Step</button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="survey-step active">
                    <h4 style={{ marginBottom: "1rem" }}>Step 2: Business Workflows</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Business Type *</label>
                        <BusinessTypeSelect value={form.businessType} onChange={set("businessType")} required />
                      </div>
                      <div className="form-group">
                        <label>Industry *</label>
                        <input type="text" placeholder="Industry category" required value={form.industry} onChange={set("industry")} />
                      </div>
                      <div className="form-group">
                        <label>Monthly Revenue ($) *</label>
                        <input type="text" placeholder="Estimated revenue" required value={form.monthlyRevenue} onChange={set("monthlyRevenue")} />
                      </div>
                      <div className="form-group">
                        <label>Projected Volume ($) *</label>
                        <input type="text" placeholder="Projected monthly volume" required value={form.projectedVolume} onChange={set("projectedVolume")} />
                      </div>
                    </div>
                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
                      <button type="button" className="btn ghost" onClick={() => setStep(1)}>Previous</button>
                      <button type="button" className="btn primary" onClick={onNext}>Next Step</button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="survey-step active">
                    <h4 style={{ marginBottom: "1rem" }}>Step 3: Registration details</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Merchant DBA *</label>
                        <input type="text" placeholder="Doing Business As name" required value={form.dbaName} onChange={set("dbaName")} />
                      </div>
                      <div className="form-group">
                        <label>Legal Business Name *</label>
                        <input type="text" placeholder="Legal registered entity name" required value={form.legalName} onChange={set("legalName")} />
                      </div>
                      <div className="form-group full">
                        <label>Street Address *</label>
                        <input type="text" placeholder="Business street address" required value={form.streetAddress} onChange={set("streetAddress")} />
                      </div>
                      <div className="form-group">
                        <label>City *</label>
                        <input type="text" placeholder="City" required value={form.city} onChange={set("city")} />
                      </div>
                      <div className="form-group">
                        <label>State *</label>
                        <input type="text" placeholder="State" required value={form.state} onChange={set("state")} />
                      </div>
                      <div className="form-group">
                        <label>Zip *</label>
                        <input type="text" placeholder="Zip code" required value={form.zipCode} onChange={set("zipCode")} />
                      </div>
                      <div className="form-group full">
                        <label>Processing Statement (Optional)</label>
                        <div className="upload-area" onClick={() => document.getElementById("survey-file-input").click()}>
                          <div className="upload-area-icon">
                            <FileText size={32} />
                          </div>
                          <p>Drag file here or <strong>browse files</strong> to upload statement</p>
                          <input type="file" id="survey-file-input" style={{ display: "none" }} onChange={(e) => onFileChange(e, "survey")} />
                          {form.fileName && (
                            <span className="upload-filename" style={{ display: "block" }}>{form.fileName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
                      <button type="button" className="btn ghost" onClick={() => setStep(2)}>Previous</button>
                      <button type="submit" className="btn primary" disabled={loadingAction === "survey"}>
                        {loadingAction === "survey" ? "Submitting..." : "Submit Survey"}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
