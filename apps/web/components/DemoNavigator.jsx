'use client';

import { useState } from 'react';

export default function DemoNavigator() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside aria-label="Thanh điều hướng demo các phân hệ" className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Hộp gợi ý các phân hệ khi mở rộng */}
        {isOpen && (
          <div className="panel-light mb-3 w-80 p-4 elevated backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-rule-subtle pb-3">
              <span className="font-mono text-xs font-bold text-accent">
                IM-HERE DEMO SUITE
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-ink-500 hover:text-ink-900 transition-[color] duration-160"
                aria-label="Đóng thanh điều hướng demo"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <a
                href="/"
                className="flex items-center justify-between rounded-2xl border border-accent/40 bg-accent-quiet p-3 transition-[background-color] hover:bg-accent/20"
              >
                <div>
                  <span className="block text-xs font-bold text-accent">
                    Phân hệ 1: Landing Page
                  </span>
                  <span className="block text-[0.625rem] text-ink-500">
                    B2B &amp; B2C Chuẩn 9Pay Fintech
                  </span>
                </div>
                <span className="rounded-full bg-accent px-2 py-0.5 text-[0.5625rem] font-bold text-paper-000 uppercase">
                  Landing
                </span>
              </a>

              <div className="flex items-center justify-between rounded-2xl border border-rule-subtle bg-paper-100 p-3 opacity-60">
                <div>
                  <span className="block text-xs font-semibold text-ink-900">
                    Phân hệ 2: Admin Dashboard
                  </span>
                  <span className="block text-[0.625rem] text-ink-500">
                    Heatmap, Campaign Builder, Duyệt data
                  </span>
                </div>
                <span className="rounded-full bg-paper-200 px-2 py-0.5 text-[0.5625rem] text-ink-500">
                  Sắp có
                </span>
              </div>

              <a
                href="/app"
                className="flex items-center justify-between rounded-2xl border border-accent/40 bg-paper-000 p-3 transition-[transform] hover:scale-[1.02] hover:border-accent"
              >
                <div>
                  <span className="block text-xs font-bold text-ink-900">
                    Phân hệ 3: Looker Responsive App
                  </span>
                  <span className="block text-[0.625rem] text-ink-500">
                    Radar GPS, Chụp ảnh Watermark, Ví 9Pay
                  </span>
                </div>
                <span className="rounded-full bg-accent px-2 py-0.5 text-[0.5625rem] font-bold text-paper-000 uppercase">
                  Mở App →
                </span>
              </a>
            </div>
          </div>
        )}

        {/* Nút kích hoạt Floating Pill bo tròn */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="panel-light flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-ink-900 backdrop-blur-xl elevated transition-[transform] duration-160 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
          </span>
          <span>Demo Suite: Phân Hệ 1</span>
          <span className="font-mono text-[0.625rem] text-ink-500">
            {isOpen ? '▲' : '▼'}
          </span>
        </button>
      </div>
    </aside>
  );
}
