export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/auth';

const ORIGINAL_PRODUCTS = [
  {
    name: 'Pistachio Kunafa Chocolate',
    description:
      'A luxurious homemade chocolate filled with crunchy pistachio kunafa — a golden Middle Eastern pastry shredded fine and toasted to perfection. The nutty pistachio aroma meets rich milk chocolate in every bite. Available in Normal and Heart shape — perfect for gifting on special occasions.',
    category: 'Normal Shape or Heart',
    shapeOptions: ['Normal', 'Heart'],
    price: 260,
    stock: 50,
    images: ['https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&q=80'],
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
    images: ['https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&q=80'],
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
    images: ['https://images.unsplash.com/photo-1582176604856-e822b370600a?w=800&q=80'],
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
    images: ['https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80'],
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
    images: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80'],
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
    images: ['https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&q=80'],
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
    images: ['https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&q=80'],
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
    images: ['https://images.unsplash.com/photo-1575377222312-dd1a63a51638?w=800&q=80'],
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
    images: ['https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&q=80'],
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
    images: ['https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&q=80'],
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
    images: ['https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80'],
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
    images: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80'],
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
    images: ['https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&q=80'],
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
    images: ['https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&q=80'],
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
    images: ['https://images.unsplash.com/photo-1575377222312-dd1a63a51638?w=800&q=80'],
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
    images: ['https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=800&q=80'],
    isFeatured: false,
    isAvailable: true,
  },
];

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');

    // Auto-seed if database is empty
    const totalCount = await Product.countDocuments();
    if (totalCount === 0) {
      await Product.insertMany(ORIGINAL_PRODUCTS);
    }

    let query = { isAvailable: true };

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    let productQuery = Product.find(query);

    if (sort === 'price-low' || sort === 'price_asc') {
      productQuery = productQuery.sort({ price: 1 });
    } else if (sort === 'price-high' || sort === 'price_desc') {
      productQuery = productQuery.sort({ price: -1 });
    } else if (sort === 'rating') {
      productQuery = productQuery.sort({ ratingAverage: -1 });
    } else {
      productQuery = productQuery.sort({ createdAt: -1 });
    }

    const products = await productQuery;

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error', products: [] },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized as admin' },
        { status: 403 }
      );
    }

    await connectDB();
    const body = await req.json();

    const product = await Product.create(body);

    return NextResponse.json({
      success: true,
      product,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
