'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const testimonials = [
  {
    name: 'Priya S.',
    avatar: '/avatars/priya.jpg',
    quote: 'The Blooma bowls have become my daily self-care. I feel more energetic and my skin looks better!',
    rating: 5,
  },
  {
    name: 'Rohit K.',
    avatar: '/avatars/rohit.jpg',
    quote: 'Perfect for my fitness goals. Tasty, fresh and so convenient!',
    rating: 5,
  },
  {
    name: 'Sunita A.',
    avatar: '/avatars/sunita.jpg',
    quote: 'Light, nutritious and easy to digest. I feel more active now.',
    rating: 5,
  },
  {
    name: 'Mr. Verma',
    avatar: '/avatars/verma.jpg',
    quote: 'Simple, fresh and wholesome. Perfect for my daily routine.',
    rating: 5,
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
    q: 'Where do you deliver?',
    a: 'We deliver morning drops (6:00 AM – 9:00 AM) across major Patna neighborhoods including Punaichak, Boring Road, Kankarbagh, Bailey Road, Patliputra, and Rajendra Nagar.',
  },
  {
    q: 'Can I customize my plan and delivery days?',
    a: 'Yes! You can choose between our 7-Day Weekly Plan (enjoying our rotating daily living bowls from Monday to Saturday, plus Sunday seasonal reset) or a Custom Monthly Plan. You can easily pause, skip days, or adjust delivery timing anytime.',
  },
  {
    q: 'What if I have food allergies?',
    a: 'All our bowls are 100% vegetarian, egg-free, and meat-free. You can specify nut allergies or seed preferences in your delivery notes at checkout, and our kitchen team will adjust accordingly.',
  },
];

export default function TestimonialsAndFaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section id="reviews" className="py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] border-t border-[#EAE2D2]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Real People. Real Stories. */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D2818] tracking-tight">
                Real People. Real Stories.
              </h2>
              <p className="text-sm sm:text-base text-[#3D5A47] font-medium mt-1">
                More energy. Better focus. Happier days.
              </p>
            </div>

            {/* 4 Testimonial Cards in 2x2 grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-4 bg-white border border-[#DDD5C0] shadow-xs flex flex-col justify-between text-center transition-all hover:shadow-md"
                >
                  <div className="flex flex-col items-center">
                    {/* Circular Avatar */}
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#D97706]/40 shadow-xs mb-2.5">
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    {/* Quote */}
                    <p className="text-xs text-[#3D5A47] leading-relaxed italic mb-3">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>

                  <div>
                    {/* Name */}
                    <h4 className="font-bold text-xs text-[#0D2818] mb-1">
                      {t.name}
                    </h4>
                    {/* 5 Gold Stars */}
                    <div className="flex items-center justify-center text-[#D97706] text-xs gap-0.5">
                      {'★'.repeat(t.rating)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Frequently Asked Questions */}
          <div className="lg:col-span-6 space-y-6" id="faq">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D2818] tracking-tight">
                  Frequently Asked Questions
                </h2>
              </div>
              <Link
                href="/contact"
                className="text-xs font-bold text-[#0F3826] hover:text-[#D97706] transition-colors whitespace-nowrap hidden sm:block"
              >
                Still have questions? Contact us →
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
