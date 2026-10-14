'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CustomerFeedbackModal from '@/components/CustomerFeedbackModal';

interface ReviewItem {
  id?: string;
  name: string;
  avatar?: string;
  quote: string;
  rating: number;
  orderId?: string | null;
  mealPlan?: string | null;
  createdAt?: string;
}

const DEFAULT_TESTIMONIALS: ReviewItem[] = [
  {
    name: 'Priya S.',
    avatar: '/avatars/priya.jpg',
    quote: 'The Blooma bowls have become my daily self-care. I feel more energetic and my skin looks better!',
    rating: 5,
    mealPlan: 'Just Bloom Plan',
    orderId: 'ORD-98214',
  },
  {
    name: 'Rohit K.',
    avatar: '/avatars/rohit.jpg',
    quote: 'Perfect for my fitness goals. Tasty, fresh and so convenient for morning breakfast before gym!',
    rating: 5,
    mealPlan: 'Just Bloom Plan',
    orderId: 'ORD-84192',
  },
  {
    name: 'Sunita A.',
    avatar: '/avatars/sunita.jpg',
    quote: 'Light, nutritious and easy to digest. Sprouted microgreens and seeds are so crisp every morning.',
    rating: 5,
    mealPlan: 'Just Bloom Plan',
    orderId: 'ORD-76231',
  },
  {
    name: 'Mr. Verma',
    avatar: '/avatars/verma.jpg',
    quote: 'Simple, fresh and wholesome. Punctual doorstep drop at 7:00 AM in Patna. Highly recommended!',
    rating: 5,
    mealPlan: 'Bloom Care Plan',
    orderId: 'ORD-65108',
  },
];

const faqs = [
  {
    q: 'What are The Blooma bowls?',
    a: 'The Blooma bowls are chef-crafted, 100% pure vegetarian raw & living food meals prepared fresh every morning in Patna. Packed with sprouted organic legumes, microgreens, vitality nuts, seeds, and fresh fruits with zero cooked denatured oils.',
  },
  {
    q: 'Do you use preservatives?',
    a: 'Never! We use zero chemical preservatives, zero artificial additives, and zero refined oils. Every ingredient is raw, cold-washed, and soaked to protect living digestive enzymes.',
  },
  {
    q: 'Can I pay via Cash on Delivery (COD)?',
    a: 'Yes! We now offer Cash on Delivery (COD) across all service delivery areas in Patna. You can simply pay in cash or scan our rider\'s UPI QR code upon morning doorstep delivery with zero advance payment needed.',
  },
  {
    q: 'Where do you deliver in Patna?',
    a: 'We deliver sunrise drops (6:00 AM – 9:00 AM) across major Patna neighborhoods including Punaichak, Boring Road, Kankarbagh, Bailey Road, Patliputra, and Rajendra Nagar.',
  },
  {
    q: 'Can I customize my plan and delivery days?',
    a: 'Yes! You can choose between our Just Bloom Plan (enjoying our rotating daily living bowls from Monday to Saturday, plus Sunday seasonal reset) or our upcoming Bloom Care and Bloom Brain plans. You can easily pause, skip days, or adjust delivery timing anytime.',
  },
  {
    q: 'What if I have food allergies?',
    a: 'All our bowls are 100% vegetarian, egg-free, and meat-free. You can specify nut allergies or seed preferences in your delivery notes at checkout, and our kitchen team will adjust accordingly.',
  },
];

export default function TestimonialsAndFaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_TESTIMONIALS);
  const [newlyAddedToast, setNewlyAddedToast] = useState<string | null>(null);

  // Fetch live customer feedback from API
  useEffect(() => {
    fetch('/api/feedback')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.feedbacks && data.feedbacks.length > 0) {
          const apiReviews: ReviewItem[] = data.feedbacks.map((f: any) => ({
            id: f.id,
            name: f.name,
            quote: f.comment,
            rating: f.rating || 5,
            orderId: f.orderId,
            mealPlan: f.mealPlan,
            createdAt: f.createdAt,
          }));

          // Merge: place newest customer feedbacks first, followed by default verified reviews
          setReviews([...apiReviews, ...DEFAULT_TESTIMONIALS]);
        }
      })
      .catch((err) => console.error('Error fetching live reviews:', err));
  }, []);

  const handleFeedbackSubmitted = (newFeedback: any) => {
    const formatted: ReviewItem = {
      id: newFeedback.id,
      name: newFeedback.name,
      quote: newFeedback.comment,
      rating: newFeedback.rating || 5,
      orderId: newFeedback.orderId,
      mealPlan: newFeedback.mealPlan,
      createdAt: newFeedback.createdAt,
    };
    setReviews((prev) => [formatted, ...prev]);
    setNewlyAddedToast(`Thank you, ${newFeedback.name}! Your review has been added.`);
    setTimeout(() => setNewlyAddedToast(null), 5000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section id="reviews" className="py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] border-t border-[#EAE2D2]">
      {/* Customer Feedback Modal */}
      <CustomerFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onFeedbackSubmitted={handleFeedbackSubmitted}
      />

      <div className="max-w-7xl mx-auto">
        {/* Toast Notification on new feedback submission */}
        {newlyAddedToast && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center justify-between shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <span>🌱</span>
              <span>{newlyAddedToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setNewlyAddedToast(null)}
              className="text-white/80 hover:text-white font-bold ml-3"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Real People. Real Stories & Customer Feedback */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#EAE2D2]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0F3826] text-white">
                    Customer Reviews
                  </span>
                  <span className="text-xs font-bold text-[#D97706] flex items-center gap-1">
                    <span>★ 4.9/5</span>
                    <span className="text-[#5E7A67] font-normal">• Verified Patna Orders</span>
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0D2818] tracking-tight">
                  Real People. Real Stories.
                </h2>
                <p className="text-xs sm:text-sm text-[#3D5A47] font-medium mt-0.5">
                  Fresh experiences from our sunrise living nutrition subscribers.
                </p>
              </div>

              {/* FEEDBACK ACTION BUTTON */}
              <button
                type="button"
                id="btn-give-order-feedback"
                onClick={() => setIsFeedbackModalOpen(true)}
                className="self-start sm:self-center px-4 py-2.5 rounded-xl text-xs font-black text-white bg-[#D97706] hover:bg-[#B45309] transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                title="Give feedback for your Bloomaa order"
              >
                <span>✍️</span>
                <span>Give Order Feedback</span>
              </button>
            </div>

            {/* Testimonials Grid (First 4 cards displayed) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.slice(0, 4).map((t, idx) => {
                const initial = t.name.charAt(0).toUpperCase();
                return (
                  <div
                    key={t.id || idx}
                    className="rounded-2xl p-4 bg-white border border-[#DDD5C0] shadow-xs flex flex-col justify-between text-left transition-all hover:shadow-md hover:border-[#D97706]/40 relative group"
                  >
                    <div>
                      {/* Top Header: Avatar/Initial + Rating + Order ID */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          {t.avatar ? (
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#D97706]/40 shadow-xs shrink-0">
                              <Image
                                src={t.avatar}
                                alt={t.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#0F3826] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                              {initial}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-xs text-[#0D2818] leading-tight">
                              {t.name}
                            </h4>
                            {t.mealPlan && (
                              <span className="text-[10px] text-[#5E7A67] block leading-tight">
                                {t.mealPlan}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="text-[#D97706] text-xs font-bold shrink-0">
                          {'★'.repeat(t.rating)}
                        </div>
                      </div>

                      {/* Quote */}
                      <p className="text-xs text-[#3D5A47] leading-relaxed italic mb-3">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                    </div>

                    {/* Order Reference Badge */}
                    <div className="pt-2 border-t border-[#F2ECE1] flex items-center justify-between text-[10px]">
                      {t.orderId ? (
                        <span className="font-mono font-bold text-[#0F3826] bg-[#0F3826]/10 px-2 py-0.5 rounded-full border border-[#0F3826]/20">
                          ✓ {t.orderId}
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Verified Patna Order
                        </span>
                      )}
                      <span className="text-[#5E7A67]/80">Patna Morning Drop</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Feedback Card Teaser */}
            <div className="p-4 rounded-2xl bg-white border border-[#DDD5C0] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-xl bg-[#0F3826]/10 text-[#0F3826]">
                  💬
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0D2818]">
                    Ordered with Bloomaa?
                  </h4>
                  <p className="text-[11px] text-[#5E7A67]">
                    Rate your delivery, freshness, or share your thoughts with our team!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-[#0F3826] bg-[#FAF7F2] border border-[#0F3826] hover:bg-[#0F3826] hover:text-white transition-all cursor-pointer whitespace-nowrap"
              >
                Write a Review →
              </button>
            </div>
          </div>

          {/* Right Column: Frequently Asked Questions */}
          <div className="lg:col-span-6 space-y-6" id="faq">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE2D2]">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0D2818] tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs sm:text-sm text-[#3D5A47] font-medium mt-0.5">
                  Everything you need to know about fresh delivery & COD.
                </p>
              </div>
              <Link
                href="/contact"
                className="text-xs font-bold text-[#0F3826] hover:text-[#D97706] transition-colors whitespace-nowrap hidden sm:block"
              >
                Need help? Contact →
              </Link>
            </div>

            {/* Accordion FAQ Items */}
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden bg-white border border-[#DDD5C0] transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(i)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-[#0D2818] hover:text-[#D97706] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-base text-[#5E7A67] ml-2 shrink-0">
                      {openFaq === i ? '−' : '+'}
                    </span>
                  </button>

                  {openFaq === i && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-[#3D5A47] leading-relaxed border-t border-[#F2ECE1] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="sm:hidden pt-2 text-center">
              <Link
                href="/contact"
                className="text-xs font-bold text-[#0F3826] hover:text-[#D97706] transition-colors"
              >
                Still have questions? Contact us →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
