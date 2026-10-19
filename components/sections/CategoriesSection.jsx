'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CATEGORY_GROUP, CATEGORY_GROUP_LABEL } from '@/lib/constants';
import { getCategoriesByGroup, getActiveCategories } from '@/lib/data/categories';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Bốn nhóm ngang hàng. Kiểm định CHỈ là một nhóm — không phải bản thân sản phẩm.
 * Thứ tự và độ lớn cột cố tình để nhóm Kiểm định nhỏ nhất, nằm cuối.
 */
const GROUPS = [
  { key: CATEGORY_GROUP.ERRAND, span: 'lg:col-span-7', accent: 'text-accent' },
  { key: CATEGORY_GROUP.DELIVERY, span: 'lg:col-span-5', accent: 'text-accent-blue' },
  { key: CATEGORY_GROUP.ASSIST, span: 'lg:col-span-8', accent: 'text-accent-orange' },
  { key: CATEGORY_GROUP.VERIFICATION, span: 'lg:col-span-4', accent: 'text-accent-amber' },
];

export default function CategoriesSection() {
  const root = useRef(null);
  const total = getActiveCategories().length;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.cat-group-card', {
          y: 40,
          opacity: 0,
          duration: 0.85,
          stagger: 0.14,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: root.current,
            start: 'top 72%',
            once: true,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      id="viec-gi-cung-co"
      ref={root}
      className="relative bg-paper-100/50 px-[6vw] py-12 md:py-16"
    >
      <div className="mx-auto max-w-[1600px]">
        {/* Tiêu đề phân khu — lưới 8/4 */}
        <div className="mb-14 grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 lg:col-span-8">
            <span className="label text-accent font-semibold block">02 — VIỆC GÌ CŨNG CÓ</span>
            <h2 className="display-lg mt-3 font-bold text-ink-900">
              Một chợ, {total} thứ việc.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <p className="body-md text-ink-700">
              Từ việc vặt trong ngày tới kiểm định chuyên sâu — mọi nhu cầu đều đăng
              được. Nhóm kiểm định chỉ là một nhóm ngang hàng, không phải cả sản phẩm.
            </p>
          </div>
        </div>

        {/* Lưới bất đối xứng 7/5 · 8/4 */}
        <div className="grid grid-cols-12 gap-8">
          {GROUPS.map(({ key, span, accent }) => {
            const cats = getCategoriesByGroup(key);
            return (
              <div
                key={key}
                className={`cat-group-card card-float col-span-12 ${span} p-7 md:p-9`}
              >
                <div className="flex items-center justify-between border-b border-rule-subtle pb-4">
                  <span className={`display-md font-bold ${accent}`}>
                    {CATEGORY_GROUP_LABEL[key]}
                  </span>
                  <span className="rounded-full bg-paper-200 px-3 py-1 font-mono text-[0.625rem] font-bold text-ink-700">
                    {cats.length} loại việc
                  </span>
                </div>

                <ul className="mt-6 space-y-5">
                  {cats.map((cat) => (
                    <li key={cat.id} className="border-l-2 border-rule-strong pl-4">
                      <span className="font-display text-base font-bold text-ink-900 block">
                        {cat.name}
                      </span>
                      <p className="body-md mt-1 text-ink-700">{cat.description}</p>
                      {cat.examples?.length > 0 && (
                        <p className="mt-1.5 text-xs text-ink-500">
                          Ví dụ: {cat.examples.join(' · ')}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
