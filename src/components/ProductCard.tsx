import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  name: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  dietaryPreference: string;
  image: string;
}

const getBadgeStyle = (pref: string) => {
  switch (pref) {
    case 'VEGAN': return { bg: '#065F46', color: '#6EE7B7', border: '#059669' };
    case 'VEG': return { bg: '#064E3B', color: '#A7F3D0', border: '#047857' };
    case 'KETO': return { bg: '#4C1D95', color: '#C4B5FD', border: '#6D28D9' };
    case 'HIGH_PROTEIN': return { bg: '#7F1D1D', color: '#FCA5A5', border: '#991B1B' };
    default: return { bg: '#374151', color: '#D1D5DB', border: '#4B5563' };
  }
};

const getBadgeLabel = (pref: string) => pref.replace('_', ' ');

// Calculate macro bar widths as percentage (max value for context)
const getBarWidth = (value: number, max: number) => Math.min((value / max) * 100, 100);

export default function ProductCard({
  name,
  description,
  price,
  calories,
  protein,
  carbs,
  fats,
  dietaryPreference,
  image,
}: ProductCardProps) {
  const badge = getBadgeStyle(dietaryPreference);
  const totalMacros = protein + carbs + fats;

  return (
    <div className="glow-card flex flex-col rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
      {/* Image */}
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 z-10">
          <span
            className="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider"
            style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
          >
            {getBadgeLabel(dietaryPreference)}
          </span>
        </div>
        {/* Calorie badge floating on image */}
        <div className="absolute bottom-3 right-3 z-10">
          <span
            className="px-3 py-1.5 rounded-xl text-sm font-bold backdrop-blur-md"
            style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#FCD34D', border: '1px solid rgba(245, 158, 11, 0.3)' }}
          >
            🔥 {calories} kcal
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        {/* Title and Price */}
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="text-base font-bold leading-tight pr-3" style={{ color: 'var(--text-primary)' }}>{name}</h3>
          <span className="text-lg font-extrabold whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)' }}>₹{price}</span>
        </div>

        <p className="text-sm leading-relaxed mb-4 flex-grow" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>

        {/* Macro Bars */}
        <div className="rounded-xl p-3.5 mb-4" style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)' }}>
          {/* Protein */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              <span>🥩</span>
              <span>Protein</span>
            </div>
            <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#60A5FA' }}>{protein}g</span>
          </div>
          <div className="macro-bar mb-3">
            <div className="macro-bar-fill" style={{ width: `${getBarWidth(protein, 60)}%`, background: 'linear-gradient(90deg, #3B82F6, #60A5FA)' }} />
          </div>

          {/* Carbs */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              <span>🍞</span>
              <span>Carbs</span>
            </div>
            <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#FBBF24' }}>{carbs}g</span>
          </div>
          <div className="macro-bar mb-3">
            <div className="macro-bar-fill" style={{ width: `${getBarWidth(carbs, 80)}%`, background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }} />
          </div>

          {/* Fats */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              <span>🥑</span>
              <span>Fats</span>
            </div>
            <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#34D399' }}>{fats}g</span>
          </div>
          <div className="macro-bar">
            <div className="macro-bar-fill" style={{ width: `${getBarWidth(fats, 50)}%`, background: 'linear-gradient(90deg, #10B981, #34D399)' }} />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2.5 mt-auto">
          <Link
            href="/menu"
            className="py-2.5 px-4 text-sm font-bold rounded-xl text-white transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
            style={{ background: 'var(--brand-primary)' }}
          >
            Subscribe
          </Link>
          <button
            className="py-2.5 px-4 text-sm font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'transparent', border: '1.5px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            One-Time
          </button>
        </div>
      </div>
    </div>
  );
}
