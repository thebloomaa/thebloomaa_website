import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LandingHero from '@/components/LandingHero';
import BioCalculatorTeaser from '@/components/BioCalculatorTeaser';
import TrialPlanShowcase from '@/components/TrialPlanShowcase';

const steps = [
  {
    icon: '📍',
    title: '1. Check Delivery Area',
    description: 'Enter your 6-digit pincode to verify morning cloud kitchen coverage in Patna (Boring Rd, Kankarbagh, Patliputra).',
  },
  {
    icon: '🌱',
    title: '2. Claim 7-Day Reset',
    description: 'Experience 7 unique living enzyme raw boxes, cold-prepared daily to reset your gut microbiome and cellular age.',
  },
  {
    icon: '🚀',
    title: '3. Fresh Morning Drop',
    description: 'Chef-crafted living nutrition delivered to your doorstep every morning between 6:00 AM – 9:00 AM.',
  },
];

const stats = [
  { value: '5,000+', label: 'Boxes Delivered' },
  { value: '500+', label: 'Active Subscribers' },
  { value: '6 AM', label: 'First Morning Drop' },
  { value: '98%', label: 'On-Time Fleet Rate' },
];

const offerings = [
  {
    name: 'Single Pack 1-Day Fresh Diet',
    type: 'SINGLE_PACK',
    tag: 'Starter Sampler',
    perDay: '₹70',
    total: '₹70 (Single Drop)',
    period: '1-day fresh diet sampler',
    features: [
      '1 goal-targeted cold-prepared living enzyme box',
      'Fresh sprouted legumes, microgreens & raw vitality nuts',
      'Chef cold-prepared daily at 5:00 AM, zero cooked oil',
      'Morning 6:00 AM – 9:00 AM doorstep delivery in Patna',
      'Taste test our living nutrition quality before committing',
      'Bio-calculator nutrition analysis report included',
    ],
    popular: false,
    ctaText: 'Order 1-Day Pack (₹70) →',
    ctaHref: '/checkout?plan=single',
  },
  {
    name: 'Just Bloomed 7-Day Living Trial',
    type: 'TRIAL',
    tag: 'Most Popular',
    perDay: '₹64',
    total: '₹451',
    period: '7-day living reset',
    features: [
      '7 goal-targeted living enzyme boxes (Sprouts, Raw Greens, Seeds)',
      'Chef cold-prepared daily at 5:00 AM, zero cooked oil',
      'Morning 6:00 AM – 9:00 AM doorstep delivery in Patna',
      'Unique 6+1 physical drop (2 boxes on Day 6 for weekend vitality)',
      'Flexible 8:30 PM cutoff to pause or skip any morning',
      'Free WhatsApp nutrition consultation',
    ],
    popular: true,
    ctaText: 'Claim 7D Trial (₹451) →',
    ctaHref: '/checkout?plan=trial',
  },
  {
    name: 'Corporate & Team Vitality Reset',
    type: 'CORPORATE',
    tag: 'Teams & Clinics',
    perDay: 'Custom',
    total: 'On Demand',
    period: 'Flexible team schedule',
    features: [
      'Bulk living raw enzyme boxes for office desks & gyms',
      'Dedicated morning fleet dispatch across Patna',
      'Eliminates 2 PM carb crashes & boosts employee focus',
      'Custom allergen & dietary preference alignment',
      'Dedicated wellness concierge support',
    ],
    popular: false,
    ctaText: 'Inquire on WhatsApp →',
    ctaHref: 'https://wa.me/916207654684?text=Hi%20Thebloomaa%2C%20I%20am%20interested%20in%20a%20Corporate%20Living%20Food%20Reset%20for%20our%20team%20in%20Patna.',
  },
];

const faqs = [
  {
    q: 'Can I order a single 1-day pack before taking a full plan?',
    a: 'Yes! You can order our Single Pack 1-Day Diet Order for just ₹70. We will deliver a complete fresh living nutrition box to your doorstep tomorrow morning between 6:00 AM and 9:00 AM across Patna with zero recurring commitments.',
  },
  {
    q: 'What is the Just Bloomed 7D Trial Plan?',
    a: 'It is a 7-day cellular nutrition reset featuring 7 distinct, completely fresh & raw food boxes (sprouted seeds, microgreens, organic nuts, raw fruits) calibrated for enzyme vitality. Delivered over 6 delivery mornings with a double drop (6+1) on Day 6.',
  },
  {
    q: 'How early is the morning drop?',
    a: 'Our in-house Patna delivery fleet drops your fresh nutrition box between 6:00 AM and 9:00 AM every morning, right before your morning workout or workday starts.',
  },
  {
    q: 'Can I pause or skip a delivery day?',
    a: 'Yes! With our 8:30 PM prior-evening cutoff, you can pause or reschedule any upcoming morning directly from your account. You never lose a diet.',
  },
  {
    q: 'How do I pay?',
    a: 'We support UPI payments via PhonePe, GPay, Paytm, and UPI QR code directly at checkout.',
  },
  {
    q: 'What areas do you deliver to in Patna?',
    a: 'We currently serve central Patna neighborhoods including Boring Road (800001), Kankarbagh (800020), and Patliputra (800013). Use the pincode checker on this page to confirm your address.',
  },
  {
    q: 'Are the items cooked or processed?',
    a: 'No! The Just Bloomed Trial is 100% raw, fresh, and cold-prepared. Zero heating, zero refined oils, and zero preservatives to ensure intact digestive enzymes.',
  },
  {
    q: 'Is TheBlooMaa 100% vegetarian & plant-based?',
    a: 'Yes, absolutely 100% pure vegetarian! Our kitchen is strictly plant-based and cold-crafted with living sprouted legumes, microgreens, vitality seeds, and raw nuts. Zero meat, zero poultry, zero eggs, and zero non-vegetarian items ever enter our preparation facility.',
  },
];

export const revalidate = 60;

export default function Home() {
  return (
    <>
      <Navbar />

      {/* ===== HERO WITH PINCODE GATE ===== */}
      <LandingHero />

      {/* ===== STATS BAR ===== */}
      <section className="py-8 px-4" style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>{stat.value}</div>
              <div className="text-xs font-medium uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand-primary)' }}>Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="glow-card rounded-2xl p-7 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mx-auto mb-3" style={{ background: 'var(--brand-primary)', color: 'white' }}>
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BIO CALCULATOR TEASER ===== */}
      <BioCalculatorTeaser />

      {/* ===== 7-DAY TRIAL SHOWCASE ===== */}
      <section id="trial" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <TrialPlanShowcase />
        </div>
      </section>

      {/* ===== PRICING & OFFERINGS ===== */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand-primary)' }}>Fresh Nutrition Plans</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2">Choose Your Vitality Reset</h2>
            <p className="mt-3 text-sm max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
              Cold-prepared fresh &amp; raw diet boxes and personalized biological age analysis for Patna health-seekers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offerings.map((plan, i) => (
              <div
                key={i}
                className="glow-card relative rounded-2xl p-7 flex flex-col"
                style={{
                  background: plan.popular ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.09), rgba(16, 185, 129, 0.02))' : 'var(--bg-card)',
                  border: plan.popular ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                }}
              >
                {plan.popular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-brand-forest bg-brand-mustard shadow-md shadow-brand-mustard/20"
                  >
                    ⭐ {plan.tag}
                  </span>
                )}
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{plan.period}</p>
                <div className="mb-5">
                  <span className="text-3xl font-black" style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)' }}>{plan.perDay}</span>
                  {plan.perDay !== 'Free' && plan.perDay !== 'Custom' && (
                    <span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>/day</span>
                  )}
                </div>
                <p className="text-xs font-medium mb-5" style={{ color: 'var(--text-muted)' }}>
                  Total Commitment: <span className="font-bold" style={{ color: 'var(--text-secondary)' }}>{plan.total}</span>
                </p>
                <ul className="space-y-2.5 mb-7 flex-grow">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="text-brand-mustard shrink-0 mt-0.5">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.ctaHref}
                  className="w-full py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] text-center block cursor-pointer"
                  style={{
                    background: plan.popular ? 'var(--brand-primary)' : 'rgba(255,255,255,0.05)',
                    color: plan.popular ? '#020617' : 'var(--text-primary)',
                    border: plan.popular ? 'none' : '1.5px solid var(--border-subtle)',
                  }}
                >
                  {plan.ctaText}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-card)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-mustard">The thebloomaa Difference</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2">Motherly Care. Macro Precision.</h2>
            <p className="text-sm text-brand-forest-muted/80 font-serif italic mt-1">Bloom your day with BlooMaa</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🏋️', title: 'Macro Precision', desc: 'Every diet is weighed and tracked — calories, protein, carbs, and fats down to the gram.' },
              { icon: '⏰', title: 'Scheduled Delivery', desc: 'Set your preferred time in the planner, and our in-house fleet will deliver your diet at that specific time for the entire plan duration.' },
              { icon: '🌿', title: 'Motherly Nourishment', desc: 'Prepared with whole living ingredients and motherly care. Never frozen, never reheated. Fresh every morning.' },
              { icon: '⏸️', title: 'Skip Anytime', desc: 'Cheat day? Traveling? Pause or skip any delivery day directly from your subscriber dashboard.' },
              { icon: '📱', title: 'UPI Payments', desc: 'Pay instantly via PhonePe, GPay, or Paytm with instant confirmation and QR codes.' },
              { icon: '♻️', title: 'Eco-Friendly Packaging', desc: 'All our containers are reusable, food-grade, and designed to keep living nutrients protected.' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-6" style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)' }}>
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="text-base font-bold mb-1.5">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand-primary)' }}>Questions?</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2">Frequently Asked</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <summary className="cursor-pointer px-6 py-4 text-sm font-semibold flex items-center justify-between list-none" style={{ color: 'var(--text-primary)' }}>
                  {faq.q}
                  <span className="ml-4 text-lg transition-transform group-open:rotate-45" style={{ color: 'var(--brand-primary)' }}>+</span>
                </summary>
                <div className="px-6 pb-4 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div
          className="max-w-4xl mx-auto rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(16, 185, 129, 0.2)' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: 'var(--brand-primary)' }} />
          <span className="text-xs text-brand-forest-muted font-serif italic tracking-wide block mb-2">
            Bloom your day with BlooMaa
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mb-3 relative z-10">Ready to Fuel Your Fitness &amp; Vitality?</h2>
          <p className="text-sm mb-8 max-w-lg mx-auto relative z-10" style={{ color: 'var(--text-muted)' }}>
            Join hundreds of fitness and wellness enthusiasts in Patna who start every morning with fresh chef-prepared thebloomaa boxes.
          </p>
          <a
            href="/#pricing"
            className="inline-block px-8 py-3.5 rounded-xl text-base font-bold text-brand-forest bg-brand-mustard hover:bg-brand-mustard transition-all hover:scale-105 active:scale-95 relative z-10 shadow-lg shadow-brand-mustard/20"
          >
            Start Your Plan Today →
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
