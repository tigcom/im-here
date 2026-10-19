'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Users, 
  CheckSquare, 
  AlertTriangle, 
  DollarSign,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  Tags,
  Bell,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import useNotifications from '@/hooks/useNotifications';
import { getAdminOverview } from '@/lib/data';
import { ROLE_LABEL } from '@/lib/constants';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, ready, logout } = useAuth();
  const { unreadCount } = useNotifications(currentUser?.id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const overview = getAdminOverview();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setIsSidebarOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isSidebarOpen]);

  // 1. Chờ khôi phục phiên xác thực từ localStorage / cookie, tuyệt đối không render dữ liệu quản trị
  if (!ready) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-surface-950 text-on-surface-900 space-y-4">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs text-on-surface-700 tracking-wider">Đang kiểm tra phiên quản trị...</span>
      </div>
    );
  }

  // 2. Phân quyền RBAC nghiêm ngặt: Chỉ ROLE_ADMIN mới được truy cập CMS
  if (!currentUser || currentUser.backendRole !== 'ROLE_ADMIN') {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 bg-surface-950 text-on-surface-900">
        <div className="max-w-md w-full p-8 rounded-3xl bg-surface-900 border border-rule-dark text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-danger/15 text-danger flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-on-surface-900">
              Tài khoản chưa có quyền truy cập
            </h1>
            <p className="text-xs text-on-surface-700 mt-2 leading-relaxed">
              Khu vực này chỉ dành cho tài khoản quản trị. Vui lòng đăng nhập bằng tài khoản phù hợp để tiếp tục.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/login?redirect=/admin/dashboard"
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-paper-000 font-bold text-xs transition-colors"
            >
              Đăng nhập tài khoản quản trị
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 rounded-xl border border-rule-dark hover:bg-surface-800 text-on-surface-700 font-semibold text-xs transition-colors"
            >
              Quay lại Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: '01 — Quản Lý Nhiệm Vụ & Tranh Chấp', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: '02 — Hồ Sơ Định Danh', href: '/admin/workforce', icon: Users, badge: overview.pendingKyc },
    { label: '03 — Quản Lý Tài Chính & Rút Tiền', href: '/admin/finance', icon: DollarSign },
    { label: '04 — Thông Báo', href: '/admin/notifications', icon: Bell, badge: unreadCount },
  ].map((item) => ({ ...item, badge: item.badge > 0 ? String(item.badge) : null }));

  return (
    <div className="min-h-dvh flex bg-surface-950 text-on-surface-900 selection:bg-accent-quiet">
      {/* Drawer Overlay Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-ink-900/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Admin Dark Navy */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-surface-900 border-r border-rule-dark flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header */}
          <div className="h-16 px-5 border-b border-rule-dark flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/android-chrome-192x192.png" alt="Logo" className="w-8 h-8 object-contain" />
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold text-on-surface-900 leading-none">
                  Im-Here<span className="text-accent">.</span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-accent-amber font-bold mt-0.5">
                  Quản trị hệ thống
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-on-surface-500 hover:text-on-surface-900 hover:bg-surface-800"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Radar Live Status */}
          <div className="p-3 mx-3 my-3 rounded-2xl bg-surface-800/80 border border-rule-dark text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span className="font-mono text-[11px] text-on-surface-700">63 Tỉnh Thành Online</span>
            </div>
            <span className="font-mono text-[10px] text-accent font-bold">LIVE</span>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1.5" aria-label="Điều hướng quản trị">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin/dashboard' && pathname.startsWith(item.href + '/'));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-accent text-paper-000 font-bold'
                      : 'text-on-surface-700 hover:text-on-surface-900 hover:bg-surface-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        item.isWarning
                          ? 'bg-danger text-paper-000 animate-pulse'
                          : isActive
                          ? 'bg-paper-000 text-ink-900'
                          : 'bg-surface-700 text-on-surface-900'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin */}
        <div className="p-3 border-t border-rule-dark space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-800">
            {currentUser ? (
              <>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-on-surface-900 truncate">
                    {currentUser.name}
                  </span>
                  <span className="block text-[10px] text-accent-amber truncate font-mono">
                    {currentUser.title || ROLE_LABEL[currentUser.role] || 'Quản trị viên'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <span className="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center text-on-surface-500 font-mono text-xs">
                  ?
                </span>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-on-surface-500 truncate">
                    Chưa đăng nhập
                  </span>
                  <span className="block text-[10px] text-on-surface-500 truncate font-mono">
                    Không có phiên quản trị
                  </span>
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold text-danger hover:text-paper-000 bg-danger/10 hover:bg-danger rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="h-16 px-4 sm:px-8 bg-surface-900/90 backdrop-blur-md border-b border-rule-dark flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-rule-dark text-on-surface-700 hover:bg-surface-800"
              aria-label="Mở menu quản trị"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-on-surface-500">Quản Trị Viên /</span>{' '}
              <span className="text-xs font-bold text-on-surface-900">Bảng Điều Hành Chợ Lao Động</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-amber/15 text-accent-amber text-xs font-mono font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              LÁ CHẮN CHỐNG GIAN LẬN KÍCH HOẠT
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 text-xs font-semibold transition-colors"
              title="Đăng xuất khỏi trang quản trị"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
