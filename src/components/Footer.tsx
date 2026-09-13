import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer style={{ background: '#0B1120', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400/70 shadow-lg shrink-0 bg-slate-900 ring-2 ring-emerald-500/20">
                <Image
                  src="/logo.jpg"
                  alt="thebloomaa - Bloom your day with bloomaa"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-slate-100 block leading-tight">
                  thebloo<span className="text-emerald-400">maa</span>
                </span>
                <span className="text-[11px] text-amber-300/90 font-serif italic tracking-wide block">
                  Bloom your day with bloomaa
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Nourished with motherly care. Macro-calibrated, chef-prepared fitness meal preps and cellular living foods delivered fresh across Patna every morning (6 AM – 9 AM).
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-300">Quick Links</h4>
            <ul className="space-y-2.5">
              <li><a href="/#trial" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">7-Day Living Food Trial (₹451)</a></li>
              <li><Link href="/calculator" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5">Bio Calculator <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">NEW</span></Link></li>
              <li><a href="/#pricing" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Pricing &amp; Subscriptions</a></li>
              <li><a href="/#how-it-works" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">How It Works</a></li>
              <li><a href="/#faq" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-300">Support &amp; Trust</h4>
            <ul className="space-y-2.5">
              <li><Link href="/contact" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Help Center &amp; Support</Link></li>
              <li><Link href="/contact" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-300">Patna Kitchen</h4>
            <ul className="space-y-2.5">
              <li className="text-sm text-slate-400">📍 Boring Road, Patna, Bihar</li>
              <li className="text-sm text-slate-400">
                <a href="tel:+916207654684" className="hover:text-emerald-400 transition-colors">📞 +91 62076 54684</a>
              </li>
              <li className="text-sm text-slate-400">
                <a href="mailto:admin@thebloomaa.com" className="hover:text-emerald-400 transition-colors">✉️ admin@thebloomaa.com</a>
              </li>
            </ul>
            <div className="flex gap-2.5 mt-5">
              <a
                href="https://wa.me/916207654684?text=Hi%20Thebloomaa%2C%20I%20have%20a%20question%20about%20your%20meal%20plans"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all flex items-center gap-1.5"
              >
                <span>💬</span>
                <span>WhatsApp</span>
              </a>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
              >
                Rider / Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 text-center text-xs" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} thebloomaa · <span className="text-amber-300/80 italic">Bloom your day with bloomaa</span>. Made with 💚 in Patna.
        </div>
      </div>
    </footer>
  );
}
