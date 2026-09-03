'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { submitCustomOrder } from '@/api/customOrders';

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

export default function CustomizePage() {
  const { user } = useAuth();
  const router = useRouter();
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
    if (!user) return router.push('/login');
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
      <section className="bg-choco-gradient py-20 relative overflow-hidden">
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
      </section>

      <section className="py-16 bg-cream">
        <div className="page-container max-w-3xl">
          {submitted ? (
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
                <Link href="/my-custom-orders" className="btn-primary px-8 py-3">
                  📋 View My Custom Requests
                </Link>
                <Link href="/products" className="btn-secondary px-8 py-3">
                  Browse Shop
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {!user && (
                <div className="bg-choco-50 border border-choco-200 rounded-2xl p-4 mb-6 text-center">
                  <p className="text-choco-700 text-sm">
                    <Link href="/login" className="text-choco-900 font-semibold underline">Log in</Link> to submit your custom request.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} id="customize-chocolate-form" className="bg-white rounded-3xl shadow-choco p-8 space-y-8">
                <div>
                  <label className="label" htmlFor="custom-title">
                    Request Title *
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

                <div>
                  <label className="label mb-3">1. Select Chocolate Base Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {BASE_TYPES.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, baseType: b.id }))}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          form.baseType === b.id ? 'border-choco-800 bg-choco-50/80 shadow-sm' : 'border-choco-100 hover:border-choco-300'
                        }`}
                      >
                        <span className="text-2xl mb-2 block">{b.icon}</span>
                        <p className="font-semibold text-choco-900 text-sm">{b.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

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

                <button
                  type="submit"
                  disabled={submitting || !user}
                  id="submit-custom-order-btn"
                  className="btn-gold w-full py-4 text-base shadow-gold"
                >
                  {submitting ? 'Submitting Specs & Images...' : '🍫 Submit My Customization Request'}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
