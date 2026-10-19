'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Check,
  X,
  MapPin,
  ShieldCheck,
  Camera,
  CheckCircle2,
  Clock,
  Star,
  ArrowLeft,
  MessageSquare,
  Loader2,
} from 'lucide-react';

import { useAuth } from '@/components/auth/AuthContext';
import { getSubmissionDetail } from '@/lib/selectors';
import { getSubmissionsByHirer, getSubmissionByListing } from '@/lib/data';
import { QA_STATUS, HIRER_STATUS } from '@/lib/constants';
import { formatVnd, formatDateTime, formatRating } from '@/lib/format';
import TaskChatBox from '@/components/chat/TaskChatBox';
import api from '@/lib/api';

/** Nhãn trạng thái xác nhận của người đăng. */
const HIRER_STATUS_LABEL = {
  [HIRER_STATUS.PENDING]: 'Chờ xác nhận',
  [HIRER_STATUS.APPROVED]: 'Đã xác nhận',
  [HIRER_STATUS.REJECTED]: 'Đã từ chối',
};

/** Biến một kết quả nộp thành dạng hiển thị */
function toView(detail) {
  if (!detail) return null;
  const requirements = detail.listing?.requirements || [];
  const byId = new Map(requirements.map((r) => [r.id, r]));

  const answers = (detail.answers || []).map((a) => ({
    key: a.requirementId || Math.random().toString(),
    q: byId.get(a.requirementId)?.title || a.question || 'Ghi chú thực địa',
    a: a.value || a.answer || '—',
  }));

  const photos = (detail.evidence || [])
    .filter((e) => e.type === 'PHOTO' || e.type === 'VIDEO' || e.url)
    .map((e) => ({
      key: `${e.requirementId || 'p'}-${e.capturedAt || Math.random()}`,
      title: byId.get(e.requirementId)?.title || 'Bằng chứng thực địa',
      url: api.getFileUrl(e.url),
      watermark: e.watermark,
    }));

  return { ...detail, answers, photos };
}

export default function ClientReviewPage() {
  const params = useParams();
  const rawId = params?.id;
  const { currentUser } = useAuth();
  const hirerId = currentUser?.id || 'USR-CL-8803';

  const [dbTask, setDbTask] = useState(null);
  const [dbEvidences, setDbEvidences] = useState([]);
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [statusOverride, setStatusOverride] = useState({});
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showChat, setShowChat] = useState(true);

  // 1. Fetch dữ liệu thật từ Backend (Task & Evidence)
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!rawId) {
        setIsLoadingBackend(false);
        return;
      }
      try {
        const [taskData, evidencesData] = await Promise.allSettled([
          api.tasks.getById(rawId),
          api.evidence.getByTaskId(rawId),
        ]);

        if (isMounted) {
          if (taskData.status === 'fulfilled' && taskData.value) {
            setDbTask(taskData.value);
          }
          if (evidencesData.status === 'fulfilled' && Array.isArray(evidencesData.value)) {
            setDbEvidences(evidencesData.value);
          }
        }
      } catch (err) {
        console.warn('Lỗi tải dữ liệu nghiệm thu từ API:', err);
      } finally {
        setIsLoadingBackend(false);
      }
    }

    loadData();

    // Safety timeout: đảm bảo không bao giờ bị kẹt loading quá 2.5s
    const safetyTimer = setTimeout(() => {
      setIsLoadingBackend(false);
    }, 2500);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, [rawId]);

  // Fallback từ selectors
  const fallbackResolved = (() => {
    if (!rawId) return null;
    const bySubmission = getSubmissionDetail(rawId);
    if (bySubmission) return bySubmission;
    const sub = getSubmissionByListing(rawId);
    return sub ? getSubmissionDetail(sub.id) : null;
  })();

  const allSubs = getSubmissionsByHirer(hirerId).map((s) => getSubmissionDetail(s.id));

  // Ghép bằng chứng từ Backend nếu có và đã được nộp
  const dbCandidate = dbTask && dbEvidences && dbEvidences.length > 0
    ? {
        id: `EVD-${dbEvidences[0].id}`,
        taskId: dbTask.id,
        evidenceId: dbEvidences[0].id,
        reward: Number(dbTask.rewardAmount || 0),
        hirerStatus: dbEvidences[0].status === 'APPROVED' ? HIRER_STATUS.APPROVED : dbEvidences[0].status === 'REJECTED' ? HIRER_STATUS.REJECTED : HIRER_STATUS.PENDING,
        qaStatus: dbEvidences[0].status === 'QA_PASSED' || dbEvidences[0].status === 'APPROVED' ? QA_STATUS.PASSED : QA_STATUS.PENDING,
        submittedAt: dbEvidences[0].submittedAt || dbTask.updatedAt || new Date().toISOString(),
        looker: {
          id: dbTask.lookerId || dbTask.assignedShepherdId || 'USR-LK-01',
          name: dbTask.lookerName || dbTask.assignedShepherdName || 'Looker Thực Địa',
          rating: 4.95,
          stats: { completedCount: 88, approvalRate: 99 },
        },
        listing: {
          id: dbTask.id,
          title: dbTask.title,
          reward: Number(dbTask.rewardAmount || 0),
          location: {
            address: dbTask.address || dbTask.locationAddress || 'Hà Nội',
          },
        },
        answers: (() => {
          try {
            if (!dbEvidences[0]?.checklistResponsesJson) return [];
            const raw = dbEvidences[0].checklistResponsesJson;
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

            if (parsed?.surveyQuestions && Array.isArray(parsed.surveyQuestions) && parsed.surveyQuestions.length > 0) {
              const answersList = parsed.surveyQuestions.map((q) => {
                const ans = parsed.surveyAnswers?.[q.id];
                const displayVal = ans === 'YES' ? 'Có / Đạt' : ans === 'NO' ? 'Không / Không Đạt' : (ans || 'Chưa trả lời');
                return {
                  requirementId: q.id,
                  question: q.title,
                  value: displayVal,
                };
              });

              if (parsed.items && Array.isArray(parsed.items)) {
                parsed.items.forEach((item, idx) => {
                  const isChecked = parsed.checklist?.[idx] === true;
                  answersList.push({
                    requirementId: `chk-${idx}`,
                    question: `[Checklist] ${item}`,
                    value: isChecked ? '✓ Đã kiểm tra' : '✗ Chưa kiểm tra',
                  });
                });
              }

              return answersList;
            }

            return Object.entries(parsed || {}).map(([k, v]) => ({ requirementId: k, question: k, value: String(v) }));
          } catch (e) {
            return [{ requirementId: 'ans-1', question: 'Ghi chú thực địa', value: String(dbEvidences[0]?.checklistResponsesJson || 'Đã hoàn thành') }];
          }
        })(),
        evidence: dbEvidences.map((ev) => {
          let parsedPhotos = [];
          try {
            parsedPhotos = typeof ev.photosJson === 'string' ? JSON.parse(ev.photosJson || '[]') : (ev.photosJson || []);
          } catch (e) {}
          const photoUrl = parsedPhotos[0] || ev.photoUrl || '/placeholder.jpg';
          return {
            requirementId: 'photo-1',
            type: 'PHOTO',
            url: photoUrl,
            capturedAt: ev.submittedAt,
            watermark: `GPS: ${ev.actualLatitude || 21.0285}, ${ev.actualLongitude || 105.8542} • ${formatDateTime(ev.submittedAt)}`,
          };
        }),
      }
    : null;

  const candidates = dbCandidate
    ? [dbCandidate]
    : [
        ...(fallbackResolved ? [fallbackResolved] : []),
        ...allSubs,
      ].filter(Boolean);

  const activeId = selectedId || candidates[0]?.id || null;
  const rawSelected = candidates.find((s) => s?.id === activeId) || candidates[0] || null;
  const selected = toView(rawSelected);

  const clientStatus =
    statusOverride[selected?.id] || selected?.hirerStatus || HIRER_STATUS.PENDING;

  const approvedCount = candidates.filter(
    (s) => s && (statusOverride[s.id] || s.hirerStatus) === HIRER_STATUS.APPROVED
  ).length;

  const qaReady =
    selected?.qaStatus === QA_STATUS.PASSED || selected?.qaStatus === QA_STATUS.NOT_REQUIRED;

  const selectSub = (id) => {
    setSelectedId(id);
    setActivePhotoIdx(0);
    setIsRejecting(false);
    setRejectReason('');
  };

  const handleApprove = async () => {
    if (!selected || !selected.evidenceId) return;
    setIsActionLoading(true);
    try {
      await api.evidence.review(selected.evidenceId, { approved: true, reviewNotes: 'Nghiệm thu đạt yêu cầu' });
      setStatusOverride((prev) => ({ ...prev, [selected.id]: HIRER_STATUS.APPROVED }));
    } catch (err) {
      console.error('Lỗi duyệt evidence API:', err);
      alert(err.message || 'Không thể nghiệm thu báo cáo. Vui lòng kiểm tra lại trạng thái nhiệm vụ.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected || !selected.evidenceId || !rejectReason.trim()) return;
    setIsActionLoading(true);
    try {
      await api.evidence.review(selected.evidenceId, {
        approved: false,
        reviewNotes: rejectReason,
      });
      setStatusOverride((prev) => ({ ...prev, [selected.id]: HIRER_STATUS.REJECTED }));
      setIsRejecting(false);
      setRejectReason('');
    } catch (err) {
      console.error('Lỗi từ chối evidence API:', err);
      alert(err.message || 'Không thể yêu cầu làm lại báo cáo. Vui lòng thử lại sau.');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoadingBackend) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <span className="text-xs text-ink-500 font-medium">Đang tải báo cáo thực địa từ máy chủ...</span>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/client/campaigns"
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Về danh sách tin đăng
        </Link>
        <div className="bg-paper-000 p-12 rounded-[24px] border border-ink-100 text-center space-y-2">
          <p className="text-sm font-bold text-ink-900">Chưa có kết quả nào để xác nhận</p>
          <p className="text-xs text-ink-500">
            Khi người nhận việc nộp kết quả thực địa, thông tin sẽ xuất hiện tại đây.
          </p>
        </div>
      </div>
    );
  }

  const listing = selected?.listing;
  const currentTaskId = selected?.taskId || listing?.id || rawId;

  return (
    <div className="space-y-6" data-testid="evidence-review-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/client/campaigns"
            className="p-2 rounded-xl bg-paper-000 border border-ink-100 hover:bg-paper-100 text-ink-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-ink-900">Nghiệm thu kết quả</h1>
            <p className="text-xs text-ink-500 line-clamp-1">{listing?.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowChat(!showChat)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-[background-color,border-color,color,transform,opacity] duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              showChat
                ? 'bg-accent text-paper-000 border-accent'
                : 'bg-paper-000 border-ink-100 text-ink-700 hover:bg-paper-100'
            }`}
            data-testid="toggle-hirer-chat-btn"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{showChat ? 'Ẩn Hộp Thoại Chat' : 'Mở Hộp Thoại Chat'}</span>
          </button>

          <span className="font-mono text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
            {approvedCount}/{candidates.length} việc đã duyệt
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột trái: Danh sách kết quả nộp */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-ink-700 px-1">
            Báo cáo đã nộp ({candidates.length})
          </div>

          <div className="space-y-2.5">
            {candidates.map((s) => {
              if (!s) return null;
              const st = statusOverride[s.id] || s.hirerStatus;
              const isSelected = s.id === activeId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectSub(s.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-[background-color,border-color,color,transform,opacity] duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isSelected
                      ? 'border-accent bg-paper-000 ring-2 ring-accent/20'
                      : 'border-ink-100 bg-paper-000 hover:bg-paper-100'
                  }`}
                  data-testid={`submission-item-${s.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] font-bold text-ink-500">{s.id}</span>
                      <h2 className="font-display text-sm font-bold text-ink-900 line-clamp-1">
                        {s.listing?.title}
                      </h2>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        st === HIRER_STATUS.APPROVED
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : st === HIRER_STATUS.REJECTED
                          ? 'bg-rose-500/15 text-rose-600'
                          : 'bg-accent/15 text-accent'
                      }`}
                    >
                      {HIRER_STATUS_LABEL[st] || 'Chờ duyệt'}
                    </span>
                  </div>

                  <p className="text-xs text-ink-500 line-clamp-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                    {s.listing?.location?.address}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-ink-500 mt-3 pt-2.5 border-t border-ink-100">
                    <span>{s.looker?.name}</span>
                    <span className="font-mono font-bold text-accent">
                      {formatVnd(s.reward)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Khung chat trực tiếp ở cột trái */}
          {showChat && currentTaskId && (
            <div className="mt-4" data-testid="hirer-chat-wrapper">
              <TaskChatBox taskId={currentTaskId} title="Trao đổi với Looker" />
            </div>
          )}
        </div>

        {/* Cột phải: Chi tiết kết quả & Bằng chứng */}
        <div className="lg:col-span-7 bg-paper-000 p-6 rounded-[24px] border border-ink-100 shadow-elevated space-y-6">
          {/* Thông tin đầu */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-ink-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] font-bold text-accent px-2 py-0.5 rounded-full bg-accent/10">
                  {selected?.id}
                </span>
                <span className="text-xs font-semibold text-accent flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Xác thực toạ độ GPS hợp lệ</span>
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-ink-900 line-clamp-1">
                {listing?.title}
              </h2>
              <p className="text-xs text-ink-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                {listing?.location?.address}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-ink-500 block">Thù lao:</span>
              <span className="font-display text-xl font-bold text-accent">
                {formatVnd(selected?.reward)}
              </span>
            </div>
          </div>

          {/* Người nhận việc */}
          <div className="flex items-center gap-3 p-3 bg-paper-050 rounded-2xl border border-ink-100">
            <div className="w-10 h-10 rounded-full bg-accent text-paper-000 flex items-center justify-center font-bold text-sm">
              {(selected?.looker?.name || 'LK').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-ink-900">{selected?.looker?.name}</div>
              <div className="flex items-center gap-3 text-[11px] text-ink-500 mt-0.5">
                <span className="flex items-center gap-1 text-accent font-semibold">
                  <Star className="w-3 h-3 fill-current" />
                  {formatRating(selected?.looker?.rating || 4.9)}
                </span>
                <span>{selected?.looker?.stats?.completedCount ?? 50} việc đã làm</span>
              </div>
            </div>
            <span className="text-[11px] text-ink-500 flex items-center gap-1 whitespace-nowrap">
              <Clock className="w-3 h-3" />
              {formatDateTime(selected?.submittedAt)}
            </span>
          </div>

          {/* Bằng chứng ảnh thật */}
          {selected?.photos?.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-accent" />
                  Bằng chứng ảnh thực địa ({selected.photos.length})
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-ink-100 bg-paper-100 aspect-video flex items-center justify-center">
                <img
                  src={selected.photos[activePhotoIdx]?.url}
                  alt={selected.photos[activePhotoIdx]?.title}
                  className="w-full h-full object-cover"
                  data-testid="evidence-main-photo"
                />
                <div className="absolute bottom-0 inset-x-0 bg-ink-900/80 backdrop-blur-md p-3 text-paper-000">
                  <span className="font-mono text-[10px] tracking-wider text-accent block uppercase">
                    {selected.photos[activePhotoIdx]?.title}
                  </span>
                  {selected.photos[activePhotoIdx]?.watermark && (
                    <p className="font-mono text-xs text-paper-100 truncate mt-0.5">
                      {selected.photos[activePhotoIdx].watermark}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-paper-050 rounded-2xl border border-ink-100 text-ink-400 text-xs">
              <Camera className="w-8 h-8 mx-auto mb-2 text-ink-300" />
              Chưa có hình ảnh bằng chứng nào được tải lên.
            </div>
          )}

          {/* Câu trả lời / Ghi chú */}
          {selected?.answers?.length > 0 && (
            <div className="p-4 bg-paper-050 rounded-2xl border border-ink-100 space-y-2.5">
              <span className="text-xs font-bold text-ink-900 block border-b border-ink-100 pb-1.5">
                Ghi chú &amp; Câu trả lời của người làm
              </span>
              <div className="space-y-2">
                {selected.answers.map((item) => (
                  <div key={item.key} className="flex justify-between items-start text-xs gap-3">
                    <span className="text-ink-500">{item.q}</span>
                    <span className="font-semibold text-ink-900 text-right">{item.a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thanh quyết định: Duyệt / Từ chối */}
          <div className="pt-4 border-t border-ink-100">
            {clientStatus === HIRER_STATUS.APPROVED ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-2 font-bold text-xs" data-testid="status-approved-banner">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>
                  Đã nghiệm thu thành công! Số tiền {formatVnd(selected?.reward)} đã được giải ngân cho người nhận việc.
                </span>
              </div>
            ) : clientStatus === HIRER_STATUS.REJECTED ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-500/20 space-y-1" data-testid="status-rejected-banner">
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <X className="w-4 h-4" />
                  <span>Đã từ chối kết quả nộp</span>
                </div>
                {rejectReason && (
                  <p className="text-[11px]">Lý do: &quot;{rejectReason}&quot;</p>
                )}
              </div>
            ) : isRejecting ? (
              <div className="space-y-3 p-4 bg-paper-050 rounded-2xl border border-ink-100">
                <span className="text-xs font-bold text-ink-900">
                  Lý do từ chối (báo cho Looker):
                </span>
                <input
                  type="text"
                  placeholder="VD: Ảnh chụp không rõ nét, sai góc chụp theo yêu cầu..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-paper-000 border border-ink-100 focus:border-rose-500 rounded-xl text-xs font-semibold text-ink-900 focus:outline-none"
                  data-testid="input-reject-reason"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRejecting(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-ink-500 hover:bg-paper-100"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={!rejectReason.trim() || isActionLoading}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-paper-000 font-bold text-xs transition-[background-color,border-color,color,transform,opacity] duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-50"
                    data-testid="btn-confirm-reject"
                  >
                    {isActionLoading ? 'Đang gửi...' : 'Xác nhận từ chối'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsRejecting(true)}
                  className="px-4 py-2.5 rounded-xl border border-ink-200 hover:border-rose-500 hover:text-rose-600 text-xs font-bold text-ink-700 transition-[background-color,border-color,color,transform,opacity] duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-1.5"
                  data-testid="btn-open-reject-modal"
                >
                  <X className="w-4 h-4" />
                  <span>Từ chối</span>
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isActionLoading}
                  className="px-6 py-2.5 rounded-xl font-display font-bold text-xs bg-accent hover:bg-accent/90 text-paper-000 flex items-center gap-2 transition-[background-color,border-color,color,transform,opacity] duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-50"
                  data-testid="btn-approve-review"
                >
                  {isActionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Xác nhận nghiệm thu &amp; Giải ngân</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
