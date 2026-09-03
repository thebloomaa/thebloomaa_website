import React from 'react';

export default function Footer() {
  return (
    <footer style={{ background: '#0B1120', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black" style={{ background: 'var(--brand-primary)' }}>
                T
              </div>
              <span className="text-2xl font-extrabold tracking-tight">
                TheBloo<span style={{ color: 'var(--brand-primary)' }}>Maa</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Macro-tracked, chef-prepared meal preps delivered fresh to your doorstep at your exact preferred time. Built for athletes, fitness enthusiasts, and busy professionals in Patna.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Quick Links</h4>
            <ul className="space-y-2.5">
              <li><a href="#meals" className="text-sm hover:text-emerald-400 transition-colors" style={{ color: 'var(--text-muted)' }}>Our Meals</a></li>
              <li><a href="#pricing" className="text-sm hover:text-emerald-400 transition-colors" style={{ color: 'var(--text-muted)' }}>Pricing</a></li>
              <li><a href="#how-it-works" className="text-sm hover:text-emerald-400 transition-colors" style={{ color: 'var(--text-muted)' }}>How It Works</a></li>
              <li><a href="#faq" className="text-sm hover:text-emerald-400 transition-colors" style={{ color: 'var(--text-muted)' }}>FAQ</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Support</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm hover:text-emerald-400 transition-colors" style={{ color: 'var(--text-muted)' }}>Help Center</a></li>
              <li><a href="#" className="text-sm hover:text-emerald-400 transition-colors" style={{ color: 'var(--text-muted)' }}>Contact Us</a></li>
              <li><a href="#" className="text-sm hover:text-emerald-400 transition-colors" style={{ color: 'var(--text-muted)' }}>Privacy Policy</a></li>
              <li><a href="#" className="text-sm hover:text-emerald-400 transition-colors" style={{ color: 'var(--text-muted)' }}>Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Get In Touch</h4>
            <ul className="space-y-2.5">
              <li className="text-sm" style={{ color: 'var(--text-muted)' }}>📍 Boring Road, Patna</li>
              <li className="text-sm" style={{ color: 'var(--text-muted)' }}>📞 +91 98765 43210</li>
              <li className="text-sm" style={{ color: 'var(--text-muted)' }}>✉️ hello@thebloomaa.in</li>
            </ul>
            <div className="flex gap-3 mt-5">
              <a href="#" className="w-9 h-9 rounded-lg flex items-center justify-center text-sm hover:scale-110 transition-transform" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>𝕏</a>
              <a href="#" className="w-9 h-9 rounded-lg flex items-center justify-center text-sm hover:scale-110 transition-transform" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>IG</a>
              <a href="#" className="w-9 h-9 rounded-lg flex items-center justify-center text-sm hover:scale-110 transition-transform" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>YT</a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 text-center text-xs" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} TheBlooMaa. All rights reserved. Made with 💚 in Patna.
        </div>
      </div>
    </footer>
  );
}
