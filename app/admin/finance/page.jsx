'use client';

import { useEffect, useState } from 'react';
import { Check, X, Building2 } from 'lucide-react';
import api from '@/lib/api';
import { formatVnd, formatDateTime } from '@/lib/format';

export default function AdminFinancePage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  const loadWithdrawals = async () => {
    setIsLoading(true);
    try {
      setWithdrawals(await api.admin.getPendingWithdrawals());
    } catch (error) {
      setActionError(error.message || 'Không tải được danh sách yêu cầu rút tiền.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadWithdrawals(); }, []);

  const [processingId, setProcessingId] = useState(null);

  const handleReview = async (id, approved) => {
    if (processingId) return;
    setActionError('');
    let note = '';
    if (!approved) {
      const reason = window.prompt('Nhập lý do từ chối yêu cầu rút tiền (bắt buộc):', 'Thông tin số tài khoản hoặc chủ thẻ không khớp với hồ sơ KYC');
      if (!reason || !reason.trim()) {
        return; // Bắt buộc phải có lý do nếu từ chối
      }
      note = reason.trim();
    } else {
      if (!window.confirm('Xác nhận duyệt chi và chuyển khoản qua cổng 9Pay?')) {
        return;
      }
      note = 'Đã giải ngân qua cổng 9Pay';
    }

    setProcessingId(id);
    try {
      await api.admin.reviewWithdrawal(id, approved, note);
      await loadWithdrawals();
    } catch (error) {
      setActionError(error.message || 'Không thể xử lý yêu cầu rút tiền.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-on-surface-900">
          Đối Soát Tài Chính &amp; Chi Trả 9Pay
        </h1>
        <p className="text-xs text-on-surface-500 mt-0.5">
          Giám sát dòng tiền ký quỹ của người đăng tin và lệnh giải ngân thù lao cho người nhận việc
        </p>
      </div>

      {/* Danh Sách Lệnh Rút Tiền */}
      <div className="p-6 rounded-[24px] bg-surface-900 border border-rule-dark space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule-dark pb-3">
          <div>
            <h2 className="font-display text-base font-bold text-on-surface-900">
              Lệnh Rút Tiền Về Ngân Hàng
            </h2>
            <span className="font-mono text-[11px] text-accent">Cổng 9Pay Payout 24/7</span>
          </div>

          <span className="font-mono text-[11px] text-on-surface-500">{withdrawals.length} yêu cầu đang chờ</span>
        </div>

        {actionError && <p className="text-xs text-danger">{actionError}</p>}

        <div className="divide-y divide-rule-dark text-xs">
          {withdrawals.map((w) => (
            <div key={w.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-accent font-bold">#{w.id}</span>
                  <span className="font-bold text-on-surface-900">{w.wallet?.user?.fullName || 'Người nhận việc'}</span>
                </div>
                <div className="text-on-surface-500 text-[11px] mt-1 flex items-center gap-2 flex-wrap">
                  <Building2 className="w-3.5 h-3.5 text-accent" />
                  <span>
                    <strong className="font-mono text-on-surface-700">{w.description}</strong>
                  </span>
                  <span>• {formatDateTime(w.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono text-sm font-bold text-accent">{formatVnd(Math.abs(Number(w.amount || 0)))}</span>
                <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReview(w.id, false)}
                      className="px-3 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-danger font-bold transition-colors flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Từ Chối</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReview(w.id, true)}
                      className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-paper-000 font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Duyệt Chi 9Pay</span>
                    </button>
                </div>
              </div>
            </div>
          ))}
          {!isLoading && withdrawals.length === 0 && (
            <div className="py-8 text-center text-on-surface-500">
              Không có lệnh rút tiền nào phù hợp với bộ lọc
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
