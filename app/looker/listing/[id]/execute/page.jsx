'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MessageSquare,
  MapPin,
  Navigation,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Camera,
  Trash2,
  Check,
  AlertTriangle,
  Loader2,
  Lock,
  ExternalLink,
  ChevronRight,
  ClipboardList,
  Sparkles,
} from 'lucide-react';

import api from '@/lib/api';
import { useAuth } from '@/components/auth/AuthContext';
import { formatVnd, formatDistance, formatTimeLeft } from '@/lib/format';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AttendanceCapture from '@/components/attendance/AttendanceCapture';

export default function TaskExecuteMobilePage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params?.id;
  const { currentUser } = useAuth();

  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vị trí GPS của thiết bị
  const [currentGps, setCurrentGps] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Điều kiện 1: Điểm danh GPS
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInError, setCheckInError] = useState('');

  // Điều kiện 2: Ảnh bằng chứng
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isAttendanceCameraOpen, setIsAttendanceCameraOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Điều kiện 3: Checklist & Ghi chú
  const [checklistState, setChecklistState] = useState({});
  const [reportNote, setReportNote] = useState('');

  // Điều kiện 4 (Tùy chọn nếu người thuê có tạo): Câu hỏi khảo sát
  const [surveyAnswers, setSurveyAnswers] = useState({});

  // Trạng thái nộp nhiệm vụ
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // 1. Tải thông tin nhiệm vụ từ Backend API
  const loadTaskData = async () => {
    if (!taskId) return;
    try {
      const data = await api.tasks.getById(taskId);
      if (data) {
        setTask(data);
        setIsCheckedIn(Boolean(data.isCheckedIn));
        if (data.status === 'SUBMITTED' || data.status === 'APPROVED') {
          setIsSubmittedSuccess(true);
        }
      }
    } catch (err) {
      console.warn('Lỗi tải thông tin nhiệm vụ:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTaskData();
  }, [taskId]);

  // 2. Theo dõi vị trí GPS của điện thoại
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Không thể lấy GPS thiết bị:', err.message);
        setCheckInError('Không thể lấy vị trí thiết bị. Hãy cấp quyền vị trí rồi thử lại.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Tính khoảng cách mét thực tế từ vị trí hiện tại tới nhiệm vụ
  const distanceMeters = useMemo(() => {
    if (!currentGps || !task?.latitude || !task?.longitude) return null;
    const R = 6371e3;
    const φ1 = (currentGps.lat * Math.PI) / 180;
    const φ2 = (task.latitude * Math.PI) / 180;
    const Δφ = ((task.latitude - currentGps.lat) * Math.PI) / 180;
    const Δλ = ((task.longitude - currentGps.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }, [currentGps, task?.latitude, task?.longitude]);

  // Danh sách checklist mục kiểm tra
  const checklistItems = useMemo(() => {
    if (!task?.checklistRequirementsJson) {
      return [
        'Kiểm tra đúng biển hiệu và số nhà địa chỉ thực tế',
        'Chụp ảnh hiện trạng toàn cảnh mặt tiền địa điểm',
        'Ghi nhận các thông tin bất thường hoặc quầy kệ (nếu có)',
      ];
    }
    try {
      const parsed = JSON.parse(task.checklistRequirementsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => (typeof item === 'object' ? item.title || item.name : item));
      }
    } catch {}
    return [
      'Kiểm tra đúng biển hiệu và số nhà địa chỉ thực tế',
      'Chụp ảnh hiện trạng toàn cảnh mặt tiền địa điểm',
    ];
  }, [task?.checklistRequirementsJson]);

  // Khởi tạo checklist ban đầu nếu chưa có
  useEffect(() => {
    if (checklistItems.length > 0 && Object.keys(checklistState).length === 0) {
      const init = {};
      checklistItems.forEach((_, idx) => {
        init[idx] = false;
      });
      setChecklistState(init);
    }
  }, [checklistItems]);

  const toggleChecklist = (idx) => {
    setChecklistState((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // 3. THAO TÁC 1: Điểm danh GPS tại thực địa
  const handleCheckInGps = async () => {
    if (!taskId) return;
    setIsCheckingIn(true);
    setCheckInError('');

    try {
      if (!currentGps) {
        throw new Error('Cần cấp quyền vị trí thiết bị trước khi check-in.');
      }
      const lat = currentGps.lat;
      const lng = currentGps.lng;
      const res = await api.tasks.checkIn(taskId, lat, lng);
      setIsCheckedIn(true);
      if (res?.data) {
        setTask((prev) => ({ ...prev, isCheckedIn: true }));
      }
    } catch (err) {
      console.warn('Lỗi điểm danh GPS:', err.message);
      setCheckInError(err.message || 'Chưa đủ điều kiện điểm danh GPS tại địa điểm này.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  // 4. THAO TÁC 2: Chụp & Tải ảnh bằng chứng có Watermark GPS & Định danh
  const handleAttendancePhotoCaptured = async (result) => {
    setIsAttendanceCameraOpen(false);
    if (!result?.file) return;

    setIsUploadingPhoto(true);
    try {
      const res = await api.upload.file(result.file, { purpose: 'TASK_EVIDENCE', taskId });
      const photoUrl = res?.url;
      if (!photoUrl) throw new Error('Máy chủ không trả về URL ảnh đã lưu.');
      setUploadedPhotos((prev) => [...prev, photoUrl]);
    } catch (err) {
      console.error('Lỗi lưu ảnh bằng chứng:', err);
      setCheckInError(err.message || 'Không thể lưu ảnh bằng chứng đã nướng watermark lên máy chủ.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const res = await api.upload.file(file, { purpose: 'TASK_EVIDENCE', taskId });
      const photoUrl = res?.url;
      if (!photoUrl) throw new Error('Máy chủ không trả về URL ảnh đã lưu.');
      setUploadedPhotos((prev) => [...prev, photoUrl]);
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      setCheckInError(err.message || 'Không thể tải ảnh bằng chứng lên máy chủ.');
    } finally {
      setIsUploadingPhoto(false);
      // Reset input value để có thể chụp tiếp ảnh khác
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (indexToRemove) => {
    setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Danh sách câu hỏi khảo sát thực địa (Nếu người thuê có tạo)
  const surveyQuestions = useMemo(() => {
    if (!task?.questionsJson) return [];
    try {
      const parsed = JSON.parse(task.questionsJson);
      if (Array.isArray(parsed)) {
        return parsed.filter((q) => q && q.title && q.title.trim().length > 0);
      }
    } catch {}
    return [];
  }, [task?.questionsJson]);

  // 5. Kiểm tra điều kiện hoàn thành để bật nút Submit
  const isGpsConditionMet = isCheckedIn === true || task?.isCheckedIn === true;
  const isPhotoConditionMet = uploadedPhotos.length > 0;
  const totalChecklist = checklistItems.length;
  const checkedCount = Object.values(checklistState).filter(Boolean).length;
  const isChecklistConditionMet = totalChecklist === 0 || checkedCount === totalChecklist;

  const totalQuestions = surveyQuestions.length;
  const answeredQuestionsCount = surveyQuestions.filter((q) => {
    const ans = surveyAnswers[q.id];
    return ans !== undefined && ans !== null && String(ans).trim().length > 0;
  }).length;
  const isQuestionsConditionMet = totalQuestions === 0 || answeredQuestionsCount === totalQuestions;

  const isAllConditionsMet = isGpsConditionMet && isPhotoConditionMet && isChecklistConditionMet && isQuestionsConditionMet;

  const totalRequiredSteps = totalQuestions > 0 ? 4 : 3;
  const currentMetSteps =
    (isGpsConditionMet ? 1 : 0) +
    (isPhotoConditionMet ? 1 : 0) +
    (isChecklistConditionMet ? 1 : 0) +
    (totalQuestions > 0 && isQuestionsConditionMet ? 1 : 0);

  const [isAbandoning, setIsAbandoning] = useState(false);

  // Thao tác từ bỏ nhiệm vụ đang nhận
  const handleAbandonTask = async () => {
    if (!confirm('Bạn có chắc chắn muốn từ bỏ nhiệm vụ này? Nhiệm vụ sẽ được mở lại cho cộng đồng Looker khác.')) {
      return;
    }
    setIsAbandoning(true);
    try {
      await api.tasks.cancel(taskId);
      alert('Đã từ bỏ nhiệm vụ thành công.');
      router.push('/looker');
    } catch (err) {
      console.error('Lỗi từ bỏ nhiệm vụ:', err);
      alert(err.message || 'Không thể từ bỏ nhiệm vụ lúc này. Vui lòng thử lại.');
    } finally {
      setIsAbandoning(false);
    }
  };

  // 6. THAO TÁC 3: Nộp báo cáo nhiệm vụ hoàn thành
  const handleSubmitTask = async () => {
    if (!isAllConditionsMet || isSubmitting) return;

    if (!currentGps || !currentGps.lat || !currentGps.lng) {
      alert('Vui lòng bật định vị GPS trên điện thoại để ghi nhận tọa độ thực địa.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        actualLatitude: currentGps.lat,
        actualLongitude: currentGps.lng,
        photosJson: JSON.stringify(uploadedPhotos),
        checklistResponsesJson: JSON.stringify({
          checklist: checklistState,
          items: checklistItems,
          surveyQuestions: surveyQuestions,
          surveyAnswers: surveyAnswers,
        }),
        note: reportNote.trim() || 'Đã kiểm tra thực địa, hoàn tất đầy đủ các hạng mục yêu cầu.',
      };

      await api.evidence.submit(taskId, payload);
      setIsSubmittedSuccess(true);
      await loadTaskData();
    } catch (err) {
      console.error('Lỗi nộp báo cáo:', err);
      alert(err.message || 'Có lỗi xảy ra khi nộp báo cáo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-paper-100">
        <LoadingSpinner size="md" color="accent" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 bg-paper-100 p-6 text-center text-ink-900">
        <ClipboardList className="h-12 w-12 text-ink-400" />
        <h2 className="font-display text-lg font-bold">Không tìm thấy thông tin nhiệm vụ</h2>
        <Link
          href="/looker"
          className="rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-paper-000"
        >
          Quay lại danh sách việc
        </Link>
      </div>
    );
  }

  // Chặn nếu chưa KYC
  if (currentUser && currentUser.kycStatus !== 'DA_DUYET') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper-100 p-4">
        <div className="w-full max-w-md rounded-3xl bg-paper-000 p-6 text-center shadow-[0_16px_40px_oklch(0_0_0/0.08)] border border-rule-subtle space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="font-display text-xl font-bold text-ink-900">Yêu cầu hồ sơ định danh</h2>
          <p className="text-xs text-ink-500 leading-relaxed">
            Quy trình check-in GPS và gửi báo cáo thực địa chỉ dành cho tài khoản đã được duyệt CCCD &amp; quét mặt.
          </p>
          <Link
            href="/looker/onboarding"
            className="block w-full rounded-xl bg-accent py-3 text-xs font-bold text-paper-000"
          >
            Hoàn tất định danh ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-paper-100 text-ink-900 font-sans pb-32">
      {/* Ẩn file input native cho camera mobile */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoCapture}
      />

      {/* ── TOP MOBILE HEADER (Bám đỉnh, không popup dialog) ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-rule-subtle bg-paper-000/95 px-4 py-3 backdrop-blur-md">
        <Link
          href="/looker"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rule-subtle bg-paper-100 text-ink-700 hover:bg-paper-200 active:scale-95 transition-[transform,background-color]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="text-center min-w-0 px-2">
          <span className="font-mono text-[0.6875rem] font-bold text-accent uppercase tracking-wider block truncate">
            Nhiệm vụ #{task.id}
          </span>
          <span className="text-xs font-bold text-ink-900 truncate block">
            {task.category || 'Khảo sát thực địa'}
          </span>
        </div>

        {/* Nút Chat riêng biệt - Chuyển sang màn hình chat riêng chứ không mở dialog */}
        <Link
          href={`/looker/listing/${taskId}/chat`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10 border border-accent/30 text-accent font-bold text-xs hover:bg-accent/20 active:scale-95 transition-[transform,background-color]"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Chat</span>
        </Link>
      </header>

      {/* ── MAIN CONTENT (Cuộn dọc tự nhiên, không dialog chồng chéo) ── */}
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {/* BANNER YÊU CẦU LÀM LẠI / TỪ CHỐI BÁO CÁO */}
        {task.rejectionReason && (
          <div className="rounded-3xl border border-danger/40 bg-danger/10 p-5 space-y-2 shadow-[0_4px_16px_oklch(0.63_0.24_25/0.08)]">
            <div className="flex items-center gap-2 text-danger font-bold text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>Yêu cầu bổ sung / làm lại báo cáo</span>
            </div>
            <p className="text-xs text-ink-800 leading-relaxed">
              <strong>Lý do từ người thuê / Admin:</strong> {task.rejectionReason}
            </p>
            <p className="text-[0.6875rem] text-ink-600">
              Vui lòng kiểm tra lại yêu cầu thực địa, chụp bổ sung ảnh hoặc cập nhật checklist rồi nộp lại báo cáo.
            </p>
          </div>
        )}

        {/* BANNER THÀNH CÔNG NẾU ĐÃ NỘP */}
        {isSubmittedSuccess && (
          <div className="rounded-3xl border border-accent/40 bg-accent-quiet p-5 text-center space-y-2 shadow-[0_4px_16px_oklch(0_0_0/0.05)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-paper-000">
              <Check className="h-6 w-6 stroke-[3]" />
            </div>
            <h2 className="font-display text-lg font-bold text-ink-900">
              Báo cáo đã gửi thành công!
            </h2>
            <p className="text-xs text-ink-600 leading-relaxed max-w-md mx-auto">
              Nhiệm vụ đang ở trạng thái <strong>Chờ nghiệm thu</strong>. Người thuê sẽ kiểm tra ảnh &amp; toạ độ GPS để giải ngân <strong>{formatVnd(task.rewardAmount)}</strong> vào ví của bạn.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href={`/looker/listing/${taskId}/chat`}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-paper-000 text-xs font-bold hover:bg-accent-hover transition-colors"
              >
                <MessageSquare className="h-4 w-4" /> Nhắn tin với Người thuê
              </Link>
              <Link
                href="/looker"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rule-subtle bg-paper-000 text-ink-900 text-xs font-bold hover:bg-paper-100 transition-colors"
              >
                Về danh sách việc làm
              </Link>
            </div>
          </div>
        )}

        {/* THẺ TỔNG QUAN TIÊU ĐỀ & THÙ LAO */}
        <section className="rounded-3xl border border-rule-subtle bg-paper-000 p-5 space-y-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-[0.625rem] font-bold text-accent uppercase tracking-wider">
                {task.status === 'CREATED'
                  ? 'CHƯA NHẬN'
                  : task.status === 'ASSIGNED'
                  ? 'ĐANG THỰC HIỆN'
                  : task.status === 'SUBMITTED'
                  ? 'ĐÃ NỘP CHỜ DUYỆT'
                  : task.status}
              </span>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900 leading-snug">
                {task.title}
              </h1>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[0.625rem] font-bold uppercase tracking-wider text-ink-500 block">Thù lao</span>
              <span className="font-display text-xl sm:text-2xl font-black text-accent tabular-nums">
                {formatVnd(task.rewardAmount)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-rule-subtle pt-3 text-xs text-ink-600 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-ink-400" />
              Hạn hoàn thành: {formatTimeLeft(task.deadline)}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Ký quỹ 100% Escrow
            </span>
            <span className="flex items-center gap-1.5 text-ink-700 font-semibold font-sans">
              Người đăng: {task.clientName || 'Chưa cập nhật'}
            </span>
          </div>
        </section>

        {/* THẺ ĐỊA ĐIỂM & ĐỊNH VỊ GPS */}
        <section className="rounded-3xl border border-rule-subtle bg-paper-000 p-5 space-y-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent mt-0.5">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm font-bold text-ink-900">Địa điểm thực hiện</h3>
              <p className="text-xs text-ink-700 leading-relaxed mt-1">
                {task.address || 'Địa chỉ thực địa'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                {distanceMeters !== null && (
                  <span className={`font-bold ${distanceMeters <= 100 ? 'text-accent' : 'text-amber-600'}`}>
                    Cách bạn: {distanceMeters < 1000 ? `${distanceMeters}m` : `${(distanceMeters / 1000).toFixed(1)}km`}
                  </span>
                )}
                {task.latitude && task.longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent font-bold hover:underline"
                  >
                    <span>Mở Google Maps</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* THẺ HƯỚNG DẪN THỰC ĐỊA */}
        {(task.instructions || task.description) && (
          <section className="rounded-3xl border border-rule-subtle bg-paper-000 p-5 space-y-2 shadow-xs">
            <h3 className="font-display text-sm font-bold text-ink-900 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-accent" />
              Hướng dẫn từ người thuê
            </h3>
            {task.instructions && (
              <div className="rounded-2xl bg-paper-100 p-3.5 text-xs text-ink-800 leading-relaxed font-medium">
                {task.instructions}
              </div>
            )}
            {task.description && (
              <p className="text-xs text-ink-600 leading-relaxed pt-1">
                {task.description}
              </p>
            )}
          </section>
        )}

        {/* ── BỘ ĐIỀU KIỆN HOÀN THÀNH (CHECKLIST RÕ RÀNG, CUỘN TỰ NHIÊN) ── */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-display text-base font-bold text-ink-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              Điều Kiện Hoàn Thành Nhiệm Vụ
            </h2>
            <span className="font-mono text-xs font-bold text-accent bg-accent/15 px-2.5 py-1 rounded-full">
              {currentMetSteps} / {totalRequiredSteps} đạt
            </span>
          </div>

          <div className="space-y-4">
            {/* ĐIỀU KIỆN 1: ĐIỂM DANH GPS BÁN KÍNH <= 100M */}
            <div className={`rounded-3xl border p-5 transition-[background-color,border-color] ${
              isGpsConditionMet
                ? 'border-accent/40 bg-accent-quiet'
                : 'border-rule-subtle bg-paper-000'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                    isGpsConditionMet
                      ? 'bg-accent text-paper-000'
                      : 'bg-paper-100 text-ink-700 border border-rule-subtle'
                  }`}>
                    {isGpsConditionMet ? <Check className="h-4 w-4 stroke-[3]" /> : '1'}
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-ink-900">
                      Điểm danh GPS tại hiện trường (≤ 100m)
                    </h4>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {isGpsConditionMet
                        ? 'Đã xác nhận có mặt tại toạ độ thực địa hợp lệ.'
                        : 'Yêu cầu di chuyển đến vị trí thực địa và bấm điểm danh.'}
                    </p>
                  </div>
                </div>

                {isGpsConditionMet && (
                  <span className="shrink-0 rounded-full bg-accent px-2.5 py-0.5 font-mono text-[0.625rem] font-bold text-paper-000">
                    ĐÃ ĐẠT
                  </span>
                )}
              </div>

              {!isGpsConditionMet && (
                <div className="mt-4 pt-4 border-t border-rule-subtle space-y-3">
                  {checkInError && (
                    <div className="flex items-start gap-2 rounded-2xl bg-danger/10 p-3 text-xs text-danger font-medium">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{checkInError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs font-mono text-ink-500">
                    <span>Khoảng cách GPS:</span>
                    <strong className="text-ink-900">
                      {distanceMeters !== null ? `${distanceMeters} mét` : 'Đang đo...'}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckInGps}
                    disabled={isCheckingIn}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-xs font-bold text-paper-000 hover:bg-accent-hover active:scale-[0.98] transition-[transform,background-color] shadow-[0_4px_16px_oklch(0.68_0.198_152/0.25)] disabled:opacity-60"
                  >
                    {isCheckingIn ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Đang kiểm tra toạ độ vệ tinh...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4" /> Bấm Điểm Danh GPS Tại Đây
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* ĐIỀU KIỆN 2: CHỤP ẢNH BẰNG CHỨNG XÁC MINH */}
            <div className={`rounded-3xl border p-5 transition-[background-color,border-color] ${
              isPhotoConditionMet
                ? 'border-accent/40 bg-accent-quiet'
                : 'border-rule-subtle bg-paper-000'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                    isPhotoConditionMet
                      ? 'bg-accent text-paper-000'
                      : 'bg-paper-100 text-ink-700 border border-rule-subtle'
                  }`}>
                    {isPhotoConditionMet ? <Check className="h-4 w-4 stroke-[3]" /> : '2'}
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-ink-900">
                      Chụp ảnh bằng chứng thực địa
                    </h4>
                    <p className="text-xs text-ink-500 mt-0.5">
                      Chụp ít nhất 1 ảnh rõ nét mặt tiền, bảng hiệu hoặc quầy kệ tại chỗ.
                    </p>
                  </div>
                </div>

                <span className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[0.625rem] font-bold ${
                  isPhotoConditionMet
                    ? 'bg-accent text-paper-000'
                    : 'bg-paper-100 text-ink-500'
                }`}>
                  {uploadedPhotos.length} ảnh
                </span>
              </div>

              {/* LƯỚI ẢNH ĐÃ CHỤP */}
              {uploadedPhotos.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {uploadedPhotos.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] aspect-square rounded-2xl overflow-hidden border border-rule-subtle bg-paper-100 shadow-[0_2px_8px_oklch(0_0_0/0.06)]"
                    >
                      <img
                        src={url}
                        alt={`Ảnh bằng chứng #${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-danger text-paper-000 shadow-[0_4px_12px_oklch(0.63_0.24_25/0.3)] active:scale-90 transition-transform"
                        title="Xoá ảnh này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* NÚT CHỤP CAMERA WATERMARK CHỐNG FAKE */}
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setIsAttendanceCameraOpen(true)}
                  disabled={isUploadingPhoto}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3.5 text-xs font-bold text-paper-000 hover:bg-accent-hover active:scale-[0.98] transition-[transform,background-color] shadow-[0_4px_16px_oklch(0.68_0.198_152/0.25)] disabled:opacity-60"
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-paper-000" /> Đang lưu ảnh nướng watermark...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 text-paper-000" />
                      <span>Chụp Bằng Chứng (Tự Động Nướng GPS)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="px-4 py-3 rounded-2xl border border-rule-subtle bg-paper-100 hover:bg-paper-200 text-ink-600 text-xs font-semibold active:scale-[0.98] transition-[transform,background-color]"
                  title="Tải ảnh có sẵn nếu camera gặp sự cố"
                >
                  Tải file dự phòng
                </button>
              </div>
            </div>

            {/* ĐIỀU KIỆN 3: CHECKLIST & BÁO CÁO GHI CHÚ */}
            <div className={`rounded-3xl border p-5 transition-[background-color,border-color] ${
              isChecklistConditionMet
                ? 'border-accent/40 bg-accent-quiet'
                : 'border-rule-subtle bg-paper-000'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                    isChecklistConditionMet
                      ? 'bg-accent text-paper-000'
                      : 'bg-paper-100 text-ink-700 border border-rule-subtle'
                  }`}>
                    {isChecklistConditionMet ? <Check className="h-4 w-4 stroke-[3]" /> : '3'}
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-ink-900">
                      Checklist kiểm tra &amp; Ghi chú thực tế
                    </h4>
                    <p className="text-xs text-ink-500 mt-0.5">
                      Tích chọn các hạng mục đã hoàn thành ({checkedCount}/{totalChecklist}).
                    </p>
                  </div>
                </div>

                <span className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[0.625rem] font-bold ${
                  isChecklistConditionMet
                    ? 'bg-accent text-paper-000'
                    : 'bg-paper-100 text-ink-500'
                }`}>
                  {checkedCount}/{totalChecklist}
                </span>
              </div>

              {/* Danh sách checkbox dễ chạm bằng ngón tay trên mobile */}
              <div className="mt-4 space-y-2.5">
                {checklistItems.map((item, idx) => {
                  const isChecked = checklistState[idx] === true;
                  return (
                    <label
                      key={idx}
                      onClick={() => toggleChecklist(idx)}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition-[background-color,border-color] ${
                        isChecked
                          ? 'border-accent/40 bg-paper-000 text-ink-900 font-semibold'
                          : 'border-rule-subtle bg-paper-100/60 text-ink-700 hover:bg-paper-100'
                      }`}
                    >
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border mt-0.5 transition-colors ${
                        isChecked
                          ? 'border-accent bg-accent text-paper-000'
                          : 'border-ink-300 bg-paper-000'
                      }`}>
                        {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs leading-relaxed">{item}</span>
                    </label>
                  );
                })}
              </div>

              {/* Ô nhập ghi chú báo cáo */}
              <div className="mt-4 pt-4 border-t border-rule-subtle">
                <label className="block text-xs font-bold text-ink-700 mb-1.5">
                  Ghi chú kết quả thực địa (tuỳ chọn)
                </label>
                <textarea
                  rows={3}
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Ví dụ: Cửa hàng mở cửa bình thường, quầy kệ đã kiểm tra đầy đủ..."
                  className="w-full rounded-2xl border border-rule-subtle bg-paper-100 p-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-accent focus:bg-paper-000 focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            {/* ĐIỀU KIỆN 4: TRẢ LỜI CÂU HỎI KHẢO SÁT (NẾU NGƯỜI THUÊ CÓ TẠO) */}
            {totalQuestions > 0 && (
              <div className={`rounded-3xl border p-5 transition-[background-color,border-color] ${
                isQuestionsConditionMet
                  ? 'border-accent/40 bg-accent-quiet'
                  : 'border-rule-subtle bg-paper-000'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                      isQuestionsConditionMet
                        ? 'bg-accent text-paper-000'
                        : 'bg-paper-100 text-ink-700 border border-rule-subtle'
                    }`}>
                      {isQuestionsConditionMet ? <Check className="h-4 w-4 stroke-[3]" /> : '4'}
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-ink-900">
                        Câu hỏi khảo sát hiện trường
                      </h4>
                      <p className="text-xs text-ink-500 mt-0.5">
                        Trả lời các câu hỏi do người thuê yêu cầu ({answeredQuestionsCount}/{totalQuestions}).
                      </p>
                    </div>
                  </div>

                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[0.625rem] font-bold ${
                    isQuestionsConditionMet
                      ? 'bg-accent text-paper-000'
                      : 'bg-paper-100 text-ink-500'
                  }`}>
                    {answeredQuestionsCount}/{totalQuestions}
                  </span>
                </div>

                <div className="mt-4 space-y-3.5">
                  {surveyQuestions.map((q, idx) => {
                    const currentAnswer = surveyAnswers[q.id];

                    return (
                      <div
                        key={q.id || idx}
                        className="rounded-2xl border border-rule-subtle bg-paper-100/60 p-3.5 space-y-2.5"
                      >
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-paper-200 text-ink-700 text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-ink-900 leading-snug">
                            {q.title}
                          </span>
                        </div>

                        {q.type === 'YES_NO' ? (
                          <div className="flex gap-2 pl-7">
                            <button
                              type="button"
                              onClick={() => setSurveyAnswers((prev) => ({ ...prev, [q.id]: 'YES' }))}
                              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-[background-color,border-color] ${
                                currentAnswer === 'YES'
                                  ? 'bg-accent text-paper-000 border-accent shadow-[0_2px_8px_oklch(0.68_0.198_152/0.25)]'
                                  : 'bg-paper-000 text-ink-700 border-rule-subtle hover:bg-paper-100'
                              }`}
                            >
                              Có / Đạt
                            </button>
                            <button
                              type="button"
                              onClick={() => setSurveyAnswers((prev) => ({ ...prev, [q.id]: 'NO' }))}
                              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-[background-color,border-color] ${
                                currentAnswer === 'NO'
                                  ? 'bg-danger text-paper-000 border-danger shadow-[0_2px_8px_oklch(0.63_0.24_25/0.25)]'
                                  : 'bg-paper-000 text-ink-700 border-rule-subtle hover:bg-paper-100'
                              }`}
                            >
                              Không / Không Đạt
                            </button>
                          </div>
                        ) : (
                          <div className="pl-7">
                            <input
                              type="text"
                              value={currentAnswer || ''}
                              onChange={(e) => setSurveyAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                              placeholder="Nhập câu trả lời thực tế..."
                              className="w-full px-3.5 py-2 bg-paper-000 border border-rule-subtle focus:border-accent rounded-xl text-xs font-medium text-ink-900 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── STICKY BOTTOM ACTION BAR (Cố định ở đáy, điều khiển theo điều kiện) ── */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-rule-subtle bg-paper-000/95 p-4 backdrop-blur-md pb-safe shadow-elevated">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* Cảnh báo nếu chưa đủ điều kiện */}
          {!isSubmittedSuccess && !isAllConditionsMet && (
            <div className="flex items-center gap-1.5 text-[0.6875rem] font-bold text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-xl">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>
                Cần:{' '}
                {[
                  !isGpsConditionMet && 'Điểm danh GPS',
                  !isPhotoConditionMet && 'Chụp ảnh bằng chứng',
                  !isChecklistConditionMet && 'Tích đủ checklist',
                  !isQuestionsConditionMet && 'Trả lời khảo sát',
                ].filter(Boolean).join(' • ')}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {!isSubmittedSuccess && (
              <button
                type="button"
                onClick={handleAbandonTask}
                disabled={isAbandoning || isSubmitting}
                className="px-4 py-3.5 rounded-2xl border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 font-bold text-xs shrink-0 transition-colors disabled:opacity-50"
              >
                {isAbandoning ? 'Đang hủy...' : 'Từ bỏ việc'}
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmitTask}
              disabled={!isAllConditionsMet || isSubmitting || isSubmittedSuccess}
              className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-sm font-bold shadow-[0_8px_20px_oklch(0.68_0.198_152/0.25)] transition-[transform,background-color,opacity] ${
                isSubmittedSuccess
                  ? 'bg-ink-100 text-ink-500 cursor-not-allowed'
                  : isAllConditionsMet
                  ? 'bg-accent text-paper-000 hover:bg-accent-hover active:scale-[0.98]'
                  : 'bg-paper-200 text-ink-400 cursor-not-allowed opacity-75'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang gửi báo cáo nghiệm thu...
                </>
              ) : isSubmittedSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-accent" /> Đã nộp báo cáo (Chờ nghiệm thu)
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {isAllConditionsMet
                    ? `Nộp Báo Cáo Nghiệm Thu (${formatVnd(task.rewardAmount)})`
                    : 'Chưa đủ điều kiện để nộp việc'}
                </>
              )}
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL CAMERA CHỤP BẰNG CHỨNG THỰC ĐỊA KÈM WATERMARK */}
      {isAttendanceCameraOpen && (
        <AttendanceCapture
          isOpen={isAttendanceCameraOpen}
          onClose={() => setIsAttendanceCameraOpen(false)}
          onCaptureComplete={handleAttendancePhotoCaptured}
          title={`Chụp Bằng Chứng Nhiệm Vụ #${task.id}`}
          subtitle="Tự động kiểm tra độ nét, GPS vệ tinh & đóng dấu Watermark"
          workerName={currentUser?.fullName || currentUser?.name || 'Looker Hiện Trường'}
          workerCode={currentUser?.id ? `LK-${currentUser.id}` : undefined}
          shiftOrTask={`Nhiệm vụ #${task.id}: ${task.title}`}
          defaultFacingMode="environment"
          mode="modal"
        />
      )}
    </div>
  );
}
