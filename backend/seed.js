/**
 * NS Choco Delight — Product Seed Script
 *
 * Usage:
 *   node seed.js          → adds products that don't exist yet (safe to re-run)
 *   node seed.js --fresh  → WIPES all products then re-seeds (use with caution)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  // ─── Category: Normal Shape or Heart ─────────────────────────────────
  {
    name: 'Pistachio Kunafa Chocolate',
    description:
      'A luxurious homemade chocolate filled with crunchy pistachio kunafa — a golden Middle Eastern pastry shredded fine and toasted to perfection. The nutty pistachio aroma meets rich milk chocolate in every bite. Available in Normal and Heart shape — perfect for gifting on special occasions.',
    category: 'Normal Shape or Heart',
    shapeOptions: ['Normal', 'Heart'],
    price: 260,
    stock: 50,
    images: [],
    isFeatured: true,
    isAvailable: true,
  },
  {
    name: 'Nutella Kunafa Chocolate',
    description:
      'Rich Nutella hazelnut cream swirled into a crispy golden kunafa shell, then enrobed in smooth premium milk chocolate. A crowd-favourite fusion of Italian and Middle Eastern flavours — indulgent, creamy, and utterly irresistible. Makes an unforgettable gift.',
    category: 'Normal Shape or Heart',
    shapeOptions: ['Normal', 'Heart'],
    price: 300,
    stock: 40,
    images: [],
    isFeatured: true,
    isAvailable: true,
  },
  {
    name: 'Oreo Chocolate',
    description:
      'Crunchy Oreo cookie pieces lovingly encased in a smooth, glossy chocolate shell. The satisfying crunch of the classic biscuit meets the sweetness of homemade chocolate — a match made in dessert heaven. A must-have for the cookie lover in your life.',
    category: 'Normal Shape or Heart',
    shapeOptions: ['Normal', 'Heart'],
    price: 120,
    stock: 80,
    images: [],
    isFeatured: false,
    isAvailable: true,
  },
  {
    name: 'Plain Chocolate',
    description:
      'Classic homemade milk chocolate, made fresh using the finest cocoa and real cream. Smooth, melt-in-your-mouth, and beautifully simple. A timeless treat that suits every occasion — from everyday indulgence to a heartfelt gift.',
    category: 'Normal Shape or Heart',
    shapeOptions: ['Normal', 'Heart'],
    price: 100,
    stock: 100,
    images: [],
    isFeatured: false,
    isAvailable: true,
  },
  {
    name: 'Plain White Chocolate',
    description:
      'Handcrafted pure white chocolate made with real cocoa butter, milk solids, and a touch of vanilla. Delicately sweet with a creamy, buttery finish. Elegant and sophisticated — ideal for weddings, baby showers, and festive gifting.',
    category: 'Normal Shape or Heart',
    shapeOptions: ['Normal', 'Heart'],
    price: 120,
    stock: 80,
    images: [],
    isFeatured: false,
    isAvailable: true,
  },
  {
    name: 'Dark Chocolate',
    description:
      'Intense, deep, and gloriously bittersweet — our dark chocolate is for the true connoisseur. Made with high-cocoa content for a rich, complex flavour profile with notes of roasted coffee and dried fruit. Rich in antioxidants and completely addictive.',
    category: 'Normal Shape or Heart',
    shapeOptions: ['Normal', 'Heart'],
    price: 130,
    stock: 70,
    images: [],
    isFeatured: true,
    isAvailable: true,
  },
  {
    name: 'Dry Fruits Chocolate',
    description:
      'A festive medley of premium cashews, golden raisins, and whole almonds, nestled inside smooth milk chocolate. Wholesome, nutritious, and indulgent all at once. A popular choice for Diwali gift boxes, Eid hampers, and celebrations of all kinds.',
    category: 'Normal Shape or Heart',
    shapeOptions: ['Normal', 'Heart'],
    price: 190,
    stock: 60,
    images: [],
    isFeatured: true,
    isAvailable: true,
  },
  {
    name: 'Almond Chocolate',
    description:
      'Whole roasted almonds enrobed in layers of velvety, hand-tempered milk chocolate. The satisfying crunch of the almond with the creamy sweetness of chocolate is a timeless pairing. A classic for a reason — loved by all ages.',
    category: 'Normal Shape or Heart',
    shapeOptions: ['Normal', 'Heart'],
    price: 120,
    stock: 90,
    images: [],
    isFeatured: false,
    isAvailable: true,
  },
  {
    name: 'Gems Chocolate',
    description:
      'Fun, colourful, candy-coated chocolate gems encased in a smooth chocolate shell. A burst of rainbow colour and sweetness that brings out the child in everyone. Perfect for birthday return gifts, kids\' parties, and putting smiles on faces of all ages.',
    category: 'Normal Shape or Heart',
    shapeOptions: ['Normal', 'Heart'],
    price: 100,
    stock: 100,
    images: [],
    isFeatured: false,
    isAvailable: true,
  },

  // ─── Category: Bites ──────────────────────────────────────────────────
  {
    name: 'Pistachio Kunafa Chocolate (Bite)',
    description:
      'All the magic of our signature Pistachio Kunafa Chocolate — the crunchy kunafa filling, the roasted pistachio crumble, the smooth chocolate shell — packed into one irresistible bite-sized piece. Perfect for mixed sweet boxes and party platters.',
    category: 'Bites',
    shapeOptions: [],
    price: 15,
    stock: 200,
    images: [],
    isFeatured: false,
    isAvailable: true,
  },
  {
    name: 'Plain Chocolate (Bite)',
    description:
      'A single small piece of our homemade milk chocolate. Smooth, rich, and satisfying. Ideal for buying in bulk for gifting, office treats, or as a sweet addition to mixed chocolate gift boxes and mithai trays.',
    category: 'Bites',
    shapeOptions: [],
    price: 10,
    stock: 500,
    images: [],
    isFeatured: false,
    isAvailable: true,
  },
  {
    name: 'Plain White Chocolate (Bite)',
    description:
      'Mini melt-in-your-mouth white chocolate bites, made with real cocoa butter and a hint of vanilla. Creamy, sweet, and luxurious in a tiny package. A crowd pleaser at weddings, baby showers, and festive events.',
    category: 'Bites',
    shapeOptions: [],
    price: 10,
    stock: 500,
    images: [],
    isFeatured: false,
    isAvailable: true,
  },
  {
    name: 'Dark Chocolate (Bite)',
    description:
      'Intense dark chocolate in one small, satisfying bite. Perfectly bittersweet, with a clean cocoa finish. A sophisticated addition to any mixed chocolate assortment or corporate gift box.',
    category: 'Bites',
    shapeOptions: [],
    price: 10,
    stock: 300,
    images: [],
    isFeatured: false,
    isAvailable: true,
  },
  {
    name: 'Dry Fruits Chocolate (Bite)',
    description:
      'Bite-sized pieces packed with a mix of cashews, raisins, and almonds in smooth milk chocolate. Wholesome and festive — ideal for Diwali mithai boxes, celebration trays, and hampers where variety is the key.',
    category: 'Bites',
    shapeOptions: [],
    price: 15,
    stock: 200,
    images: [],
    isFeatured: false,
    isAvailable: true,
  },
  {
    name: 'Almond Chocolate (Bite)',
    description:
      'A single roasted almond coated in smooth, glossy milk chocolate. Crunchy, creamy, and perfectly portioned. A classic chocolate bite that never goes out of style — great for gifting in bulk or mixing into assorted boxes.',
    category: 'Bites',
    shapeOptions: [],
    price: 10,
    stock: 400,
    images: [],
    isFeatured: false,
    isAvailable: true,
  },
  {
    name: 'Cashew Chocolate (Bite)',
    description:
      'Whole premium cashews enrobed in rich, hand-tempered milk chocolate. Buttery cashew meets velvety chocolate in one rich, crunchy bite. Absolutely addictive — a favourite at every celebration from Eid to Christmas.',
    category: 'Bites',
    shapeOptions: [],
    price: 10,
    stock: 400,
    images: [],
    isFeatured: false,
    isAvailable: true,
  },
];

const seedProducts = async (isFresh = false) => {
  if (isFresh) {
    await Product.deleteMany({});
    console.log('🗑️  Cleared all existing products');
    await Product.insertMany(products);
    console.log(`🍫 Seeded ${products.length} products successfully!`);
  } else {
    let inserted = 0;
    for (const p of products) {
      const exists = await Product.findOne({ name: p.name });
      if (!exists) {
        await Product.create(p);
        inserted++;
      }
    }
    console.log(`🍫 Seeded ${inserted} new products (Total catalog: ${products.length}).`);
  }
};

const seed = async () => {
  const isFresh = process.argv.includes('--fresh');
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/choco-delight';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB for seeding');
    await seedProducts(isFresh);
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seed();
}

module.exports = { seedProducts, products };
