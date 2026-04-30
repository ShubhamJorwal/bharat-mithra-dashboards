import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineCollection, HiOutlineArrowLeft, HiOutlinePlus, HiOutlineX,
  HiOutlineCheck, HiOutlinePencil
} from "react-icons/hi";
import { PageHeader } from "@/components/common/PageHeader";
import servicesApi from "@/services/api/services.api";
import type { ServiceCategory, CreateCategoryRequest, UpdateCategoryRequest } from "@/types/api.types";
import "../ServiceList/ServiceList.scss";
import "./CategoryManager.scss";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const COLORS = [
  "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#0ea5e9", "#84cc16", "#65a30d", "#64748b",
];

const TYPE_OPTIONS: ServiceCategory["category_type"][] = [
  "government", "financial", "utility", "private", "schemes",
];

const CategoryManager = () => {
  const [items, setItems] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [draft, setDraft] = useState<CreateCategoryRequest>({
    code: "", name: "", color: "#3b82f6", category_type: "government", sort_order: 100,
  });

  const load = async () => {
    setLoading(true);
    try {
      const r = await servicesApi.listCategories(true);
      setItems(r.data || []);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const submitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!draft.code || !draft.name) { setError("Code and name are required."); return; }
    try {
      await servicesApi.createCategory({ ...draft, slug: slugify(draft.name) });
      setShowCreate(false);
      setDraft({ code: "", name: "", color: "#3b82f6", category_type: "government", sort_order: 100 });
      void load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setError(e.response?.data?.error?.message || e.message || "Failed to create category");
    }
  };

  return (
    <div className="bm-services bm-cat-manager">
      <PageHeader
        icon={<HiOutlineCollection />}
        title="Categories"
        description="Top-level groupings for the service catalog. Each category has a colour and a type (Government / Financial / Utility / Private / Schemes)."
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/services" className="bm-btn"><HiOutlineArrowLeft /> Back to catalog</Link>
            <button className="bm-btn bm-btn-primary" onClick={() => setShowCreate(true)}>
              <HiOutlinePlus /> New category
            </button>
          </div>
        }
      />

      {error && <div className="bm-alert bm-alert-error">{error}</div>}

      {showCreate && (
        <form className="bm-cat-create" onSubmit={submitNew}>
          <h3>New category</h3>
          <div className="bm-cat-grid">
            <label>
              <span>Code *</span>
              <input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} placeholder="e.g. healthcare, telecom" required />
            </label>
            <label>
              <span>Display name *</span>
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Healthcare" required />
            </label>
            <label>
              <span>Type</span>
              <select value={draft.category_type} onChange={(e) => setDraft({ ...draft, category_type: e.target.value as ServiceCategory["category_type"] })}>
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>
              <span>Sort order</span>
              <input type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: parseInt(e.target.value) || 0 })} />
            </label>
            <label className="bm-cat-color">
              <span>Colour</span>
              <div className="bm-color-swatches">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setDraft({ ...draft, color: c })}
                    className={`bm-swatch ${draft.color === c ? "selected" : ""}`}
                    style={{ background: c }} aria-label={c} />
                ))}
              </div>
            </label>
            <label>
              <span>Description</span>
              <textarea value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={2} />
            </label>
          </div>
          <div className="bm-cat-actions">
            <button type="button" className="bm-btn" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="bm-btn bm-btn-primary">Create category</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="bm-empty">Loading…</div>
      ) : items.length === 0 ? (
        <div className="bm-empty">No categories yet. Click "New category" to add the first one.</div>
      ) : (
        <div className="bm-cat-list">
          {items.map(cat => (
            <CategoryRow key={cat.id} cat={cat} editing={editingId === cat.id}
              onEdit={() => setEditingId(cat.id)} onCancel={() => setEditingId(null)}
              onSaved={() => { setEditingId(null); void load(); }} />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryRow = ({ cat, editing, onEdit, onCancel, onSaved }: {
  cat: ServiceCategory;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaved: () => void;
}) => {
  const [form, setForm] = useState<UpdateCategoryRequest>({
    name: cat.name, description: cat.description, color: cat.color,
    category_type: cat.category_type, sort_order: cat.sort_order, is_active: cat.is_active,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setSaving(true); setErr(null);
    try {
      await servicesApi.updateCategory(cat.id, form);
      onSaved();
    } catch (e: unknown) {
      const ex = e as { message?: string };
      setErr(ex.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="bm-cat-row" style={{ "--cat-color": cat.color } as React.CSSProperties}>
        <div className="bm-cat-color-bar" />
        <div className="bm-cat-info">
          <h4>{cat.name}</h4>
          <div className="bm-cat-meta">
            <code>{cat.code}</code>
            <span className={`bm-type-pill bm-type-${cat.category_type}`}>{cat.category_type}</span>
            <span className="bm-text-muted">{cat.service_count ?? 0} services</span>
            <span className="bm-text-muted">sort: {cat.sort_order}</span>
            {!cat.is_active && <span className="bm-pill-inactive">Inactive</span>}
          </div>
          {cat.description && <p className="bm-text-muted">{cat.description}</p>}
        </div>
        <div className="bm-cat-actions-inline">
          <button className="bm-btn bm-btn-ghost" onClick={onEdit}><HiOutlinePencil /> Edit</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bm-cat-row bm-cat-row-edit" style={{ "--cat-color": form.color || cat.color } as React.CSSProperties}>
      <div className="bm-cat-color-bar" />
      <div className="bm-cat-info">
        {err && <div className="bm-alert bm-alert-error" style={{ marginBottom: 10 }}>{err}</div>}
        <div className="bm-cat-grid">
          <label><span>Display name</span><input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label><span>Type</span>
            <select value={form.category_type || cat.category_type} onChange={(e) => setForm({ ...form, category_type: e.target.value as ServiceCategory["category_type"] })}>
              {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label><span>Sort order</span><input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></label>
          <label className="bm-cat-color"><span>Colour</span>
            <div className="bm-color-swatches">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  className={`bm-swatch ${form.color === c ? "selected" : ""}`}
                  style={{ background: c }} aria-label={c} />
              ))}
            </div>
          </label>
          <label style={{ gridColumn: "span 2" }}><span>Description</span>
            <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </label>
          <label className="bm-check"><input type="checkbox" checked={form.is_active ?? true} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
        </div>
      </div>
      <div className="bm-cat-actions-inline">
        <button className="bm-btn" onClick={onCancel}><HiOutlineX /> Cancel</button>
        <button className="bm-btn bm-btn-primary" onClick={save} disabled={saving}>
          <HiOutlineCheck /> {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default CategoryManager;
