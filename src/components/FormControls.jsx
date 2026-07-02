"use client";

// Shared form controls used across the contact form, survey, statement upload,
// and welcome popup — one source of truth for the business-type options.

const BASE_TYPES = [
  "Restaurant (table service)",
  "Restaurant (quick service)",
  "Cafés & QSR",
  "Retail"
];

export function BusinessTypeSelect({ value, onChange, includeServices = false, required = false }) {
  return (
    <select value={value} onChange={onChange} required={required}>
      {BASE_TYPES.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
      {includeServices && <option value="Services">Services</option>}
      <option value="Other">Other</option>
    </select>
  );
}

// Honeypot anti-spam field (spec §14 / QA "Spam protection added"): invisible
// to humans, tempting to bots. The Apps Script silently drops any submission
// where this field has a value.
export function HoneypotField({ value, onChange }) {
  return (
    <input
      type="text"
      name="website"
      className="hp-field"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      value={value || ""}
      onChange={onChange}
    />
  );
}
