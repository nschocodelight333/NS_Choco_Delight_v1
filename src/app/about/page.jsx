'use client';

import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="py-16 min-h-screen">
      <div className="page-container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-7xl block mb-4 float-animation">🍫</span>
          <h1 className="section-title mb-4">Made with Heart,<br />Meant to Celebrate.</h1>
          <p className="text-choco-600 text-lg leading-relaxed mb-6">
            Welcome to <strong className="text-choco-900 font-semibold">NS Choco Delight</strong> where every chocolate tells a story of love, craft, and celebration.
          </p>
          <p className="text-choco-600 leading-relaxed mb-6">
            Founded with a passion for creating truly memorable sweets, we specialize in handcrafted, premium chocolates
            made with high-quality ingredients and infinite care. Whether you are craving our trending Pistachio Kunafa Chocolate,
            bite-sized delights for your daily sweet tooth, or custom-shaped boxes for weddings and birthdays — we bring your dream chocolates to life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <p className="text-choco-600 leading-relaxed mb-4">
              From birthdays and anniversaries to Diwali gifts and wedding favors, our chocolates are made fresh, with only the
              finest ingredients.
            </p>
            <p className="text-choco-600 leading-relaxed mb-4">
              Our signature creations — like the Pistachio Kunafa Chocolate and Nutella Kunafa
              Chocolate — blend Middle Eastern dessert traditions with the artistry of fine
              chocolate making.
            </p>
          </div>
          <div className="bg-choco-gradient rounded-3xl p-8 text-center">
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '16+', label: 'Unique Flavors' },
                { num: '100%', label: 'Homemade' },
                { num: '500+', label: 'Happy Customers' },
                { num: '5⭐', label: 'Rated' },
              ].map((item) => (
                <div key={item.label} className="bg-white/10 rounded-2xl p-4">
                  <p className="font-display text-3xl font-bold text-gold-400">{item.num}</p>
                  <p className="text-choco-200 text-sm mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
