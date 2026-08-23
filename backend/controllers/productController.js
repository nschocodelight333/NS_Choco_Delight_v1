const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// @desc    Get all products with filters/search/sort/pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      rating,
      sort,
      page = 1,
      limit = 12,
      featured,
    } = req.query;

    const query = {};

    // Filters
    if (category) {
      if (category.toLowerCase().includes('normal') || category.toLowerCase().includes('heart')) {
        query.category = 'Normal Shape or Heart';
      } else if (category.toLowerCase().includes('bite')) {
        query.category = 'Bites';
      } else {
        query.category = { $regex: category, $options: 'i' };
      }
    }

    if (featured === 'true') query.isFeatured = true;

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (rating) query.ratingAverage = { $gte: Number(rating) };

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { ratingAverage: -1, numReviews: -1, createdAt: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    let total = await Product.countDocuments(query);
    let rawProducts = [];

    if (total > 0) {
      const pages = Math.ceil(total / Number(limit)) || 1;
      let currentPage = Number(page);
      if (currentPage > pages) currentPage = 1;
      const skip = (currentPage - 1) * Number(limit);

      rawProducts = await Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit));
    } else {
      // Fallback: If specific search/category returned 0, load default products so page is not empty
      total = await Product.countDocuments({});
      const skip = 0;
      rawProducts = await Product.find({})
        .sort(sortOption)
        .limit(Number(limit));
    }

    const pages = Math.ceil(total / Number(limit)) || 1;
    let currentPage = Number(page);

    const products = rawProducts.map((p) => {
      const pObj = p.toObject();
      pObj.images = (pObj.images || []).map(cleanImagePath);
      return pObj;
    });

    res.json({
      success: true,
      total,
      page: currentPage,
      pages,
      products,
    });
  } catch (err) {
    console.error('❌ getProducts Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products', products: [], total: 0 });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  const pObj = product.toObject();
  pObj.images = (pObj.images || []).map(cleanImagePath);
  res.json({ success: true, product: pObj });
};

// @desc    Create product
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res) => {
  const { name, description, category, shapeOptions, price, stock, isFeatured } = req.body;

  // Handle uploaded images (Cloudinary URLs or local static URLs)
  const images = req.files
    ? req.files.map((f) => {
        if (f.path && (f.path.startsWith('http://') || f.path.startsWith('https://'))) {
          return f.path;
        }
        return `/uploads/${f.filename}`;
      })
    : [];

  // Parse shapeOptions if sent as JSON string
  let parsedShapeOptions = [];
  if (shapeOptions) {
    parsedShapeOptions = typeof shapeOptions === 'string' ? JSON.parse(shapeOptions) : shapeOptions;
  }

  const product = await Product.create({
    name,
    description,
    category,
    shapeOptions: parsedShapeOptions,
    price: Number(price),
    stock: Number(stock),
    images,
    isFeatured: isFeatured === 'true' || isFeatured === true,
  });

  res.status(201).json({ success: true, product });
};

const cleanImagePath = (img) => {
  if (!img || typeof img !== 'string') return img;
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/uploads/')) {
    return img;
  }
  const filename = img.split(/[\/\\]/).pop();
  return `/uploads/${filename}`;
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  const { name, description, category, shapeOptions, price, stock, isFeatured, isAvailable, removeImages } = req.body;

  if (name) product.name = name;
  if (description) product.description = description;
  if (category) product.category = category;
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
  if (isAvailable !== undefined) product.isAvailable = isAvailable === 'true' || isAvailable === true;
  if (shapeOptions) {
    product.shapeOptions = typeof shapeOptions === 'string' ? JSON.parse(shapeOptions) : shapeOptions;
  }

  // Clean existing images in case any Windows paths were stored
  product.images = (product.images || []).map(cleanImagePath);

  // Remove specific images requested by admin
  if (removeImages) {
    const toRemove = typeof removeImages === 'string' ? JSON.parse(removeImages) : removeImages;
    for (const imgUrl of toRemove) {
      try {
        const publicId = imgUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        // Continue even if Cloudinary delete fails
      }
    }
    const cleanToRemove = toRemove.map(cleanImagePath);
    product.images = product.images.filter((img) => !cleanToRemove.includes(img) && !toRemove.includes(img));
  }

  // Handle new image uploads (ensure /uploads/ format, not disk path)
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((f) => {
      if (f.path && (f.path.startsWith('http://') || f.path.startsWith('https://'))) {
        return f.path;
      }
      return `/uploads/${f.filename}`;
    });
    product.images = [...product.images, ...newImages];
  }

  await product.save();
  res.json({ success: true, product });
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  // Delete images from Cloudinary
  for (const imgUrl of product.images) {
    try {
      const publicId = imgUrl.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    } catch (e) {
      // Continue even if Cloudinary delete fails
    }
  }

  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted successfully.' });
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
