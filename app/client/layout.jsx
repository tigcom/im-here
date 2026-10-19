'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Layers, 
  PlusCircle, 
  CheckSquare, 
  Wallet, 
  Bell, 
  Settings, 
  Building2, 
  User,
  Menu, 
  X, 
  ChevronRight,
  CreditCard,
  Lock,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import useNotifications from '@/hooks/useNotifications';
import { formatVnd } from '@/lib/format';
import { HIRER_TYPE } from '@/lib/constants';
import api from '@/lib/api';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const { currentUser, ready, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [realBalance, setRealBalance] = useState(currentUser?.walletBalance || 0);

  const { unreadCount } = useNotifications(currentUser?.id);
  const isIndividual = currentUser?.hirerType === HIRER_TYPE.INDIVIDUAL;
  // BRD chỉ yêu cầu KYC với người nhận việc; người đăng tin vẫn được dùng luồng thuê việc.
  const isKycApproved = true;

  useEffect(() => {
    if (ready && !currentUser) {
      const redirectUrl = encodeURIComponent(pathname || '/client/dashboard');
      window.location.href = `/login?redirect=${redirectUrl}`;
    }
  }, [ready, currentUser, pathname]);

  useEffect(() => {
    let isMounted = true;
    if (currentUser) {
      api.wallet.getMyWallet()
        .then((w) => {
          if (isMounted && w && typeof w.balance !== 'undefined') {
            setRealBalance(Number(w.balance));
          }
        })
        .catch((err) => console.warn('Lỗi lấy ví người dùng:', err));
    }

    return () => { isMounted = false; };
  }, [currentUser]);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setIsSidebarOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isSidebarOpen]);

  const navItems = [
    { label: 'Tổng Quan', href: '/client/dashboard', icon: LayoutDashboard },
    { label: 'Tin Đã Đăng', href: '/client/campaigns', icon: Layers },
    { label: 'Đăng Tin Mới', href: '/client/campaigns/new', icon: PlusCircle, isHighlight: true },
    { label: 'Chờ Xác Nhận', href: '/client/campaigns', icon: CheckSquare },
    { label: 'Ví & Quỹ Ký Quỹ', href: '/client/billing', icon: Wallet },
    { label: 'Thông Báo', href: '/client/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
    { label: 'Cài Đặt Hồ Sơ', href: '/client/settings', icon: Settings },
  ];

  if (!ready || !currentUser) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-paper-100 text-ink-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-ink-500">Đang chuyển hướng đến đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex bg-paper-100 text-ink-900">
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-ink-900/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Desktop & Mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-paper-000 border-r border-rule-strong flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header Sidebar */}
          <div className="h-16 px-5 border-b border-rule-subtle flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/android-chrome-192x192.png" alt="Logo" className="w-8 h-8 object-contain" />
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold text-ink-900 leading-none">
                  Im-Here<span className="text-accent">.</span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-accent-blue font-bold mt-0.5">
                  Cổng Người Đăng Tin
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-paper-200"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hirer Profile Box */}
          <div className={`p-4 mx-3 my-3 bg-paper-100 rounded-2xl border border-rule-subtle transition-opacity ${
            !isKycApproved ? 'opacity-40 grayscale pointer-events-none select-none' : ''
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent-quiet text-accent flex items-center justify-center font-bold font-display text-sm">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-ink-900 truncate">
                  {currentUser?.name || 'Nguyễn Thị Lan'}
                </span>
                <span className="block text-[10px] text-ink-500 truncate font-mono">
                  {isIndividual ? 'Người đăng: Cá nhân' : 'Người đăng: Doanh nghiệp'}
                </span>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-rule-subtle flex items-center justify-between text-[11px]">
              <span className="text-ink-500">Số dư khả dụng:</span>
              <span className="font-mono font-bold text-accent">
                {formatVnd(realBalance)}
              </span>
            </div>
          </div>

          {/* Navigation Links — Disable click và màu âm bản khi chưa xác thực */}
          <nav className="px-3 py-2 space-y-1" aria-label="Điều hướng người đăng tin">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              // Trạng thái chưa xác thực hồ sơ: KHÓA CLICK VÀ ÂM BẢN
              if (!isKycApproved) {
                if (item.isHighlight) {
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold my-2 bg-paper-200 text-ink-400 border border-rule-subtle cursor-not-allowed select-none opacity-50"
                      title="Chức năng bị khóa: Yêu cầu xác thực hồ sơ trước khi đăng tin"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 flex-shrink-0 text-ink-400" />
                        <span>{item.label}</span>
                      </div>
                      <Lock className="w-3.5 h-3.5 text-ink-400" />
                    </div>
                  );
                }

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-ink-400 cursor-not-allowed select-none opacity-40 grayscale"
                    title="Chức năng tạm khóa cho đến khi duyệt hồ sơ"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    <Lock className="w-3 h-3 text-ink-300" />
                  </div>
                );
              }

              // Trạng thái đã duyệt hồ sơ: Hoạt động bình thường
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    item.isHighlight
                      ? 'bg-accent text-paper-000 hover:bg-accent-hover font-bold my-2'
                      : isActive
                      ? 'bg-accent-quiet text-accent font-bold'
                      : 'text-ink-700 hover:text-ink-900 hover:bg-paper-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-danger text-paper-000">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="p-3 border-t border-rule-subtle space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-paper-100">
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150"}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-bold text-ink-900 truncate">
                {currentUser?.name || currentUser?.fullName || 'Người đăng tin'}
              </span>
              <span className="block text-[10px] text-ink-500 truncate">
                {currentUser?.email || 'Tài Khoản Người Đăng Tin'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <Link
              href="/role-select"
              className="flex-1 flex items-center justify-center gap-1 py-2 px-2 text-[11px] font-semibold text-ink-700 hover:text-ink-900 hover:bg-paper-200 rounded-lg transition-colors border border-rule-subtle"
            >
              <span>Đổi vai trò</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center justify-center gap-1 py-2 px-2.5 text-[11px] font-semibold text-danger/80 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors border border-danger/20"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-4 sm:px-8 bg-paper-000 border-b border-rule-subtle flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-rule-subtle text-ink-700 hover:bg-paper-100"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-ink-500">Cổng Người Đăng Tin /</span>{' '}
              <span className="text-xs font-bold text-ink-900">
                {isKycApproved ? 'Quản Lý Tin Đăng' : 'Xác Thực Danh Tính Bắt Buộc'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isKycApproved ? (
              <Link
                href="/client/billing"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-quiet text-accent border border-accent/20 text-xs font-bold"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Ví: {formatVnd(realBalance)}</span>
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper-100 text-ink-400 border border-rule-subtle text-xs font-medium cursor-not-allowed select-none opacity-50">
                <CreditCard className="w-3.5 h-3.5 text-ink-400" />
                <span>Ví: 0đ (Khóa)</span>
              </div>
            )}

            {isKycApproved ? (
              <Link
                href="/client/campaigns/new"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-paper-000 text-xs font-bold transition-[background-color,color]"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng Tin Mới</span>
                <span className="sm:hidden">Tạo mới</span>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper-200 text-ink-500 border border-rule-subtle text-xs font-semibold select-none">
                <Lock className="w-3.5 h-3.5 text-ink-400" />
                <span className="hidden sm:inline">Chưa xác thực hồ sơ</span>
              </div>
            )}

            {/* Nút Đăng xuất ở Top Header */}
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rule-subtle hover:border-danger/30 hover:bg-danger/10 text-ink-700 hover:text-danger text-xs font-semibold transition-colors"
              title="Đăng xuất tài khoản"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Dynamic page content — Bắt buộc xác thực hồ sơ (KYC Gate) */}
        <main className={`flex-1 p-4 sm:p-8 min-w-0 ${!isKycApproved ? 'bg-paper-100/60' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
