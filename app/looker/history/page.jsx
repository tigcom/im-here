'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, MapPin } from 'lucide-react';

import { getListingDetailsByLooker } from '@/lib/selectors';
import { getSubmissionByListing } from '@/lib/data';
import { LISTING_STATUS } from '@/lib/constants';
import { formatVnd, formatDateTime } from '@/lib/format';
import Skeleton from '@/components/common/Skeleton';
import SyncBadge from '@/components/common/SyncBadge';

import api from '@/lib/api';

export default function LookerHistoryPage() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      try {
        const assignedTasks = await api.tasks.getMyAssigned();
        if (Array.isArray(assignedTasks)) {
          // Lọc ra các task đã hoàn thành (APPROVED)
          const completed = assignedTasks.filter(
            (t) => t.status === 'APPROVED' || t.status === 'COMPLETED'
          );
          setTasks(completed);
        }
      } catch (err) {
        console.error('Lỗi tải lịch sử nhận việc:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="min-h-dvh bg-paper-100 text-ink-900 p-4 max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/looker"
          className="p-2 rounded-xl bg-paper-000 border border-rule-subtle text-ink-700 hover:bg-paper-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-accent bg-accent-quiet px-3 py-1 rounded-full uppercase">
            VIỆC ĐÃ LÀM ({tasks.length})
          </span>
          <SyncBadge isSyncing={isLoading} label="Đang tải..." idleLabel="Đã đồng bộ" />
        </div>
        <div className="w-4" />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" className="p-4" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-center text-xs text-ink-500 py-12 animate-render-reveal">
          Bạn chưa hoàn thành tin đăng nào.
        </p>
      ) : (
        <div className="space-y-3 animate-render-reveal">
          {tasks.map((t) => {
            const submission = getSubmissionByListing(t.id);
            return (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-paper-000 border border-rule-subtle space-y-3 text-xs shadow-[0_2px_8px_oklch(0.18_0.04_235/0.04)]"
              >
                <div className="flex gap-3">
                  {submission?.thumbnail && (
                    <img
                      src={submission.thumbnail}
                      alt={t.title}
                      className="w-16 h-16 rounded-xl object-cover border border-rule-subtle flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-mono text-[10px] text-accent font-bold">{t.id}</span>
                      <span className="font-mono text-accent font-bold">
                        {formatVnd(t.rewardAmount || t.reward || 0)}
                      </span>
                    </div>
                    <h2 className="font-bold text-ink-900 line-clamp-1">{t.title}</h2>
                    <p className="text-[11px] text-ink-500 line-clamp-1 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                      {t.address || t.location?.address || 'Điểm thực địa'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-rule-subtle text-[11px]">
                  <span className="text-ink-500">
                    {formatDateTime(t.updatedAt || submission?.submittedAt || t.deadlineAt || t.deadline)}
                  </span>
                  <span className="text-accent font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã nghiệm thu hoàn thành
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
