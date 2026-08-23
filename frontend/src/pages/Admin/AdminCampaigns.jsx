import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  togglePublishCampaign,
  deleteCampaign,
} from '../../api/campaigns';
import { getProducts } from '../../api/products';
import { getImageUrl } from '../../utils/imageUrl';
import { PREDEFINED_OCCASIONS } from '../../utils/occasions';
import CampaignPoster from '../../components/CampaignPoster';

const getStatusStyle = (status) => {
  switch (status) {
    case 'published':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'draft':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'archived':
      return 'bg-gray-100 text-gray-600 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-300';
  }
};

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Evergreen');

// ─── Product Selection Section Helper ──────────────────────────────────────────
const ProductPickerSection = ({ title, emoji, selectedIds, onToggle, allProducts, search, setSearch }) => {
  const filtered = allProducts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-choco-50/50 border border-choco-150 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="label mb-0 font-bold text-choco-900 flex items-center gap-1.5 text-sm">
          <span>{emoji}</span> {title}
        </label>
        <span className="text-xs font-bold text-choco-700 bg-white border border-choco-200 px-2.5 py-0.5 rounded-full">
          {selectedIds.length} selected
        </span>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={`Search products for ${title}...`}
        className="input-field text-xs py-2 bg-white"
      />

      {/* Selected Items Tags */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-xl border border-choco-100">
          {selectedIds.map((pid) => {
            const prodObj = allProducts.find((p) => p._id === pid);
            return (
              <span key={pid} className="inline-flex items-center gap-1.5 text-xs bg-choco-800 text-cream px-2.5 py-1 rounded-full">
                <span>{prodObj?.name || 'Product'}</span>
                <button
                  type="button"
                  onClick={() => onToggle(pid)}
                  className="w-4 h-4 rounded-full bg-choco-700 hover:bg-red-500 text-white text-[10px] font-bold flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Options List */}
      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1 p-2 bg-white border border-choco-100 rounded-xl">
        {filtered.length === 0 ? (
          <p className="text-xs text-choco-400 p-2">No matching products found</p>
        ) : (
          filtered.map((p) => {
            const isSelected = selectedIds.includes(p._id);
            return (
              <button
                key={p._id}
                type="button"
                onClick={() => onToggle(p._id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-800 font-semibold shadow-xs'
                    : 'border-choco-200 text-choco-700 hover:border-choco-500 hover:bg-choco-50'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}{p.name} <span className="opacity-75 font-mono">₹{p.price}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

// ─── Campaign Modal ───────────────────────────────────────────────────────────
const CampaignModal = ({ campaign, onClose, onSaved, allProducts }) => {
  const isEdit = !!campaign;
  const bannerRef = useRef();

  const [selectedOccasion, setSelectedOccasion] = useState(() => {
    if (!campaign) return PREDEFINED_OCCASIONS[0].name;
    const found = PREDEFINED_OCCASIONS.find((o) => o.name === campaign.occasionName);
    return found ? found.name : 'CUSTOM';
  });

  const [form, setForm] = useState({
    occasionName: campaign?.occasionName || PREDEFINED_OCCASIONS[0].name,
    slug: campaign?.slug || '',
    emoji: campaign?.emoji || PREDEFINED_OCCASIONS[0].emoji,
    description: campaign?.description || '',
    startDate: campaign?.startDate ? campaign.startDate.slice(0, 10) : '',
    endDate: campaign?.endDate ? campaign.endDate.slice(0, 10) : '',
    status: campaign?.status || 'draft',
    themeColors: campaign?.themeColors || {
      primary: PREDEFINED_OCCASIONS[0].primary,
      secondary: PREDEFINED_OCCASIONS[0].secondary,
      background: PREDEFINED_OCCASIONS[0].background,
    },
  });

  const [productsCategory, setProductsCategory] = useState(() => {
    const raw = campaign?.products || {};
    const extractIds = (list) => (Array.isArray(list) ? list.map((item) => (typeof item === 'object' ? item._id : item)) : []);
    if (Array.isArray(raw)) {
      return {
        special: extractIds(raw),
        hampers: [],
        customWrappers: [],
        normal: [],
      };
    }
    return {
      special: extractIds(raw.special),
      hampers: extractIds(raw.hampers),
      customWrappers: extractIds(raw.customWrappers),
      normal: extractIds(raw.normal),
    };
  });

  const [searchSpecial, setSearchSpecial] = useState('');
  const [searchHampers, setSearchHampers] = useState('');
  const [searchCustom, setSearchCustom] = useState('');
  const [searchNormal, setSearchNormal] = useState('');

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(getImageUrl(campaign?.bannerImageUrl) || '');
  const [submitting, setSubmitting] = useState(false);

  const handleField = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const handleColorField = (key, value) =>
    setForm((p) => ({ ...p, themeColors: { ...p.themeColors, [key]: value } }));

  const handleOccasionSelect = (name) => {
    setSelectedOccasion(name);
    if (name === 'CUSTOM') {
      setForm((p) => ({ ...p, occasionName: '', emoji: '✨' }));
    } else {
      const match = PREDEFINED_OCCASIONS.find((o) => o.name === name);
      if (match) {
        setForm((p) => ({
          ...p,
          occasionName: match.name,
          emoji: match.emoji,
          themeColors: {
            primary: match.primary,
            secondary: match.secondary,
            background: match.background,
          },
        }));
      }
    }
  };

  const toggleCategoryProduct = (categoryKey, productId) => {
    setProductsCategory((prev) => {
      const current = prev[categoryKey] || [];
      const updated = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId];
      return { ...prev, [categoryKey]: updated };
    });
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e, forcedStatus = null) => {
    if (e) e.preventDefault();
    if (!form.occasionName.trim()) return toast.error('Occasion name is required');

    const targetStatus = forcedStatus || form.status;

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('occasionName', form.occasionName.trim());
      if (form.slug) fd.append('slug', form.slug.trim());
      fd.append('emoji', form.emoji);
      fd.append('description', form.description);
      if (form.startDate) fd.append('startDate', form.startDate);
      if (form.endDate) fd.append('endDate', form.endDate);
      fd.append('status', targetStatus);
      fd.append('themeColors', JSON.stringify(form.themeColors));
      fd.append('products', JSON.stringify(productsCategory));
      if (bannerFile) fd.append('bannerImage', bannerFile);

      let saved;
      if (isEdit) {
        const res = await updateCampaign(campaign._id, fd);
        saved = res.data.campaign;
        toast.success(`Campaign updated (${targetStatus})! 🎉`);
      } else {
        const res = await createCampaign(fd);
        saved = res.data.campaign;
        toast.success(`Campaign created (${targetStatus})! 🎉`);
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save campaign');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      <div className="absolute inset-0 bg-choco-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white rounded-t-3xl border-b border-choco-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-choco-900">
              {isEdit ? '✏️ Edit Occasion Campaign' : '🎉 Create Occasion Campaign'}
            </h2>
            <p className="text-xs text-choco-400 mt-0.5">Customize theme, banner, and 4 product sections</p>
          </div>
          <button onClick={onClose} className="p-2 text-choco-400 hover:text-choco-900 hover:bg-choco-50 rounded-xl transition-colors">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} id={isEdit ? 'edit-campaign-form' : 'add-campaign-form'}>
          <div className="p-6 space-y-6">
            {/* Occasion Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Predefined Festival / Occasion *</label>
                <select
                  className="input-field font-medium"
                  value={selectedOccasion}
                  onChange={(e) => handleOccasionSelect(e.target.value)}
                >
                  {PREDEFINED_OCCASIONS.map((o) => (
                    <option key={o.name} value={o.name}>
                      {o.emoji} {o.name}
                    </option>
                  ))}
                  <option value="CUSTOM">✨ Custom Occasion (Add Your Own)</option>
                </select>
              </div>

              <div>
                <label className="label">Occasion Display Name *</label>
                <input
                  className="input-field"
                  placeholder="e.g. Valentine's Day"
                  value={form.occasionName}
                  onChange={(e) => handleField('occasionName', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Emoji & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Icon Emoji</label>
                <input
                  className="input-field text-center text-xl"
                  value={form.emoji}
                  onChange={(e) => handleField('emoji', e.target.value)}
                  maxLength={4}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">URL Slug <span className="text-choco-400 font-normal">(auto-generated if empty)</span></label>
                <div className="flex items-center">
                  <span className="text-xs bg-choco-100 text-choco-600 px-3 py-3 rounded-l-2xl border border-r-0 border-choco-200 font-mono">
                    /occasions/
                  </span>
                  <input
                    className="input-field rounded-l-none font-mono text-xs"
                    placeholder="valentines-day"
                    value={form.slug}
                    onChange={(e) => handleField('slug', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Tagline / Description */}
            <div>
              <label className="label">Tagline / Description</label>
              <textarea
                className="input-field resize-none text-sm"
                rows={2}
                placeholder="Short tagline for the occasion hero banner..."
                value={form.description}
                onChange={(e) => handleField('description', e.target.value)}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 bg-choco-50/50 p-4 rounded-2xl border border-choco-100">
              <div>
                <label className="label text-xs">Start Date <span className="text-choco-400 font-normal">(optional)</span></label>
                <input type="date" className="input-field text-xs" value={form.startDate} onChange={(e) => handleField('startDate', e.target.value)} />
              </div>
              <div>
                <label className="label text-xs">End Date <span className="text-choco-400 font-normal">(optional, auto-expires after)</span></label>
                <input type="date" className="input-field text-xs" value={form.endDate} onChange={(e) => handleField('endDate', e.target.value)} />
              </div>
            </div>

            {/* Theme Colors & Live Preview */}
            <div className="space-y-3">
              <label className="label mb-1">Theme Color Palette & Live Preview</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-choco-600 font-medium block mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.themeColors.primary}
                      onChange={(e) => handleColorField('primary', e.target.value)}
                      className="w-9 h-9 rounded-lg cursor-pointer border border-choco-200"
                    />
                    <input
                      type="text"
                      value={form.themeColors.primary}
                      onChange={(e) => handleColorField('primary', e.target.value)}
                      className="input-field text-xs font-mono py-1 px-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-choco-600 font-medium block mb-1">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.themeColors.secondary}
                      onChange={(e) => handleColorField('secondary', e.target.value)}
                      className="w-9 h-9 rounded-lg cursor-pointer border border-choco-200"
                    />
                    <input
                      type="text"
                      value={form.themeColors.secondary}
                      onChange={(e) => handleColorField('secondary', e.target.value)}
                      className="input-field text-xs font-mono py-1 px-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-choco-600 font-medium block mb-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.themeColors.background}
                      onChange={(e) => handleColorField('background', e.target.value)}
                      className="w-9 h-9 rounded-lg cursor-pointer border border-choco-200"
                    />
                    <input
                      type="text"
                      value={form.themeColors.background}
                      onChange={(e) => handleColorField('background', e.target.value)}
                      className="input-field text-xs font-mono py-1 px-2"
                    />
                  </div>
                </div>
              </div>

              {/* LIVE THEME BANNER PREVIEW */}
              <div
                style={{
                  backgroundColor: form.themeColors.background,
                  borderColor: form.themeColors.secondary,
                }}
                className="p-5 rounded-2xl border-2 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{form.emoji}</span>
                  <div>
                    <h4 style={{ color: form.themeColors.primary }} className="font-display text-lg font-bold">
                      {form.occasionName || 'Occasion Title'}
                    </h4>
                    <p style={{ color: form.themeColors.primary }} className="text-xs opacity-80">
                      {form.description || 'Tagline banner preview'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Image */}
            <div>
              <label className="label">Banner Image <span className="text-choco-400 font-normal">(recommended 1200×400px)</span></label>
              {bannerPreview && (
                <div className="relative mb-2 rounded-xl overflow-hidden border border-choco-200">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    onError={() => setBannerPreview('')}
                    className="w-full h-36 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => { setBannerFile(null); setBannerPreview(''); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-md transition-transform hover:scale-110"
                    title="Remove Banner"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div
                onClick={() => bannerRef.current?.click()}
                className="border-2 border-dashed border-choco-200 hover:border-choco-400 rounded-2xl p-4 text-center cursor-pointer transition-colors hover:bg-choco-50/50"
              >
                <span className="text-2xl block mb-1">🖼️</span>
                <p className="text-sm text-choco-600">Click to upload banner image</p>
                <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
              </div>
            </div>

            {/* 4 PRODUCT PICKER SECTIONS */}
            <div className="space-y-4 pt-2">
              <h3 className="font-display font-bold text-choco-900 text-base">🛍️ Attached Products by Section</h3>

              {/* 1. Special Collection */}
              <ProductPickerSection
                title="Special Collection Products"
                emoji="✨"
                selectedIds={productsCategory.special}
                onToggle={(id) => toggleCategoryProduct('special', id)}
                allProducts={allProducts}
                search={searchSpecial}
                setSearch={setSearchSpecial}
              />

              {/* 2. Hampers */}
              <ProductPickerSection
                title="Hamper Bundles"
                emoji="🎁"
                selectedIds={productsCategory.hampers}
                onToggle={(id) => toggleCategoryProduct('hampers', id)}
                allProducts={allProducts}
                search={searchHampers}
                setSearch={setSearchHampers}
              />

              {/* 3. Customized Wrappers */}
              <ProductPickerSection
                title="Customized Wrappers"
                emoji="🎀"
                selectedIds={productsCategory.customWrappers}
                onToggle={(id) => toggleCategoryProduct('customWrappers', id)}
                allProducts={allProducts}
                search={searchCustom}
                setSearch={setSearchCustom}
              />

              {/* 4. Normal Products */}
              <ProductPickerSection
                title="Everyday Favorites"
                emoji="🍫"
                selectedIds={productsCategory.normal}
                onToggle={(id) => toggleCategoryProduct('normal', id)}
                allProducts={allProducts}
                search={searchNormal}
                setSearch={setSearchNormal}
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-choco-100 px-6 py-4 rounded-b-3xl flex gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={(e) => handleSubmit(e, 'draft')}
              className="btn-secondary py-3 flex-1 font-semibold"
            >
              📝 Save as Draft
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={(e) => handleSubmit(e, 'published')}
              className="btn-primary py-3 flex-1 font-semibold"
            >
              🚀 Publish Now
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Main AdminCampaigns Component ───────────────────────────────────────────
const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalCampaign, setModalCampaign] = useState(null); // null=closed, false=new, obj=edit
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([getCampaigns(), getProducts({ limit: 200 })]);
      setCampaigns(cRes.data.campaigns || []);
      setAllProducts(pRes.data.products || []);
    } catch {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id) => {
    setToggling(id);
    try {
      const res = await togglePublishCampaign(id);
      const updatedStatus = res.data.status;
      setCampaigns((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: updatedStatus } : c))
      );
      toast.success(`Campaign status updated to ${updatedStatus}! 🎉`);
    } catch {
      toast.error('Failed to toggle status');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete campaign "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteCampaign(id);
      setCampaigns((p) => p.filter((c) => c._id !== id));
      toast.success('Campaign deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = (saved) => {
    setCampaigns((prev) => {
      const exists = prev.find((c) => c._id === saved._id);
      if (exists) return prev.map((c) => (c._id === saved._id ? saved : c));
      return [saved, ...prev];
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-choco-900">🎉 Occasion Campaigns</h1>
          <p className="text-choco-500 mt-1 text-sm">Manage dynamic festival & special day landing pages</p>
        </div>
        <button onClick={() => setModalCampaign(false)} id="add-campaign-btn" className="btn-primary">
          ➕ New Campaign
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-choco-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-choco-100">
          <span className="text-6xl block mb-4">🎉</span>
          <h3 className="font-display text-xl font-bold text-choco-900 mb-2">No campaigns created yet</h3>
          <p className="text-choco-500 mb-6">Create your first occasion campaign for Mother's Day, Diwali, or Valentine's Day!</p>
          <button onClick={() => setModalCampaign(false)} className="btn-primary">
            ➕ Create Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => {
            const totalProducts =
              (c.products?.special?.length || 0) +
              (c.products?.hampers?.length || 0) +
              (c.products?.customWrappers?.length || 0) +
              (c.products?.normal?.length || 0);

            return (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-choco-100 shadow-sm overflow-hidden"
              >
                <div className="flex items-stretch">
                  {/* Uploaded Banner Image or Clean Emoji Badge */}
                  {c.bannerImageUrl ? (
                    <div className="w-32 flex-shrink-0 hidden sm:block overflow-hidden relative border-r border-choco-100">
                      <img
                        src={getImageUrl(c.bannerImageUrl)}
                        alt={c.occasionName}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      style={{ backgroundColor: c.themeColors?.background || '#FFFBEB' }}
                      className="w-24 flex-shrink-0 hidden sm:flex items-center justify-center border-r border-choco-100"
                    >
                      <span className="text-3xl">{c.emoji || '🎉'}</span>
                    </div>
                  )}

                  <div className="flex-1 p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-2xl">{c.emoji || '🎉'}</span>
                        <h3 className="font-display font-bold text-choco-900 text-lg leading-tight">
                          {c.occasionName}
                        </h3>
                        <span className={`badge text-xs border px-2.5 py-0.5 rounded-full font-bold ${getStatusStyle(c.status)}`}>
                          {c.status}
                        </span>
                      </div>

                      <p className="text-choco-500 text-sm mt-1 line-clamp-1">{c.description || 'No tagline'}</p>

                      <div className="flex flex-wrap gap-4 mt-2.5 text-xs text-choco-500 font-medium">
                        <span>🔗 <code className="bg-choco-50 px-1.5 py-0.5 rounded text-choco-700 font-mono">/occasions/{c.slug}</code></span>
                        <span>📅 {formatDate(c.startDate)} → {formatDate(c.endDate)}</span>
                        <span>🛍️ {totalProducts} items attached</span>
                      </div>
                    </div>

                    {/* Actions & Quick Toggle */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Quick Publish / Draft Switch */}
                      <button
                        onClick={() => handleTogglePublish(c._id)}
                        disabled={toggling === c._id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                          c.status === 'published'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                        }`}
                      >
                        {toggling === c._id ? '⏳...' : c.status === 'published' ? '🟢 Published' : '🟡 Draft'}
                      </button>

                      <button
                        onClick={() => setModalCampaign(c)}
                        className="p-2 text-choco-600 hover:text-choco-900 hover:bg-choco-100 rounded-xl transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(c._id, c.occasionName)}
                        disabled={deleting === c._id}
                        className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        {deleting === c._id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modalCampaign !== null && (
          <CampaignModal
            campaign={modalCampaign || undefined}
            onClose={() => setModalCampaign(null)}
            onSaved={handleSaved}
            allProducts={allProducts}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCampaigns;
