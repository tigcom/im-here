'use client';

import { useState } from 'react';
import { ShieldAlert, Lock, CheckCircle2 } from 'lucide-react';
import { FRAUD_ALERTS, getUserById } from '@/lib/data';
import { getSubmissionDetail } from '@/lib/selectors';
import { FRAUD_STATUS, FRAUD_TYPE } from '@/lib/constants';
import { formatRelative } from '@/lib/format';
import api from '@/lib/api';

// Nhãn tiếng Việt cho từng loại cảnh báo.
const FRAUD_TYPE_LABEL = {
  [FRAUD_TYPE.MOCK_GPS]: 'Giả lập vị trí (Mock GPS)',
  [FRAUD_TYPE.RE_SHOT_SCREEN]: 'Chụp lại từ màn hình khác',
  [FRAUD_TYPE.DEVICE_TAMPER]: 'Can thiệp thiết bị',
};

/** Suy tên đối tượng nghi vấn từ `subjectType` + `subjectId`. */
function resolveSubjectName(alert) {
  if (alert.subjectType === 'USER') {
    return getUserById(alert.subjectId)?.name || 'Người dùng không xác định';
  }
  if (alert.subjectType === 'SUBMISSION') {
    const sub = getSubmissionDetail(alert.subjectId);
    return sub?.looker?.name || sub?.listing?.title || 'Kết quả không xác định';
  }
  return 'Không xác định';
}

export default function AdminFraudControlPage() {
  const [fraudAlerts, setFraudAlerts] = useState(FRAUD_ALERTS);

  const handleDismiss = (id) => {
    setFraudAlerts(
      fraudAlerts.map((item) =>
        item.id === id
          ? { ...item, status: FRAUD_STATUS.DISMISSED, actionTaken: 'Đã bỏ qua cảnh báo' }
          : item
      )
    );
  };

  const handleLockPermanent = async (id) => {
    const item = fraudAlerts.find((a) => a.id === id);
    if (!item) return;

    if (!confirm('Bạn có chắc chắn muốn khoá vĩnh viễn tài khoản đối tượng này?')) {
      return;
    }

    try {
      const targetUserId = Number(String(item.subjectId).replace(/\D/g, '')) || item.subjectId;
      if (targetUserId) {
        await api.admin.updateUserStatus(targetUserId, 'BLOCKED');
      }
      setFraudAlerts(
        fraudAlerts.map((it) =>
          it.id === id
            ? {
                ...it,
                status: FRAUD_STATUS.LOCKED,
                actionTaken: 'Đã khoá tài khoản trên hệ thống & phong tỏa số dư',
              }
            : it
        )
      );
    } catch (err) {
      console.error('Lỗi khoá tài khoản fraud:', err);
      alert(err.message || 'Không thể khoá tài khoản lúc này.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-on-surface-900">
          Trung Tâm Cảnh Báo Gian Lận
        </h1>
        <p className="text-xs text-on-surface-500 mt-0.5">
          Hệ thống phát hiện giả lập vị trí, can thiệp thiết bị và ảnh chụp gian lận trong kết quả nộp
        </p>
      </div>

      <div className="space-y-4">
        {fraudAlerts.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-[22px] bg-surface-900 border border-danger/30 space-y-3 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule-dark pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-danger/20 text-danger">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-mono text-[10px] text-danger font-bold uppercase">
                    {item.id} • {FRAUD_TYPE_LABEL[item.type] || item.type}
                  </span>
                  <h2 className="font-display text-sm font-bold text-on-surface-900">
                    {item.title}
                  </h2>
                </div>
              </div>
              <span className="font-mono text-[11px] text-danger font-bold px-2 py-0.5 rounded-full bg-danger/15">
                Độ tin cậy: {item.confidence}%
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start justify-between gap-3 text-on-surface-700">
              <div className="flex-1">
                <span className="text-on-surface-500 block text-[11px]">Đối tượng nghi vấn:</span>
                <span className="font-bold text-on-surface-900">{resolveSubjectName(item)}</span>
              </div>
              <div className="flex-1">
                <span className="text-on-surface-500 block text-[11px]">Khu vực xảy ra:</span>
                <span className="font-bold text-on-surface-900">{item.location}</span>
              </div>
              <div className="flex-1">
                <span className="text-on-surface-500 block text-[11px]">Phát hiện:</span>
                <span className="font-bold text-on-surface-900">{formatRelative(item.detectedAt)}</span>
              </div>
            </div>

            <p className="p-3 rounded-xl bg-surface-950 text-on-surface-500 leading-relaxed text-[11px]">
              {item.details}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-[11px] font-bold text-on-surface-500">
                Xử lý: {item.actionTaken || 'Chưa xử lý'}
              </span>
              <div className="flex items-center gap-2">
                {item.status === FRAUD_STATUS.LOCKED ? (
                  <span className="text-danger font-mono font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã khoá tài khoản
                  </span>
                ) : item.status === FRAUD_STATUS.DISMISSED ? (
                  <span className="text-on-surface-500 font-mono font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã bỏ qua cảnh báo
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDismiss(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-on-surface-700 font-bold transition-colors"
                    >
                      Bỏ qua cảnh báo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLockPermanent(item.id)}
                      className="px-4 py-1.5 rounded-lg bg-danger hover:bg-danger/90 text-paper-000 font-bold flex items-center gap-1 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Khoá tài khoản</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {fraudAlerts.filter((f) => f.status === FRAUD_STATUS.ACTIVE).length === 0 && (
          <div className="p-8 text-center rounded-[24px] bg-surface-900 border border-rule-dark text-on-surface-500 text-xs">
            Hiện không có cảnh báo gian lận nào đang mở. Chợ đang hoạt động an toàn.
          </div>
        )}
      </div>
    </div>
  );
}
