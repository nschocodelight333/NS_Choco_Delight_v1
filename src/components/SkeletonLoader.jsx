'use client';

export const ProductCardSkeleton = () => (
  <div className="card overflow-hidden">
    <div className="aspect-square skeleton" />
    <div className="p-4 space-y-3">
      <div className="h-4 skeleton rounded-lg w-3/4" />
      <div className="h-3 skeleton rounded-lg w-1/2" />
      <div className="flex justify-between items-center">
        <div className="h-6 skeleton rounded-lg w-16" />
        <div className="h-9 w-9 skeleton rounded-xl" />
      </div>
    </div>
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
    <div className="aspect-square skeleton rounded-2xl" />
    <div className="space-y-4">
      <div className="h-8 skeleton rounded-xl w-3/4" />
      <div className="h-4 skeleton rounded-lg w-1/3" />
      <div className="h-20 skeleton rounded-xl" />
      <div className="h-10 skeleton rounded-xl w-1/4" />
      <div className="h-12 skeleton rounded-xl" />
    </div>
  </div>
);

export const OrderRowSkeleton = () => (
  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-choco-100">
    <div className="h-4 skeleton rounded w-24" />
    <div className="h-4 skeleton rounded flex-1" />
    <div className="h-6 skeleton rounded-full w-20" />
    <div className="h-4 skeleton rounded w-16" />
  </div>
);

const SkeletonBlock = ({ className = '' }) => (
  <div className={`skeleton rounded-xl ${className}`} />
);

export default SkeletonBlock;
