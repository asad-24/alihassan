"use client";
import { useState } from "react";
import { Save } from "lucide-react";
import { useResource, ResourceState } from "@/components/admin/use-resource";
import { api, useStore } from "@/components/store-provider";
import type { StoreSettings } from "@/lib/types";
export default function SettingsPage() {
  const { data, error, reload } = useResource<{ settings: StoreSettings }>(
    "/api/admin/settings",
  );
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState("");
  const { notify } = useStore();
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setSaveError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      notify("Shop details updated");
    } catch (error) {
      setSaveError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>A personal touch.</h1>
          <p>
            Give customers a way to reach you. These details appear on the
            information page.
          </p>
        </div>
      </div>
      {!data ? (
        <ResourceState error={error} retry={reload} />
      ) : (
        <form className="admin-form" onSubmit={save}>
          {saveError && (
            <div className="form-error" role="alert">
              {saveError}
            </div>
          )}
          <div className="admin-panel">
            <h2>Shop contact details</h2>
            <div className="form-grid">
              <label className="form-field">
                <span>Phone number</span>
                <input
                  name="phone"
                  type="tel"
                  maxLength={30}
                  defaultValue={data.settings.phone}
                  placeholder="03001234567"
                />
              </label>
              <label className="form-field">
                <span>WhatsApp number</span>
                <input
                  name="whatsapp"
                  maxLength={15}
                  defaultValue={data.settings.whatsapp}
                  placeholder="923001234567"
                />
                <small className="form-hint">
                  International digits, without + or spaces.
                </small>
              </label>
              <label className="form-field full-width">
                <span>Contact email</span>
                <input
                  name="email"
                  type="email"
                  maxLength={254}
                  defaultValue={data.settings.email}
                  placeholder="shop@example.com"
                />
              </label>
              <label className="form-field full-width">
                <span>Shop address</span>
                <textarea
                  name="address"
                  maxLength={500}
                  defaultValue={data.settings.address}
                  placeholder="Your real shop address"
                />
              </label>
              <label className="form-field full-width">
                <span>Opening hours</span>
                <input
                  name="openingHours"
                  maxLength={200}
                  defaultValue={data.settings.openingHours}
                  placeholder="e.g. Monday–Saturday, 10am–9pm"
                />
              </label>
            </div>
          </div>
          <div className="admin-panel">
            <h2>Returns & exchanges</h2>
            <label className="form-field">
              <span>Your shop’s return policy</span>
              <textarea
                name="returnPolicy"
                maxLength={5000}
                defaultValue={data.settings.returnPolicy}
                placeholder="Describe time limits, eligibility, warranties, and any return delivery charges."
                style={{ minHeight: 180 }}
              />
            </label>
            <p className="form-hint">
              Publish the terms you actually offer. Leave blank to ask customers
              to confirm product-specific terms before purchase.
            </p>
          </div>
          <div className="admin-form-actions">
            <button className="btn btn-dark" disabled={busy}>
              <Save size={16} />
              {busy ? "Saving…" : "Save shop details"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
