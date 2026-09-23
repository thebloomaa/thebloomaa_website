'use client';

import React, { useState, useEffect } from 'react';

const COMMON_ALLERGIES = [
  { id: 'peanuts', label: 'Peanuts', icon: '🥜' },
  { id: 'tree_nuts', label: 'Tree Nuts (Walnut/Almond)', icon: '🌰' },
  { id: 'sesame_seeds', label: 'Sesame & Seeds', icon: '🌻' },
  { id: 'dairy', label: 'Dairy / Lactose', icon: '🥛' },
  { id: 'gluten', label: 'Gluten / Wheat', icon: '🌾' },
  { id: 'soy', label: 'Soy / Edamame', icon: '🫘' },
  { id: 'citrus', label: 'Citrus / Acidic Fruits', icon: '🥝' },
];

const DISLIKED_INGREDIENTS = [
  { id: 'papaya', label: 'No Papaya', icon: '🍈' },
  { id: 'banana', label: 'No Banana', icon: '🍌' },
  { id: 'apple', label: 'No Apple', icon: '🍎' },
  { id: 'raisins', label: 'No Raisins', icon: '🫐' },
  { id: 'coconut', label: 'No Coconut', icon: '🥥' },
  { id: 'flax_seeds', label: 'No Flax Seeds', icon: '🌾' },
  { id: 'chia_seeds', label: 'No Chia Seeds', icon: '🌱' },
  { id: 'pumpkin_seeds', label: 'No Pumpkin Seeds', icon: '🎃' },
  { id: 'sunflower_seeds', label: 'No Sunflower Seeds', icon: '🌻' },
  { id: 'spicy_sprouts', label: 'No Spicy / Methi', icon: '🌶️' },
  { id: 'onion_garlic', label: 'No Onion / Garlic', icon: '🧅' },
];

interface AllergyPreferencesSelectorProps {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export default function AllergyPreferencesSelector({
  value,
  onChange,
  title = 'Allergies & Dietary Preferences',
  subtitle = 'Select any allergies or fruits/seeds you dislike so our kitchen can customize your bowl.',
  compact = false,
}: AllergyPreferencesSelectorProps) {
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedDislikes, setSelectedDislikes] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState<string>('');
  const [hasNoRestrictions, setHasNoRestrictions] = useState<boolean>(false);

  // Initialize or synchronize from parent value
  useEffect(() => {
    if (!value) return;

    if (value.toLowerCase().includes('no restrictions') || value.toLowerCase() === 'none') {
      setHasNoRestrictions(true);
      return;
    }

    const matchedAllergies: string[] = [];
    COMMON_ALLERGIES.forEach((a) => {
      if (value.toLowerCase().includes(a.label.toLowerCase()) || value.toLowerCase().includes(a.id.toLowerCase())) {
        matchedAllergies.push(a.label);
      }
    });

    const matchedDislikes: string[] = [];
    DISLIKED_INGREDIENTS.forEach((d) => {
      if (value.toLowerCase().includes(d.label.toLowerCase()) || value.toLowerCase().includes(d.id.toLowerCase())) {
        matchedDislikes.push(d.label);
      }
    });

    if (matchedAllergies.length > 0) setSelectedAllergies(matchedAllergies);
    if (matchedDislikes.length > 0) setSelectedDislikes(matchedDislikes);
  }, []);

  const updateParent = (allergies: string[], dislikes: string[], note: string, noRestr: boolean) => {
    if (noRestr) {
      onChange('None (I eat everything)');
      return;
    }

    const parts: string[] = [];
    if (allergies.length > 0) {
      parts.push(`Allergies: ${allergies.join(', ')}`);
    }
    if (dislikes.length > 0) {
      parts.push(`Exclude: ${dislikes.join(', ')}`);
    }
    if (note.trim().length > 0) {
      parts.push(`Note: ${note.trim()}`);
    }

    onChange(parts.join(' | '));
  };

  const toggleAllergy = (label: string) => {
    setHasNoRestrictions(false);
    const updated = selectedAllergies.includes(label)
      ? selectedAllergies.filter((item) => item !== label)
      : [...selectedAllergies, label];

    setSelectedAllergies(updated);
    updateParent(updated, selectedDislikes, customNote, false);
  };

  const toggleDislike = (label: string) => {
    setHasNoRestrictions(false);
    const updated = selectedDislikes.includes(label)
      ? selectedDislikes.filter((item) => item !== label)
      : [...selectedDislikes, label];

    setSelectedDislikes(updated);
    updateParent(selectedAllergies, updated, customNote, false);
  };

  const handleCustomNoteChange = (text: string) => {
    setHasNoRestrictions(false);
    setCustomNote(text);
    updateParent(selectedAllergies, selectedDislikes, text, false);
  };

  const handleEatEverything = () => {
    const nextVal = !hasNoRestrictions;
    setHasNoRestrictions(nextVal);
    if (nextVal) {
      setSelectedAllergies([]);
      setSelectedDislikes([]);
      setCustomNote('');
      updateParent([], [], '', true);
    } else {
      updateParent([], [], '', false);
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-white/90 border border-[#DDD5C0] shadow-xs space-y-4 ${compact ? 'text-xs' : 'text-sm'}`}>
      {/* Header with Title and Quick "I Eat Everything" Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE2D2] pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">🛡️</span>
            <h4 className="font-bold text-[#0D2818] tracking-tight">{title}</h4>
          </div>
          {subtitle && (
            <p className="text-[11px] text-[#5E7A67] mt-0.5 leading-snug">{subtitle}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleEatEverything}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all border shrink-0 cursor-pointer ${
            hasNoRestrictions
              ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-xs'
              : 'bg-[#FAF7F2] text-[#0D2818] border-[#DDD5C0] hover:bg-[#F3EFE6]'
          }`}
        >
          {hasNoRestrictions ? '✓ I Eat Everything' : '✨ I Eat Everything (No restrictions)'}
        </button>
      </div>

      {!hasNoRestrictions && (
        <>
          {/* Section 1: Known Allergies */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-red-500 text-xs">⚠️</span>
              <span className="text-xs font-bold uppercase tracking-wider text-red-900/80">
                Known Food Allergies
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {COMMON_ALLERGIES.map((a) => {
                const isSelected = selectedAllergies.includes(a.label);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAllergy(a.label)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-red-50 text-red-700 border-red-300 shadow-2xs font-bold'
                        : 'bg-[#FAF7F2] text-[#0D2818] border-[#EAE2D2] hover:bg-white hover:border-[#DDD5C0]'
                    }`}
                  >
                    <span>{a.icon}</span>
                    <span>{a.label}</span>
                    {isSelected && <span className="text-red-500 font-bold ml-0.5">✕</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Disliked Fruits & Seeds */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-amber-600 text-xs">🚫</span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900/80">
                Fruits, Seeds &amp; Ingredients to Exclude
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {DISLIKED_INGREDIENTS.map((d) => {
                const isSelected = selectedDislikes.includes(d.label);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDislike(d.label)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs font-bold'
                        : 'bg-[#FAF7F2] text-[#0D2818] border-[#EAE2D2] hover:bg-white hover:border-[#DDD5C0]'
                    }`}
                  >
                    <span>{d.icon}</span>
                    <span>{d.label}</span>
                    {isSelected && <span className="text-amber-600 font-bold ml-0.5">✕</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Custom Kitchen Note / Other Exclusions */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E7A67] mb-1.5">
              Other Disliked Items or Specific Kitchen Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Please exclude pomegranate, prefer light flax seeds, zero citrus..."
              value={customNote}
              onChange={(e) => handleCustomNoteChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD5C0] text-xs sm:text-sm text-[#0D2818] placeholder:text-[#5E7A67]/60 focus:outline-none focus:border-[#0F3826] focus:bg-white transition-colors"
            />
          </div>

          {/* Live Summary Pill */}
          {(selectedAllergies.length > 0 || selectedDislikes.length > 0 || customNote.trim().length > 0) && (
            <div className="p-2.5 rounded-xl bg-[#0F3826]/5 border border-[#0F3826]/15 flex items-start gap-2 text-xs">
              <span className="text-sm shrink-0">🥣</span>
              <div className="leading-snug">
                <span className="font-bold text-[#0F3826]">Custom Prep Tag: </span>
                <span className="text-[#0D2818]">
                  {[
                    selectedAllergies.length > 0 ? `Allergies: ${selectedAllergies.join(', ')}` : null,
                    selectedDislikes.length > 0 ? `Exclude: ${selectedDislikes.join(', ')}` : null,
                    customNote.trim().length > 0 ? `Note: "${customNote.trim()}"` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {hasNoRestrictions && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-800 flex items-center gap-2">
          <span>✓</span>
          <span>Great! You will receive our chef&apos;s full standard daily recipe with all seasonal fruits, living sprouts, dry fruits &amp; super seeds.</span>
        </div>
      )}
    </div>
  );
}
