'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  CheckCircle2,
  QrCode,
  RefreshCw,
  Wallet,
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '@/components/auth/AuthContext';
import { TXN_DIRECTION, TXN_TYPE_LABEL, TXN_STATUS } from '@/lib/constants';
import { formatVnd, formatDateTime } from '@/lib/format';
import Skeleton from '@/components/common/Skeleton';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SyncBadge from '@/components/common/SyncBadge';
import api from '@/lib/api';

function useModalA11y(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);
}

export default function ClientBillingPage() {
  const { currentUser } = useAuth();

  const [balance, setBalance] = useState(currentUser?.walletBalance || 0);
  const [escrowBalance, setEscrowBalance] = useState(0);
  const [realTransactions, setRealTransactions] = useState([]);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState(500000);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const paidCount = realTransactions.filter(t => t.type === 'ESCROW_RELEASE' || t.type === 'PAYMENT').length;
  const totalPaid = realTransactions
    .filter(t => t.type === 'ESCROW_RELEASE' || t.type === 'PAYMENT')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalFee = 0;

  useEffect(() => {
    let isMounted = true;
    const fetchRealData = async () => {
      try {
        const [w, txs] = await Promise.all([
          api.wallet.getMyWallet(),
          api.wallet.getTransactions()
        ]);
        if (isMounted) {
          if (w) {
            setBalance(Number(w.balance || 0));
            setEscrowBalance(Number(w.escrowBalance || 0));
          }
          if (txs && Array.isArray(txs)) {
            setRealTransactions(txs);
          }
        }
      } catch (e) {
        console.warn('Lỗi lấy dữ liệu ví thật:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchRealData();
    return () => { isMounted = false; };
  }, []);

  useModalA11y(isDepositModalOpen, () => setIsDepositModalOpen(false));

  const handleDeposit = async () => {
    setIsDepositing(true);
    try {
      await api.wallet.deposit(Number(depositAmount), 'Nạp tiền vào ví thực tế');
      const w = await api.wallet.getMyWallet();
      const txs = await api.wallet.getTransactions();
      if (w) setBalance(Number(w.balance || 0));
      if (txs) setRealTransactions(txs);
      setDepositSuccess(true);
      setTimeout(() => {
        setDepositSuccess(false);
        setIsDepositModalOpen(false);
      }, 800);
    } catch (e) {
      console.warn('Lỗi nạp tiền qua API:', e);
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Ví Tài Khoản &amp; Ký Quỹ Escrow</h1>
        <p className="text-xs text-ink-500 mt-1">
          Ký quỹ đảm bảo khi đăng việc, giải ngân tự động khi nghiệm thu, và đối soát lịch sử giao dịch.
        </p>
      </div>

      {/* Thẻ số dư */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 p-6 sm:p-8 rounded-[24px] panel-navy border border-rule-dark relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 emerald-glow opacity-30 pointer-events-none" />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-accent-quiet text-accent flex items-center justify-center font-bold">
                9P
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-accent tracking-widest block">
                  VÍ NGƯỜI ĐĂNG TIN
                </span>
                <span className="text-xs text-on-surface-700">
                  Đối tác fintech 9Pay bảo chứng
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-accent bg-accent/15 px-2.5 py-1 rounded-full uppercase font-bold">
              KẾT NỐI THỜI GIAN THỰC
            </span>
          </div>

          <div>
            <span className="text-xs text-on-surface-500 block">Số dư khả dụng:</span>
            <div className="font-display text-3xl sm:text-4xl font-bold text-on-surface-900 mt-1 tracking-tight">
              {formatVnd(balance)}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-on-surface-700">
              <span>Đang giữ: <strong>{formatVnd(escrowBalance)}</strong></span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-rule-dark flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-on-surface-700">
              Người đăng: <strong>{currentUser?.fullName || currentUser?.email || '—'}</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsDepositModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-paper-000 font-display font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Nạp tiền vào ví</span>
            </button>
          </div>
        </div>

        {/* Đối soát */}
        <div className="md:col-span-4 card-float bg-paper-000 p-6 rounded-[24px] border border-rule-strong flex flex-col justify-between space-y-4">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-ink-500 tracking-wider block mb-1">
              ĐỐI SOÁT
            </span>
            <div className="font-display text-xl font-bold text-ink-900">Chi tiêu hợp lệ</div>
            <p className="text-xs text-ink-500 mt-1">
              Đã chi trả cho {paidCount} việc hoàn thành.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-rule-subtle text-xs">
            <div className="flex justify-between text-ink-700">
              <span>Tổng thù lao đã trả:</span>
              <span className="font-mono font-bold text-ink-900">{formatVnd(totalPaid)}</span>
            </div>
            <div className="flex justify-between text-ink-700">
              <span>Phí nền tảng:</span>
              <span className="font-mono font-bold text-ink-900">{formatVnd(totalFee)}</span>
            </div>
            <div className="flex justify-between text-ink-700">
              <span>Đang giữ:</span>
              <span className="font-mono font-bold text-ink-900">{formatVnd(escrowBalance)}</span>
            </div>
          </div>

          <button
            type="button"
            disabled
            title="Sắp có"
            className="w-full py-2.5 rounded-xl border border-rule-subtle text-xs font-bold text-ink-500 flex items-center justify-center gap-1.5 opacity-70 cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải bảng kê thuế (PDF)</span>
            <span className="font-mono text-[10px] text-accent">Sắp có</span>
          </button>
        </div>
      </div>

      {/* Lịch sử giao dịch */}
      <div className="card-float bg-paper-000 p-6 rounded-[24px] border border-rule-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-rule-subtle pb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-accent" />
            <h2 className="font-display text-base font-bold text-ink-900">Lịch sử giao dịch &amp; Ký quỹ</h2>
          </div>
          <span className="text-xs text-ink-500">Hiển thị {realTransactions.length} giao dịch gần nhất</span>
        </div>

        {realTransactions.length === 0 ? (
          <p className="text-center text-xs text-ink-500 py-10">
            Chưa có giao dịch phát sinh nào trong sổ cái.
          </p>
        ) : (
          <div className="divide-y divide-rule-subtle">
            {realTransactions.map((tx) => {
              const isIn = tx.type === 'DEPOSIT' || tx.type === 'ESCROW_RELEASE';
              return (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isIn ? 'bg-accent/15 text-accent' : 'bg-paper-200 text-ink-700'
                      }`}
                    >
                      {isIn ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-ink-900 line-clamp-1">
                        {tx.description}
                      </div>
                      <div className="text-[11px] text-ink-500 mt-0.5">
                        {tx.type === 'ESCROW_HOLD' ? 'Tạm giữ ký quỹ' : tx.type === 'DEPOSIT' ? 'Nạp tiền ví' : tx.type} • #{tx.id} • {formatDateTime(tx.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-mono text-sm font-bold ${
                        isIn ? 'text-accent' : 'text-danger'
                      }`}
                    >
                      {isIn ? `+${formatVnd(tx.amount)}` : `-${formatVnd(tx.amount)}`}
                    </div>
                    <span className="text-[10px] font-mono text-ink-500">
                      {tx.status === 'SUCCESS' ? 'Thành công' : tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal nạp tiền */}
      {isDepositModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm modal-backdrop"
          onClick={() => setIsDepositModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="deposit-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="card-float bg-paper-000 max-w-md w-full p-6 rounded-[24px] border border-rule-strong space-y-5 modal-panel"
          >
            <div className="flex items-center justify-between border-b border-rule-subtle pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-accent" />
                <h3 id="deposit-modal-title" className="font-display text-base font-bold text-ink-900">
                  Nạp tiền vào ví qua 9Pay
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-ink-500 hover:text-ink-900 hover:bg-paper-200 transition-colors"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-ink-700">
                Chọn gói hạn mức nạp:
              </label>
              <div className="flex items-center gap-2">
                {[10000000, 20000000, 50000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`flex-1 py-2 px-1 text-xs font-mono font-bold rounded-xl border text-center transition-colors ${
                      depositAmount === amt
                        ? 'border-accent bg-accent-quiet text-accent'
                        : 'border-rule-subtle bg-paper-100 text-ink-700 hover:bg-paper-200'
                    }`}
                  >
                    {amt / 1000000} Triệu
                  </button>
                ))}
              </div>

              <div className="p-4 bg-paper-100 rounded-2xl border border-rule-subtle text-center space-y-2 mt-4">
                <QrCode className="w-14 h-14 text-ink-900 mx-auto" />
                <span className="text-xs font-bold text-ink-900 block">
                  VietQR chuyển khoản định danh 24/7
                </span>
                <p className="text-[11px] text-ink-500">
                  Số tiền nạp:{' '}
                  <strong className="font-mono text-accent text-sm font-bold">
                    {formatVnd(depositAmount)}
                  </strong>
                </p>
                <p className="text-[10px] text-ink-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-accent" />
                  Giao dịch này không trừ tiền thật
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDeposit}
              disabled={isDepositing || depositSuccess}
              className="w-full py-3 rounded-xl font-display font-bold text-xs bg-accent hover:bg-accent-hover text-paper-000 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {depositSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Nạp thành công +{formatVnd(depositAmount)}</span>
                </>
              ) : isDepositing ? (
                <>
                  <LoadingSpinner size="xs" color="white" />
                  <span>Đang xử lý qua cổng 9Pay...</span>
                </>
              ) : (
                <span>Xác nhận nạp tiền</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
