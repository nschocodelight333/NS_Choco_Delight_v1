import mongoose from 'mongoose';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const campaignSchema = new mongoose.Schema(
  {
    occasionName: {
      type: String,
      required: [true, 'Occasion name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    emoji: {
      type: String,
      default: '🎉',
    },
    themeColors: {
      primary: { type: String, default: '#7C2D12' },
      secondary: { type: String, default: '#D97706' },
      background: { type: String, default: '#FFFBEB' },
    },
    bannerImageUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    products: {
      special: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      hampers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      customWrappers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      normal: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    },
  },
  { timestamps: true }
);

campaignSchema.pre('validate', function (next) {
  if (this.occasionName && !this.slug) {
    this.slug = slugify(this.occasionName);
  }
  next();
});

campaignSchema.set('toJSON', { virtuals: true });
campaignSchema.set('toObject', { virtuals: true });

export default mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);
