'use client';

import Link from 'next/link';
import { Bell, CheckSquare, Layers, Wallet, MapPin, ShieldCheck, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import useNotifications from '@/hooks/useNotifications';
import { formatRelative } from '@/lib/format';

const TYPE_STYLE = {
  TASK_NEW_NEARBY: { icon: Layers, tone: 'bg-accent-quiet text-accent' },
  TASK_ASSIGNED: { icon: MapPin, tone: 'bg-accent-blue/15 text-accent-blue' },
  TASK_CHECKED_IN: { icon: MapPin, tone: 'bg-accent-blue/15 text-accent-blue' },
  TASK_SUBMITTED: { icon: CheckSquare, tone: 'bg-accent-blue/15 text-accent-blue' },
  TASK_APPROVED: { icon: CheckSquare, tone: 'bg-accent-quiet text-accent' },
  WALLET_DEPOSIT: { icon: Wallet, tone: 'bg-accent-quiet text-accent' },
  WALLET_REWARD: { icon: Wallet, tone: 'bg-accent-quiet text-accent' },
  NEW_REVIEW: { icon: ShieldCheck, tone: 'bg-paper-200 text-ink-700' },
  NEW_MESSAGE: { icon: Bell, tone: 'bg-accent-blue/15 text-accent-blue' },
};

export default function NotificationsInbox({ variant = 'client' }) {
  const { currentUser } = useAuth();
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotifications(currentUser?.id);
  const dark = variant === 'admin';
  const pageClass = dark ? 'text-on-surface-900' : 'text-ink-900';
  const cardClass = dark ? 'bg-surface-900 border-rule-dark' : 'bg-paper-000 border-rule-subtle';
  const mutedClass = dark ? 'text-on-surface-500' : 'text-ink-500';

  return (
    <section className={`mx-auto max-w-3xl space-y-5 ${pageClass}`} aria-busy={isLoading}>
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          {variant === 'looker' && (
            <Link href="/looker" aria-label="Quay lại" className="flex h-11 w-11 items-center justify-center rounded-xl border border-rule-subtle bg-paper-000 text-ink-700 focus-visible:outline-2 focus-visible:outline-accent">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          <div>
            <h1 className="font-display text-xl font-bold">Thông báo</h1>
            <p className={`mt-1 text-xs ${mutedClass}`}>
              {isLoading ? 'Đang tải thông báo…' : `${notifications.length} thông báo · ${unreadCount} chưa đọc`}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={markAllRead} className="min-h-11 rounded-xl px-3 text-xs font-bold text-accent hover:bg-accent/10 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-accent">
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </header>

      {isLoading ? (
        <div className={`rounded-2xl border p-8 text-center text-xs ${cardClass} ${mutedClass}`} role="status">Đang tải thông báo…</div>
      ) : notifications.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center ${cardClass}`}>
          <Bell className={`mx-auto mb-3 h-6 w-6 ${mutedClass}`} />
          <p className="text-sm font-bold">Chưa có thông báo nào</p>
          <p className={`mt-1 text-xs ${mutedClass}`}>Thông tin mới sẽ xuất hiện tại đây.</p>
        </div>
      ) : (
        <div className={`divide-y rounded-2xl border px-5 ${dark ? 'divide-rule-dark' : 'divide-rule-subtle'} ${cardClass}`}>
          {notifications.map((notification) => {
            const style = TYPE_STYLE[notification.type] || { icon: Bell, tone: 'bg-paper-200 text-ink-700' };
            const Icon = style.icon;
            const content = (
              <>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.tone}`}><Icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <span className="text-xs font-bold">{notification.title}</span>
                    <time className={`text-[10px] ${mutedClass}`} dateTime={notification.createdAt}>{formatRelative(notification.createdAt)}</time>
                  </span>
                  <span className={`mt-1 block text-xs leading-relaxed ${mutedClass}`}>{notification.body}</span>
                </span>
                {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Chưa đọc" />}
              </>
            );
            const className = `flex min-h-[72px] w-full items-start gap-3 py-4 text-left focus-visible:outline-2 focus-visible:outline-accent ${notification.read ? 'opacity-80' : ''}`;
            return (
              <article key={notification.id}>
                {notification.linkUrl ? (
                  <Link href={notification.linkUrl} onClick={() => !notification.read && markRead(notification.id)} className={`${className} hover:opacity-100 active:scale-[0.995]`}>
                    {content}
                  </Link>
                ) : (
                  <div className={className}>{content}</div>
                )}
                {!notification.read && !notification.linkUrl && (
                  <button type="button" onClick={() => markRead(notification.id)} className="mb-3 inline-flex min-h-11 items-center gap-1.5 text-[11px] font-semibold text-accent focus-visible:outline-2 focus-visible:outline-accent">
                    <Check className="h-3.5 w-3.5" /> Đánh dấu đã đọc
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
