'use client';

import React, { useState, useEffect } from 'react';

interface FeedbackData {
  id?: string;
  name: string;
  phone?: string;
  orderId?: string;
  rating: number;
  mealPlan?: string;
  comment: string;
  createdAt?: string;
}

interface CustomerFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFeedbackSubmitted?: (feedback: FeedbackData) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Needs Improvement',
  2: 'Fair Experience',
  3: 'Good & Fresh',
  4: 'Very Good & Punctual',
  5: 'Outstanding! Loved it 🌱',
};

const MEAL_PLAN_OPTIONS = [
  'Just Bloom Plan (7-Day Trial)',
  'Bloom Care Plan (30 Days)',
  'Bloom Brain Plan (30 Days)',
  'Vegan Keto Morning Bowl',
  'Sprouted Vitality Salad Bowl',
  'Seasonal Fresh Fruit & Nut Reset',
  'Customized Living Nutrition Bowl',
];

export default function CustomerFeedbackModal({
  isOpen,
  onClose,
  onFeedbackSubmitted,
}: CustomerFeedbackModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [mealPlan, setMealPlan] = useState(MEAL_PLAN_OPTIONS[0]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMsg('Please share a few words about your order experience (at least 5 characters).');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || undefined,
          orderId: orderId.trim() || undefined,
          mealPlan,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedSuccess(true);
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted(data.feedback);
        }
      } else {
        setErrorMsg(data.error || 'Failed to submit feedback. Please try again.');
      }
    } catch (err) {
      console.error('Feedback submit error:', err);
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setPhone('');
    setOrderId('');
    setMealPlan(MEAL_PLAN_OPTIONS[0]);
    setRating(5);
    setComment('');
    setSubmittedSuccess(false);
    setErrorMsg(null);
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-[#FAF7F2] border border-[#DDD5C0] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-white border-b border-[#EAE2D2] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F3826] text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
              🌱
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#0D2818] leading-tight">
                Order Feedback
              </h3>
              <p className="text-xs text-[#5E7A67] mt-0.5">
                Share your experience to help us improve your sunrise meals
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#DDD5C0] text-[#0D2818] hover:bg-[#F0ECE1] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {submittedSuccess ? (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 border-2 border-emerald-500/30 flex items-center justify-center text-3xl mx-auto shadow-sm">
                ✓
              </div>
              <h4 className="text-xl font-serif font-bold text-[#0D2818]">
                Thank You, {name}! 🎉
              </h4>
              <p className="text-sm text-[#3D5A47] max-w-sm mx-auto leading-relaxed">
                Your feedback has been received. Your real voice guides our cloud kitchen and Patna delivery team every single morning!
              </p>
              <div className="p-4 rounded-2xl bg-white border border-[#DDD5C0] text-xs text-left text-[#3D5A47] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#5E7A67]">Rating:</span>
                  <span className="font-bold text-[#D97706]">{'★'.repeat(rating)}</span>
                </div>
                {orderId && (
                  <div className="flex justify-between">
                    <span className="text-[#5E7A67]">Order Reference:</span>
                    <span className="font-mono font-bold text-[#0D2818]">{orderId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#5E7A67]">Plan:</span>
                  <span className="font-semibold text-[#0D2818]">{mealPlan}</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5E7A67] hover:text-[#0D2818] border border-[#DDD5C0] transition-colors"
                >
                  Submit Another Review
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0F3826] text-white hover:bg-[#164e35] transition-all shadow-md cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-semibold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Star Rating Selector */}
              <div className="p-4 rounded-2xl bg-white border border-[#DDD5C0] text-center space-y-2 shadow-2xs">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5E7A67]">
                  How would you rate your order? *
                </label>
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="text-3xl sm:text-4xl transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                      aria-label={`${star} star`}
                    >
                      <span
                        className={
                          star <= activeRating
                            ? 'text-[#D97706] drop-shadow-xs'
                            : 'text-[#DDD5C0] hover:text-[#D97706]/50'
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs font-bold text-[#D97706] min-h-[18px]">
                  {RATING_LABELS[activeRating] || ''}
                </p>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5E7A67] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aditi Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C0] text-sm text-[#0D2818] focus:outline-none focus:border-[#0F3826]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5E7A67] mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C0] text-sm text-[#0D2818] focus:outline-none focus:border-[#0F3826]"
                  />
                </div>
              </div>

              {/* Order ID & Meal Plan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5E7A67] mb-1">
                    Order ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ORD-10492"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C0] text-sm text-[#0D2818] font-mono focus:outline-none focus:border-[#0F3826]"
                  />
                  <span className="text-[10px] text-[#5E7A67] mt-0.5 block">
                    Helps verify your review
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5E7A67] mb-1">
                    Meal / Diet Plan
                  </label>
                  <select
                    value={mealPlan}
                    onChange={(e) => setMealPlan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C0] text-xs text-[#0D2818] focus:outline-none focus:border-[#0F3826]"
                  >
                    {MEAL_PLAN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Feedback Textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5E7A67] mb-1">
                  Your Review / Experience *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="How was the freshness, taste, morning delivery punctuality, and overall health boost? We'd love to hear your thoughts!"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C0] text-sm text-[#0D2818] focus:outline-none focus:border-[#0F3826] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#5E7A67] hover:bg-white border border-transparent hover:border-[#DDD5C0] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl text-xs font-black text-white bg-[#0F3826] hover:bg-[#164e35] transition-all shadow-md shadow-[#0F3826]/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Feedback...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Order Feedback</span>
                      <span>🌱</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
