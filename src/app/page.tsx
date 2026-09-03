import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import PincodeChecker from '@/components/PincodeChecker';
import { prisma } from '@/lib/prisma';

const steps = [
  {
    icon: '📍',
    title: 'Check Your Area',
    description: 'Enter your pincode to see if we deliver fresh meals to your neighborhood in Patna.',
  },
  {
    icon: '🥗',
    title: 'Pick Your Plan',
    description: 'Choose from high protein, keto, or balanced meals. Select a 7, 15, or 30-day prepaid bundle.',
  },
  {
    icon: '🚀',
    title: 'Get It Fresh Daily',
    description: 'Your macro-tracked meal prep is delivered to your door every morning between 6–9 AM.',
  },
];

const stats = [
  { value: '5,000+', label: 'Meals Delivered' },
  { value: '500+', label: 'Active Subscribers' },
  { value: '6 AM', label: 'First Delivery' },
  { value: '98%', label: 'On-Time Rate' },
];

const bundles = [
  {
    name: 'Starter',
    days: 7,
    perDay: '₹250',
    total: '₹1,750',
    features: ['7 morning deliveries', 'Macro-tracked meals', 'Skip any day', 'WhatsApp support'],
    popular: false,
  },
  {
    name: 'Committed',
    days: 15,
    perDay: '₹230',
    total: '₹3,450',
    features: ['15 morning deliveries', 'Macro-tracked meals', 'Skip any day', 'Priority support', 'Free nutrition consult'],
    popular: true,
  },
  {
    name: 'All-In',
    days: 30,
    perDay: '₹200',
    total: '₹6,000',
    features: ['30 morning deliveries', 'Macro-tracked meals', 'Skip any day', 'Dedicated support', 'Free nutrition consult', 'Custom meal tweaks'],
    popular: false,
  },
];

const faqs = [
  {
    q: 'How early are meals delivered?',
    a: 'Our in-house delivery fleet delivers all meal preps between 6:00 AM and 9:00 AM every morning, so your food is ready before you start your day.',
  },
  {
    q: 'Can I pause or skip a delivery day?',
    a: 'Absolutely! You can skip any upcoming day directly from your subscriber dashboard. Skipped days are added back to your bundle — you never lose a meal.',
  },
  {
    q: 'How do I pay?',
    a: 'We support UPI payments via PhonePe, GPay, and Paytm. You pay upfront for your chosen bundle (7, 15, or 30 days). We also support UPI AutoPay for renewals.',
  },
  {
    q: 'What areas do you deliver to?',
    a: 'We currently serve select neighborhoods in Patna including Boring Road, Kankarbagh, and Patliputra. Use the pincode checker on this page to verify.',
  },
  {
    q: 'Are the meals freshly prepared?',
    a: 'Yes. Every meal is chef-prepared in our cloud kitchen the same morning and delivered fresh — never frozen, never reheated.',
  },
];

export default async function Home() {
  const dbProducts = await prisma.product.findMany({
    where: { type: 'MEAL_PLAN', active: true },
    take: 3,
  });

  const meals = dbProducts.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: p.price,
    calories: p.calories || 0,
    protein: p.protein || 0,
    carbs: p.carbs || 0,
    fats: p.fats || 0,
    dietaryPreference: p.dietaryPreference || 'VEG',
    image: p.imageUrl || '/meals/chicken-prep.png',
  }));

  return (
    <>
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'var(--brand-primary)' }} />
        <div className="absolute bottom-10 right-1/4 w-72 h-72 rounded-full opacity-8 blur-3xl pointer-events-none" style={{ background: 'var(--brand-accent)' }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="animate-fade-in-up">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
              style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--brand-primary)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
            >
              Now delivering in Patna 🚀
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 animate-fade-in-up-delay-1">
            Your Gains,{' '}
            <span style={{ color: 'var(--brand-primary)' }}>Delivered</span>{' '}
            <br className="hidden sm:block" />
            On Your Schedule.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg leading-relaxed mb-10 animate-fade-in-up-delay-2" style={{ color: 'var(--text-muted)' }}>
            Macro-tracked, chef-prepared meal preps delivered to your door at your exact preferred time.
            Choose your fitness goal, pick a plan, and we handle the rest.
          </p>

          <div className="max-w-md mx-auto animate-fade-in-up-delay-3">
            <PincodeChecker variant="hero" />
            <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              Check if we deliver to your area — it takes 2 seconds.
            </p>
          </div>
        </div>
      </section>

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

      {/* ===== OUR MEALS ===== */}
      <section id="meals" className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(180deg, var(--bg-dark) 0%, #0B1120 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand-accent)' }}>Fuel Your Goals</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2">Our Signature Meals</h2>
            <p className="mt-3 text-sm max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
              Every meal is macro-balanced, chef-prepared fresh daily, and delivered in eco-friendly packaging.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {meals.map(meal => (
              <ProductCard key={meal.id} {...meal} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand-primary)' }}>Prepaid Bundles</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2">Choose Your Commitment</h2>
            <p className="mt-3 text-sm max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
              All plans include daily morning delivery, macro tracking, and the ability to skip any day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bundles.map((bundle, i) => (
              <div
                key={i}
                className="glow-card relative rounded-2xl p-7 flex flex-col"
                style={{
                  background: bundle.popular ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02))' : 'var(--bg-card)',
                  border: bundle.popular ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                }}
              >
                {bundle.popular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: 'var(--brand-primary)' }}
                  >
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold mb-1">{bundle.name}</h3>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{bundle.days}-day bundle</p>
                <div className="mb-5">
                  <span className="text-3xl font-black" style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)' }}>{bundle.perDay}</span>
                  <span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>/day</span>
                </div>
                <p className="text-xs font-medium mb-5" style={{ color: 'var(--text-muted)' }}>
                  Total: <span className="font-bold" style={{ color: 'var(--text-secondary)' }}>{bundle.total}</span>
                </p>
                <ul className="space-y-2.5 mb-7 flex-grow">
                  {bundle.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--brand-primary)' }}>✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: bundle.popular ? 'var(--brand-primary)' : 'transparent',
                    color: bundle.popular ? 'white' : 'var(--text-secondary)',
                    border: bundle.popular ? 'none' : '1.5px solid var(--border-subtle)',
                  }}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-card)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand-primary)' }}>The TheBlooMaa Difference</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2">Why Fitness Enthusiasts Choose Us</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🏋️', title: 'Macro Precision', desc: 'Every meal is weighed and tracked — calories, protein, carbs, and fats down to the gram.' },
              { icon: '⏰', title: 'Scheduled Delivery', desc: 'Set your preferred time in the planner, and our in-house fleet will deliver your meal at that specific time for the entire plan duration.' },
              { icon: '🧑‍🍳', title: 'Chef-Prepared Daily', desc: 'Never frozen, never reheated. Fresh meals prepared in our cloud kitchen every morning.' },
              { icon: '⏸️', title: 'Skip Anytime', desc: 'Cheat day? Traveling? Pause or skip any delivery day from your dashboard.' },
              { icon: '📱', title: 'UPI Payments', desc: 'Pay instantly via PhonePe, GPay, or Paytm. Supports recurring UPI AutoPay.' },
              { icon: '♻️', title: 'Eco-Friendly Packaging', desc: 'All our containers are reusable and made from food-grade recycled materials.' },
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
          <h2 className="text-2xl sm:text-3xl font-black mb-3 relative z-10">Ready to Fuel Your Fitness?</h2>
          <p className="text-sm mb-8 max-w-lg mx-auto relative z-10" style={{ color: 'var(--text-muted)' }}>
            Join hundreds of fitness enthusiasts in Patna who start every morning with a TheBlooMaa box.
          </p>
          <button
            className="px-8 py-3.5 rounded-xl text-base font-bold text-white transition-all hover:scale-105 active:scale-95 relative z-10"
            style={{ background: 'var(--brand-primary)' }}
          >
            Start Your Plan Today →
          </button>
        </div>
      </section>

      <Footer />
    </>
  );
}
