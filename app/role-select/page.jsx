'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { UserCheck, PlusCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function RoleSelectPage() {
  const router = useRouter();
  const { switchAppMode } = useAuth();
  const [selectedPath, setSelectedPath] = useState(null);

  const handleChoose = (mode, path) => {
    setSelectedPath(path);
    switchAppMode(mode);
    router.push(path);
  };

  return (
    <div className="min-h-dvh flex flex-col justify-center items-center bg-paper-100 px-4 py-16 relative">
      <div className="w-full max-w-4xl z-10">
        <div className="text-center mb-10">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent bg-accent-quiet px-3 py-1 rounded-full inline-block mb-3">
            CHỌN KHÔNG GIAN HOẠT ĐỘNG
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-ink-900">
            Hôm Nay Bạn Muốn Làm Gì?
          </h1>
          <p className="text-sm sm:text-base text-ink-700 mt-2 max-w-xl mx-auto">
            Im-Here là nền tảng 2 chiều: cùng 1 tài khoản bạn có thể nhận việc kiếm tiền hoặc đăng việc thuê người bất cứ lúc nào.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Card 1: Người nhận việc (Doer / Looker) - 7 cột */}
          <div className="col-span-12 md:col-span-7 card-float bg-paper-000 p-6 sm:p-8 rounded-[24px] border border-rule-strong flex flex-col justify-between hover:border-accent transition-[transform,border-color] hover:-translate-y-1 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-accent-quiet text-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-wider block mb-1">
                LỰA CHỌN 01
              </span>
              <h2 className="font-display text-2xl font-bold text-ink-900 mb-2">
                Nhận Việc Làm (Looker)
              </h2>
              <p className="text-xs text-ink-500 mb-4 leading-relaxed">
                Dành cho lúc bạn rảnh rỗi bước ra đường muốn kiếm thêm thu nhập. Bật GPS quét việc quanh toạ độ hiện tại, check-in thực tế và nhận thù lao tự động vào ví.
              </p>
              <ul className="space-y-2.5 text-xs text-ink-700 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>Quét bản đồ việc làm lân cận bán kính GPS</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>Đi chợ mua hộ, xếp hàng, kiểm tra quầy kệ thực địa</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>Nộp bằng chứng ảnh &amp; nhận tiền thù lao về ví ngay</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              disabled={Boolean(selectedPath)}
              onClick={() => handleChoose('doer', '/looker')}
              className="w-full py-3.5 px-4 rounded-xl font-display font-bold text-xs bg-accent hover:bg-accent-hover text-paper-000 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {selectedPath === '/looker' ? (
                <>
                  <LoadingSpinner size="xs" color="white" />
                  <span>Đang mở ứng dụng Nhận việc...</span>
                </>
              ) : (
                <>
                  <span>Vào ứng dụng Nhận việc</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Card 2: Người đăng tin (Hirer / Client) - 5 cột */}
          <div className="col-span-12 md:col-span-5 card-float bg-paper-000 p-6 sm:p-8 rounded-[24px] border border-rule-strong flex flex-col justify-between hover:border-accent-blue transition-[transform,border-color] hover:-translate-y-1 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <span className="font-mono text-[10px] font-bold text-accent-blue uppercase tracking-wider block mb-1">
                LỰA CHỌN 02
              </span>
              <h2 className="font-display text-2xl font-bold text-ink-900 mb-2">
                Đăng Việc Thuê (Client)
              </h2>
              <p className="text-xs text-ink-500 mb-4 leading-relaxed">
                Tạo nhiệm vụ nhờ người hỗ trợ: đi mua đồ, xếp hàng, kiểm tra hiện trạng mặt bằng hay audit quầy kệ doanh nghiệp.
              </p>
              <ul className="space-y-2.5 text-xs text-ink-700 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-blue flex-shrink-0" />
                  <span>Đăng tin nhanh kèm định vị toạ độ</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-blue flex-shrink-0" />
                  <span>Ký quỹ an toàn, nghiệm thu mới trả tiền</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-blue flex-shrink-0" />
                  <span>Theo dõi tiến độ di chuyển của người làm</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              disabled={Boolean(selectedPath)}
              onClick={() => handleChoose('hirer', '/client/dashboard')}
              className="w-full py-3.5 px-4 rounded-xl font-display font-bold text-xs bg-ink-900 hover:bg-surface-800 text-paper-000 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {selectedPath === '/client/dashboard' ? (
                <>
                  <LoadingSpinner size="xs" color="white" />
                  <span>Đang mở không gian đăng việc...</span>
                </>
              ) : (
                <>
                  <span>Đăng việc thuê người</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Điều hướng về trang chủ */}
        <div className="text-center mt-10 space-y-2">
          <div>
            <Link href="/" className="text-xs text-ink-500 hover:text-ink-900 underline">
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
