'use client';

import { useState } from 'react';
import ActionButton from './ActionButton';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-rule-subtle bg-paper-000/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-[6vw] py-4">
        {/* Logo & Brand */}
        <a href="#main" className="group flex items-center gap-3 text-ink-900 transition-[transform] duration-160 hover:scale-[1.02]">
          <img 
            src="/android-chrome-192x192.png" 
            alt="Im-Here Logo" 
            className="h-10 w-10 transition-transform group-hover:scale-105 object-contain" 
          />
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-tight text-ink-900">
              Im-Here<span className="text-accent">.</span>
            </span>
            <span className="font-mono text-[0.625rem] tracking-widest text-ink-500 uppercase">
              Field Intelligence
            </span>
          </div>
        </a>

        {/* Navigation links chuẩn phong cách 9Pay */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Điều hướng chính">
          <a
            href="#giai-phap"
            className="text-sm font-medium text-ink-700 transition-[color] duration-160 hover:text-accent focus-visible:text-accent"
          >
            Giải Pháp B2B
          </a>
          <a
            href="#quy-trinh"
            className="text-sm font-medium text-ink-700 transition-[color] duration-160 hover:text-accent focus-visible:text-accent"
          >
            Quy Trình Khép Kín
          </a>
          <a
            href="#cong-tac-vien"
            className="text-sm font-medium text-ink-700 transition-[color] duration-160 hover:text-accent focus-visible:text-accent"
          >
            Dành Cho Lookers
          </a>
          <a
            href="#bao-mat"
            className="text-sm font-medium text-ink-700 transition-[color] duration-160 hover:text-accent focus-visible:text-accent"
          >
            Bảo Mật Fintech
          </a>
        </nav>

        {/* CTA Buttons bo tròn kiểu 9Pay */}
        <div className="hidden items-center gap-3 sm:flex">
          <ActionButton
            variant="ghost"
            onClick={() => {
              window.location.href = '/app';
            }}
          >
            Trải Nghiệm App Looker
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={() => {
              const el = document.getElementById('lien-he');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Kích Hoạt Chiến Dịch
          </ActionButton>
        </div>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-rule-subtle text-ink-900 md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-label="Mở danh mục điều hướng"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-rule-subtle bg-paper-000 px-[6vw] py-6 md:hidden">
          <div className="flex flex-col gap-4">
            <a
              href="#giai-phap"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-ink-700 hover:text-accent"
            >
              Giải Pháp B2B
            </a>
            <a
              href="#quy-trinh"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-ink-700 hover:text-accent"
            >
              Quy Trình Khép Kín
            </a>
            <a
              href="#cong-tac-vien"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-ink-700 hover:text-accent"
            >
              Dành Cho Lookers
            </a>
            <a
              href="#bao-mat"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-ink-700 hover:text-accent"
            >
              Bảo Mật Fintech
            </a>
            <div className="mt-4 flex flex-col gap-3">
              <ActionButton
                variant="ghost"
                className="w-full justify-center"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.location.href = '/app';
                }}
              >
                Trải Nghiệm App Looker
              </ActionButton>
              <ActionButton
                variant="primary"
                className="w-full justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Kích Hoạt Chiến Dịch
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
