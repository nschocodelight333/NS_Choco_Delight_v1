import { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUrl';

const CampaignPoster = ({ campaign, className = 'w-full h-full', showBadge = true }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [campaign?.bannerImageUrl]);

  if (!campaign) return null;

  const theme = campaign.themeColors || { primary: '#7C2D12', secondary: '#D97706', background: '#FFFBEB' };
  const imageUrl = campaign.bannerImageUrl ? getImageUrl(campaign.bannerImageUrl) : '';

  // If valid image exists and hasn't errored
  if (imageUrl && !imgError) {
    return (
      <div className={`relative overflow-hidden rounded-2xl shadow-lg border border-white/20 bg-choco-900 group ${className}`}>
        <img
          src={imageUrl}
          alt={campaign.occasionName}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        {showBadge && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold drop-shadow-md">
            <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              {campaign.emoji || '🎉'} {campaign.occasionName}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Fallback Luxury Handcrafted Poster Graphic (Shows for everyone cleanly)
  return (
    <div
      style={{
        background: `radial-gradient(circle at 20% 20%, ${theme.secondary} 0%, ${theme.primary} 70%, #2A1713 100%)`,
      }}
      className={`relative overflow-hidden rounded-2xl shadow-xl border-2 border-amber-300/40 p-6 flex flex-col justify-between text-white select-none ${className}`}
    >
      {/* Subtle luxury sparkle watermark */}
      <div className="absolute -right-8 -top-8 text-9xl opacity-10 pointer-events-none">
        {campaign.emoji || '🎉'}
      </div>
      <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

      {/* Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400/20 text-amber-200 border border-amber-300/30 backdrop-blur-md">
          <span>✨</span> Special Edition
        </span>
        <span className="text-2xl drop-shadow-lg animate-bounce">{campaign.emoji || '🎉'}</span>
      </div>

      {/* Main Center Typography */}
      <div className="relative z-10 my-auto text-center space-y-1">
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mx-auto flex items-center justify-center text-3xl shadow-inner mb-2">
          {campaign.emoji || '🍫'}
        </div>
        <h3 className="font-display text-xl sm:text-2xl font-extrabold text-amber-100 drop-shadow-md tracking-tight leading-tight">
          {campaign.occasionName}
        </h3>
        <p className="text-amber-200/80 text-[11px] font-medium tracking-wide uppercase">
          Handcrafted Gourmet Collection
        </p>
      </div>

      {/* Bottom Footer Ribbon */}
      <div className="relative z-10 pt-2 border-t border-white/15 flex items-center justify-between text-[10px] text-amber-200/90 font-mono">
        <span>NS CHOCO DELIGHT</span>
        <span>🍫 MADE WITH HEART</span>
      </div>
    </div>
  );
};

export default CampaignPoster;
