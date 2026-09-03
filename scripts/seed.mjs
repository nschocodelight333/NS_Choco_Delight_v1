import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

const productSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    category: { type: String, enum: ['Normal Shape or Heart', 'Bites'] },
    shapeOptions: [String],
    price: Number,
    images: [String],
    stock: Number,
    ratingAverage: { type: Number, default: 5 },
    numReviews: { type: Number, default: 12 },
    isFeatured: Boolean,
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const sampleProducts = [
  {
    name: 'Pistachio Kunafa Heart Chocolate',
    description: 'Crispy golden roasted kunafa pastry combined with rich pistachio butter & wrapped in premium Belgian dark milk chocolate.',
    category: 'Normal Shape or Heart',
    shapeOptions: ['Heart', 'Normal'],
    price: 350,
    images: ['https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600&q=80'],
    stock: 50,
    ratingAverage: 5.0,
    numReviews: 28,
    isFeatured: true,
    isAvailable: true,
  },
  {
    name: 'Nutella Kunafa Delight',
    description: 'Decadent hazelnut Nutella paired with crunchy kunafa in a heart-shaped artisanal mold.',
    category: 'Normal Shape or Heart',
    shapeOptions: ['Heart'],
    price: 320,
    images: ['https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80'],
    stock: 40,
    ratingAverage: 4.9,
    numReviews: 19,
    isFeatured: true,
    isAvailable: true,
  },
  {
    name: 'Dark Chocolate Almond Heart',
    description: '70% Pure dark cocoa shell loaded with whole roasted almonds and subtle sea salt flakes.',
    category: 'Normal Shape or Heart',
    shapeOptions: ['Heart', 'Normal'],
    price: 280,
    images: ['https://images.unsplash.com/photo-1511381939415-e44015466834?w=600&q=80'],
    stock: 60,
    ratingAverage: 4.8,
    numReviews: 15,
    isFeatured: true,
    isAvailable: true,
  },
  {
    name: 'Gourmet Chocolate Bites Box (12 Pcs)',
    description: 'Bite-sized handcrafted chocolate truffles infused with caramel, coffee, and praline fillings.',
    category: 'Bites',
    shapeOptions: [],
    price: 450,
    images: ['https://images.unsplash.com/photo-1526080652727-5b77f74eacd2?w=600&q=80'],
    stock: 30,
    ratingAverage: 5.0,
    numReviews: 32,
    isFeatured: true,
    isAvailable: true,
  },
  {
    name: 'Classic Milk Chocolate Bar',
    description: 'Smooth, creamy, traditional homemade milk chocolate made with rich dairy and fine cocoa butter.',
    category: 'Normal Shape or Heart',
    shapeOptions: ['Normal'],
    price: 180,
    images: ['https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&q=80'],
    stock: 100,
    ratingAverage: 4.7,
    numReviews: 24,
    isFeatured: false,
    isAvailable: true,
  },
  {
    name: 'Assorted Mini Bites Pack (24 Pcs)',
    description: 'A vibrant collection of mini chocolate bites featuring dark, milk, and white chocolate flavors.',
    category: 'Bites',
    shapeOptions: [],
    price: 650,
    images: ['https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&q=80'],
    stock: 25,
    ratingAverage: 4.9,
    numReviews: 41,
    isFeatured: true,
    isAvailable: true,
  },
];

async function seedDB() {
  try {
    console.log('⏳ Connecting to MongoDB Atlas database...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!');

    const existing = await Product.countDocuments();
    console.log(`Current product count: ${existing}`);

    if (existing === 0) {
      await Product.insertMany(sampleProducts);
      console.log('🎉 Seeded 6 handcrafted chocolate products into database!');
    } else {
      console.log('ℹ️ Products already exist. Adding sample products if needed...');
      await Product.insertMany(sampleProducts);
      console.log('🎉 Added 6 sample products!');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedDB();
