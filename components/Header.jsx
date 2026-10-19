'use client';

import { useState } from 'react';
import ActionButton from './ActionButton';
import { useAuth } from '@/components/auth/AuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  const handleGoToWorker = () => {
    if (currentUser) {
      window.location.href = '/looker';
    } else {
      window.location.href = '/login?redirect=/looker';
    }
  };

  const handleGoToHirer = () => {
    if (currentUser) {
      window.location.href = '/client/campaigns/new';
    } else {
      window.location.href = '/login?redirect=/client/campaigns/new';
    }
  };

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
              Chợ lao động
            </span>
          </div>
        </a>

        {/* Navigation links chuẩn phong cách 9Pay */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Điều hướng chính">
          <a
            href="#viec-gi-cung-co"
            className="text-sm font-medium text-ink-700 transition-[color] duration-160 hover:text-accent focus-visible:text-accent"
          >
            Việc gì cũng có
          </a>
          <a
            href="#cach-hoat-dong"
            className="text-sm font-medium text-ink-700 transition-[color] duration-160 hover:text-accent focus-visible:text-accent"
          >
            Cách hoạt động
          </a>
          <a
            href="#nguoi-nhan-viec"
            className="text-sm font-medium text-ink-700 transition-[color] duration-160 hover:text-accent focus-visible:text-accent"
          >
            Người nhận việc
          </a>
          <a
            href="#bat-dau"
            className="text-sm font-medium text-ink-700 transition-[color] duration-160 hover:text-accent focus-visible:text-accent"
          >
            Bắt đầu
          </a>
        </nav>

        {/* CTA Buttons bo tròn kiểu 9Pay */}
        <div className="hidden items-center gap-2.5 sm:flex">
          {currentUser ? (
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs font-semibold text-ink-900 bg-paper-200 px-3 py-1.5 rounded-xl max-w-[140px] truncate">
                {currentUser.fullName || currentUser.email}
              </span>
              <button
                type="button"
                onClick={logout}
                className="text-[11px] text-ink-500 hover:text-danger font-medium px-2 py-1"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-ink-700 hover:text-ink-900 hover:bg-paper-200 transition-colors"
            >
              Đăng Nhập
            </a>
          )}
          <ActionButton
            variant="ghost"
            onClick={handleGoToWorker}
          >
            Nhận việc
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={handleGoToHirer}
          >
            Đăng tin thuê người
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
              href="#viec-gi-cung-co"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-ink-700 hover:text-accent"
            >
              Việc gì cũng có
            </a>
            <a
              href="#cach-hoat-dong"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-ink-700 hover:text-accent"
            >
              Cách hoạt động
            </a>
            <a
              href="#nguoi-nhan-viec"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-ink-700 hover:text-accent"
            >
              Người nhận việc
            </a>
            <a
              href="#bat-dau"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-ink-700 hover:text-accent"
            >
              Bắt đầu
            </a>
            <div className="mt-4 flex flex-col gap-2.5">
              {currentUser ? (
                <div className="flex items-center justify-between p-3 bg-paper-100 rounded-xl mb-1">
                  <span className="text-xs font-bold text-ink-900 truncate">
                    {currentUser.fullName || currentUser.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="text-xs text-danger font-semibold"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <a
                  href="/login"
                  className="w-full py-2.5 rounded-xl border border-rule-subtle text-center text-xs font-bold text-ink-900 bg-paper-100"
                >
                  Đăng Nhập
                </a>
              )}
              <ActionButton
                variant="ghost"
                className="w-full justify-center"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleGoToWorker();
                }}
              >
                Nhận việc
              </ActionButton>
              <ActionButton
                variant="primary"
                className="w-full justify-center"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleGoToHirer();
                }}
              >
                Đăng tin thuê người
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
