import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { submitCustomOrder } from '../api/customOrders';

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

const BASE_TYPES = [
  { id: 'milk', label: 'Milk Chocolate', icon: '🥛', desc: 'Smooth & creamy classic' },
  { id: 'dark', label: 'Dark Chocolate (70%)', icon: '🍫', desc: 'Rich & bittersweet' },
  { id: 'white', label: 'Pure White Chocolate', icon: '🍦', desc: 'Vanilla & cocoa butter' },
  { id: 'sugar-free', label: 'Sugar-Free Dark', icon: '🌿', desc: 'Healthy & delicious' },
  { id: 'ruby', label: 'Ruby Chocolate', icon: '🌸', desc: 'Fruity & berry-infused' },
];

const SHAPES = [
  { id: 'heart', label: 'Heart Shape', icon: '❤️' },
  { id: 'bar', label: 'Normal Bar', icon: '🍫' },
  { id: 'round', label: 'Round Medallion', icon: '🟢' },
  { id: 'bites', label: 'Bites Assortment', icon: '🍬' },
  { id: 'custom-sculpture', label: 'Custom Mold / Sculpture', icon: '🎨' },
];

const FLAVORS = [
  { id: 'kunafa-pistachio', label: 'Pistachio Kunafa', icon: '🥐' },
  { id: 'kunafa-nutella', label: 'Nutella Kunafa', icon: '🌰' },
  { id: 'almond', label: 'Roasted Almond', icon: '🥜' },
  { id: 'oreo', label: 'Crunchy Oreo', icon: '🍪' },
  { id: 'dry-fruits', label: 'Dry Fruits Medley', icon: '🍇' },
  { id: 'caramel', label: 'Salted Caramel', icon: '🍯' },
  { id: 'plain', label: 'Classic Plain Cocoa', icon: '✨' },
];

const WEIGHTS = ['100g', '250g', '500g', '1 kg', 'Custom Bulk / Event Order'];

const PACKAGING_TYPES = [
  { id: 'heart-box', label: 'Heart Gift Box', icon: '💝' },
  { id: 'luxury-ribbon', label: 'Luxury Ribbon Box', icon: '🎀' },
  { id: 'gold-festive', label: 'Festive Gold Hamper', icon: '✨' },
  { id: 'eco-kraft', label: 'Eco Kraft Box', icon: '📦' },
];

const CustomizeChocolate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [form, setForm] = useState({
    title: '',
    baseType: 'milk',
    shape: 'heart',
    flavor: 'kunafa-pistachio',
    weight: '250g',
    packaging: 'luxury-ribbon',
    customMessage: '',
    notes: '',
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFiles = (files) => {
    const valid = Array.from(files).filter((f) => {
      if (!f.type.startsWith('image/')) { toast.error(`${f.name} is not an image`); return false; }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) { toast.error(`${f.name} exceeds 5MB`); return false; }
      return true;
    });
    if (images.length + valid.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    setImages((p) => [...p, ...valid]);
    setPreviews((p) => [...p, ...valid.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (idx) => {
    setImages((p) => p.filter((_, i) => i !== idx));
    setPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!form.title.trim()) return toast.error('Please give your request a title');

    const selectedBase = BASE_TYPES.find((b) => b.id === form.baseType)?.label;
    const selectedShape = SHAPES.find((s) => s.id === form.shape)?.label;
    const selectedFlavor = FLAVORS.find((f) => f.id === form.flavor)?.label;
    const selectedPkg = PACKAGING_TYPES.find((p) => p.id === form.packaging)?.label;

    const fullDescription = `
✨ CUSTOM CHOCOLATE SPECIFICATIONS:
- Base Type: ${selectedBase}
- Shape: ${selectedShape}
- Flavor / Filling: ${selectedFlavor}
- Weight / Quantity: ${form.weight}
- Packaging Style: ${selectedPkg}
${form.customMessage ? `- Custom Message to Print/Write: "${form.customMessage}"` : ''}
${form.notes ? `- Additional Preferences & Notes: ${form.notes}` : ''}
    `.trim();

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', fullDescription);
      images.forEach((img) => fd.append('referenceImages', img));

      await submitCustomOrder(fd);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* ─── Hero ────────────────────────────────────────────── */}
      <section className="bg-choco-gradient py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-gold-500/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-choco-700/25 blur-3xl" />
        </div>
        <div className="page-container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-500/20 border border-gold-500/30 rounded-full text-gold-400 text-sm font-medium mb-6">
              ✨ Interactive Chocolate Builder
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-cream mb-4">
              Customize Your Chocolate
            </h1>
            <p className="text-choco-200 text-lg max-w-2xl mx-auto leading-relaxed">
              Design your dream chocolate by choosing shape, flavor, base type, custom text, packaging, and reference photos!
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none"><path d="M0 60H1440V30C1200 0 960 60 720 30C480 0 240 60 0 30V60Z" fill="#FFF8F0" /></svg>
        </div>
      </section>

      <section className="py-16 bg-cream">
        <div className="page-container max-w-3xl">
          {submitted ? (
            /* ─── Success State ─────────────────────────── */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-white rounded-3xl shadow-choco p-12"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="font-display text-3xl font-bold text-choco-900 mb-3">Custom Request Submitted!</h2>
              <p className="text-choco-500 text-lg max-w-md mx-auto leading-relaxed mb-8">
                We've received your customization specifications. Our chocolatiers will review it and send a price quote shortly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/my-custom-orders" className="btn-primary px-8 py-3">
                  📋 View My Custom Requests
                </Link>
                <Link to="/products" className="btn-secondary px-8 py-3">
                  Browse Shop
                </Link>
              </div>
            </motion.div>
          ) : (
            /* ─── Builder Form ────────────────────────────── */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex gap-4">
                <span className="text-2xl flex-shrink-0">💡</span>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">How Custom Orders Work</p>
                  <ol className="text-amber-700 text-sm mt-1 space-y-0.5 list-decimal ml-4">
                    <li>Customize your chocolate base, shape, flavor, and packaging below</li>
                    <li>Upload reference photos or custom images to print on chocolate</li>
                    <li>We'll review your specs & send a custom price quote to your account</li>
                  </ol>
                </div>
              </div>

              {!user && (
                <div className="bg-choco-50 border border-choco-200 rounded-2xl p-4 mb-6 text-center">
                  <p className="text-choco-700 text-sm">
                    <Link to="/login" className="text-choco-900 font-semibold underline">Log in</Link> to submit your custom request.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} id="customize-chocolate-form" className="bg-white rounded-3xl shadow-choco p-8 space-y-8">
                {/* 1. Title */}
                <div>
                  <label className="label" htmlFor="custom-title">
                    Request Title *
                    <span className="text-choco-400 font-normal ml-1">(e.g. Anniversary Kunafa Heart)</span>
                  </label>
                  <input
                    id="custom-title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Personalized Birthday Kunafa Box"
                    className="input-field"
                    maxLength={100}
                    required
                  />
                </div>

                {/* 2. Base Type Selector */}
                <div>
                  <label className="label mb-3">1. Select Chocolate Base Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {BASE_TYPES.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, baseType: b.id }))}
                        className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                          form.baseType === b.id ? 'border-choco-800 bg-choco-50/80 shadow-sm' : 'border-choco-100 hover:border-choco-300'
                        }`}
                      >
                        <span className="text-2xl mb-2">{b.icon}</span>
                        <div>
                          <p className="font-semibold text-choco-900 text-sm">{b.label}</p>
                          <p className="text-[11px] text-choco-500 mt-0.5">{b.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Shape Selector */}
                <div>
                  <label className="label mb-3">2. Select Chocolate Shape</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SHAPES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, shape: s.id }))}
                        className={`p-4 rounded-2xl border-2 text-center transition-all ${
                          form.shape === s.id ? 'border-choco-800 bg-choco-50/80 shadow-sm font-bold text-choco-900' : 'border-choco-100 hover:border-choco-300 text-choco-700'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{s.icon}</span>
                        <span className="text-xs">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Flavor / Filling Selector */}
                <div>
                  <label className="label mb-3">3. Choose Flavor & Filling</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {FLAVORS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, flavor: f.id }))}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                          form.flavor === f.id ? 'border-choco-800 bg-choco-50/80 shadow-sm font-semibold text-choco-900' : 'border-choco-100 hover:border-choco-300 text-choco-700'
                        }`}
                      >
                        <span className="text-xl mr-2">{f.icon}</span>
                        <span className="text-xs">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Custom Text / Message */}
                <div>
                  <label className="label" htmlFor="customMessage">
                    4. Message to Print / Write on Chocolate
                    <span className="text-choco-400 font-normal ml-1">(optional)</span>
                  </label>
                  <input
                    id="customMessage"
                    name="customMessage"
                    value={form.customMessage}
                    onChange={handleChange}
                    placeholder="e.g. 'Happy 25th Anniversary Love!' or 'Best Mom Ever'"
                    className="input-field"
                  />
                </div>

                {/* 6. Weight & Packaging */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label" htmlFor="weight">5. Weight / Quantity</label>
                    <select
                      id="weight"
                      name="weight"
                      value={form.weight}
                      onChange={handleChange}
                      className="input-field"
                    >
                      {WEIGHTS.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="packaging">6. Packaging Box Style</label>
                    <select
                      id="packaging"
                      name="packaging"
                      value={form.packaging}
                      onChange={handleChange}
                      className="input-field"
                    >
                      {PACKAGING_TYPES.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>{pkg.icon} {pkg.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 7. Reference / Customized Image Upload */}
                <div>
                  <label className="label">
                    7. Upload Customized Photo / Reference Images
                    <span className="text-choco-400 font-normal ml-1">(up to {MAX_IMAGES})</span>
                  </label>
                  <p className="text-xs text-choco-500 mb-3">
                    Upload photos to print on chocolate wrapper, custom photo chocolates, or reference design screenshots.
                  </p>
                  {previews.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-3">
                      {previews.map((src, i) => (
                        <div key={i} className="relative group">
                          <img src={src} alt="Custom Preview" className="w-20 h-20 rounded-xl object-cover border-2 border-choco-200" />
                          <button type="button" onClick={() => removeImage(i)}
                            className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {images.length < MAX_IMAGES && (
                    <div onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed border-choco-200 hover:border-choco-400 rounded-2xl p-6 text-center cursor-pointer transition-colors hover:bg-choco-50/50">
                      <span className="text-3xl block mb-2">📸</span>
                      <p className="text-sm text-choco-600 font-medium">Click to upload custom photo or design artwork</p>
                      <p className="text-xs text-choco-400 mt-1">JPG, PNG, WEBP · Max 5MB each</p>
                      <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                        id="custom-order-images" onChange={(e) => handleFiles(e.target.files)} />
                    </div>
                  )}
                </div>

                {/* 8. Additional Notes */}
                <div>
                  <label className="label" htmlFor="notes">
                    8. Additional Notes / Instructions
                    <span className="text-choco-400 font-normal ml-1">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any dietary restrictions, special date for delivery, or custom requests..."
                    className="input-field resize-none text-sm"
                  />
                </div>

                {/* Info Box */}
                <div className="bg-choco-900 rounded-2xl p-5 text-center">
                  <p className="text-gold-400 font-semibold text-sm">✨ Price Quote Shared After Review</p>
                  <p className="text-choco-200 text-xs mt-1">
                    Our chocolatiers will review your specs and send a price quote directly to your account. You can accept and pay right from your "My Custom Requests" page!
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !user}
                  id="submit-custom-order-btn"
                  className="btn-gold w-full py-4 text-base shadow-gold"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2 justify-center">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                      Submitting Specs & Images...
                    </span>
                  ) : '🍫 Submit My Customization Request'}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CustomizeChocolate;
