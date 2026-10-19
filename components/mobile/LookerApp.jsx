'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Map,
  ClipboardList,
  Camera,
  Wallet,
  User,
  MapPin,
  Clock,
  Shield,
  Crosshair,
  CheckCircle2,
  ChevronRight,
  X,
  TrendingUp,
  Award,
  Bell,
  Lock,
  MessageSquare,
  ArrowRightLeft,
  Navigation,
  AlertCircle,
  Loader2,
  Landmark,
  Edit3,
  Compass,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import { useAuth } from '@/components/auth/AuthContext';
import { api } from '@/lib/api';
import useNotifications from '@/hooks/useNotifications';
import { getTransactionsByOwner, getWalletByOwner } from '@/lib/data/finance';
import { getUserById } from '@/lib/data/users';
import { CATEGORIES } from '@/lib/data/categories';
import { getOpenListingsWithDistance, DEMO_ORIGIN } from '@/lib/selectors';
import { REQ_TYPE, REQ_TYPE_LABEL, TXN_DIRECTION } from '@/lib/constants';
import {
  formatVnd,
  formatNumber,
  formatDateTime,
  formatTimeLeft,
  formatDistance,
  formatDuration,
  formatRating,
} from '@/lib/format';
import Skeleton from '@/components/common/Skeleton';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SyncBadge from '@/components/common/SyncBadge';

const TaskMap = dynamic(() => import('./TaskMap'), { ssr: false });

const VIETNAM_BANKS = [
  'Vietcombank (VCB)',
  'MB Bank (MBB)',
  'Techcombank (TCB)',
  'BIDV',
  'VietinBank (CTG)',
  'ACB',
  'VPBank (VPB)',
  'TPBank (TPB)',
  'Sacombank (STB)',
  'VIB',
  'HDBank (HDB)',
  'SHB',
  'Agribank (VBA)',
  'OCB',
  'MSB',
  'Cake by VPBank',
  'Khác',
];

// ── Người nhận việc mặc định (fallback khi chưa có session) ────────────────
const DEFAULT_LOOKER_ID = 'USR-LK-9921';
const FALLBACK_LOOKER = getUserById(DEFAULT_LOOKER_ID);
const FALLBACK_WALLET = getWalletByOwner(DEFAULT_LOOKER_ID);
const FALLBACK_TRANSACTIONS = getTransactionsByOwner(DEFAULT_LOOKER_ID);

// ── Suy diễn hiển thị từ tin đăng ──────────────────────────────────────────
const hirerNameOf = (l) => l?.hirer?.organization?.name || l?.hirer?.name || '—';

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

export default function LookerApp() {
  const router = useRouter();
  const { currentUser, ready, refreshUser } = useAuth();
  const { unreadCount } = useNotifications(currentUser?.id);
  const [activeTab, setActiveTab] = useState('MAP');
  const [selectedListing, setSelectedListing] = useState(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  useEffect(() => {
    if (ready && !currentUser) {
      window.location.href = '/login?redirect=/looker';
    }
  }, [ready, currentUser]);

  // Dữ liệu thời gian thực từ Spring Boot Backend
  const [realTasks, setRealTasks] = useState([]);
  const [myAssignedTasks, setMyAssignedTasks] = useState([]);
  const [walletData, setWalletData] = useState(null);
  const [transactionsData, setTransactionsData] = useState([]);
  const [isFetchingTasks, setIsFetchingTasks] = useState(true);
  const [isAcceptingTask, setIsAcceptingTask] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Trạng thái định vị GPS thực tế của Looker
  const DEFAULT_LOOKER_LOCATION = { ...DEMO_ORIGIN, accuracy: 15 };
  const [userLocation, setUserLocation] = useState(DEFAULT_LOOKER_LOCATION);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsNotification, setGpsNotification] = useState('');
  const [flyToUserTrigger, setFlyToUserTrigger] = useState(1);

  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('500000');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');

  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: 'Vietcombank (VCB)',
    bankAccountNumber: '',
    bankAccountHolder: '',
  });
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankSaveError, setBankSaveError] = useState('');

  useModalA11y(isTaskDetailOpen, () => setIsTaskDetailOpen(false));
  useModalA11y(withdrawModal, () => { setWithdrawModal(false); setWithdrawSuccess(false); });
  useModalA11y(isBankModalOpen, () => setIsBankModalOpen(false));

  // Logic kéo thả Bottom Sheet trên Mobile (transform + rAF, damping, momentum)
  const sheetRef = useRef(null);
  const drag = useRef({ active: false, startY: 0, startOffset: 0, offset: 0, raf: 0, startTime: 0 });

  const applyOffset = () => {
    drag.current.raf = 0;
    const el = sheetRef.current;
    if (el) el.style.transform = `translateY(${drag.current.offset}px)`;
  };

  const handleDragStart = (e) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return;
    if (drag.current.active) return; // Chống đa chạm
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    drag.current = {
      ...drag.current,
      active: true,
      startY: y,
      startOffset: drag.current.offset,
      startTime: performance.now(),
    };
    e.currentTarget?.setPointerCapture?.(e.pointerId);
    const el = sheetRef.current;
    if (el) el.style.transitionProperty = 'none';
  };

  const handleDragMove = (e) => {
    if (!drag.current.active) return;
    if (e.cancelable) e.preventDefault(); // Ngăn cuộn trang khi đang kéo
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaY = y - drag.current.startY;
    const rawNext = drag.current.startOffset + deltaY;

    // Damping khi vượt biên: dịch chuyển bằng phần vượt * 0.3 thay vì chặn cứng
    const minBound = -0.25 * window.innerHeight;
    const maxBound = 0.4 * window.innerHeight;
    let next = rawNext;
    if (rawNext < minBound) {
      next = minBound + (rawNext - minBound) * 0.3;
    } else if (rawNext > maxBound) {
      next = maxBound + (rawNext - maxBound) * 0.3;
    }

    drag.current.offset = next;
    if (!drag.current.raf) drag.current.raf = requestAnimationFrame(applyOffset);
  };

  const handleDragEnd = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (drag.current.raf) {
      cancelAnimationFrame(drag.current.raf);
      drag.current.raf = 0;
    }
    const h = window.innerHeight;
    const elapsedMs = Math.max(1, performance.now() - drag.current.startTime);
    const deltaFromStart = drag.current.offset - drag.current.startOffset;
    const velocity = Math.abs(deltaFromStart) / elapsedMs;

    // Momentum: nếu vuốt nhanh (> 0.11 px/ms) thì snap theo hướng vuốt
    let snapped = 0;
    if (velocity > 0.11) {
      snapped = deltaFromStart < 0 ? -0.15 * h : 0.44 * h;
    } else {
      snapped = drag.current.offset < -0.1 * h ? -0.15 * h
              : drag.current.offset > 0.14 * h  ?  0.44 * h
              : 0;
    }

    drag.current.offset = snapped;
    const el = sheetRef.current;
    if (el) {
      el.style.transitionProperty = 'transform';
      el.style.transitionDuration = '300ms';
      el.style.transitionTimingFunction = 'var(--ease-expo)';
      el.style.transform = `translateY(${snapped}px)`;
    }
  };

  useEffect(() => {
    const onMove = (e) => {
      if (drag.current.active) handleDragMove(e);
    };
    const onEnd = () => {
      if (drag.current.active) handleDragEnd();
    };

    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    return () => {
      if (drag.current.raf) {
        cancelAnimationFrame(drag.current.raf);
      }
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
    };
  }, []);

  const handleLocateUser = () => {
    setSelectedListing(null); // Bỏ tin đang chọn để trọng tâm căn giữa thuộc về Looker
    setIsLocating(true);
    setGpsNotification('Đang tìm vị trí của bạn...');

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const newLoc = {
            lat: latitude,
            lng: longitude,
            accuracy: Math.round(accuracy)
          };
          setUserLocation(newLoc);
          setIsLocating(false);
          setFlyToUserTrigger((prev) => prev + 1);
          setGpsNotification(`Đã định vị chính xác: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (±${Math.round(accuracy)}m)`);
          setTimeout(() => setGpsNotification(''), 3500);
        },
        (err) => {
          console.warn('GPS location notice:', err.message);
          setIsLocating(false);
          if (err.code === 1) {
            setGpsNotification('Trình duyệt từ chối quyền vị trí. Vui lòng cho phép quyền GPS.');
          } else if (err.code === 2) {
            setGpsNotification('Không thể thu nhận tọa độ GPS thực tế từ thiết bị.');
          } else if (err.code === 3) {
          setGpsNotification('Không lấy được vị trí kịp thời. Vui lòng thử lại.');
          } else {
            setGpsNotification(`Lỗi định vị: ${err.message}`);
          }
          setTimeout(() => setGpsNotification(''), 4000);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 10000
        }
      );
    } else {
      setIsLocating(false);
      setGpsNotification('Thiết bị hoặc trình duyệt chưa hỗ trợ lấy vị trí.');
      setTimeout(() => setGpsNotification(''), 3000);
    }
  };

  // ── Đồng bộ dữ liệu thực tế từ Spring Boot Backend (Song song & Tối ưu) ──
  const refreshBackendData = async () => {
    setIsFetchingTasks(true);
    try {
      const lat = userLocation?.lat || 21.0285;
      const lng = userLocation?.lng || 105.8542;

      // Nạp song song đồng thời các tài nguyên (Việc mở, Việc đang nhận, Ví, Giao dịch)
      const [tasksResult, myAssignedResult, walletResult, txnsResult] = await Promise.allSettled([
        api.tasks.getNearby(lat, lng, 100).catch(() => api.tasks.getAll().catch(() => [])),
        api.tasks.getMyAssigned().catch(() => []),
        api.wallet.getMyWallet(),
        api.wallet.getTransactions()
      ]);

      // 1. Cập nhật danh sách việc làm mở
      if (tasksResult.status === 'fulfilled' && Array.isArray(tasksResult.value) && tasksResult.value.length > 0) {
        const adapted = tasksResult.value.map((t) => {
          let checklistParsed = [];
          if (t.checklistRequirementsJson) {
            try {
              const raw = JSON.parse(t.checklistRequirementsJson);
              if (Array.isArray(raw)) {
                checklistParsed = raw.map((item) => (typeof item === 'object' ? item.title || item.name : String(item)));
              }
            } catch {}
          }
          if (checklistParsed.length === 0) {
            checklistParsed = [
              'Kiểm tra đúng biển hiệu và số nhà địa chỉ thực tế',
              'Chụp ảnh hiện trạng toàn cảnh mặt tiền địa điểm',
            ];
          }

          let questionsParsed = [];
          if (t.questionsJson) {
            try {
              const qRaw = JSON.parse(t.questionsJson);
              if (Array.isArray(qRaw)) {
                questionsParsed = qRaw.filter((q) => q && q.title && q.title.trim().length > 0);
              }
            } catch {}
          }

          return {
            id: t.id,
            title: t.title,
            description: t.description || 'Xác thực thực địa theo nghi thức Im-Here',
            instructions: t.instructions || '',
            checklist: checklistParsed,
            questions: questionsParsed,
            reward: Number(t.rewardAmount || t.reward || 0),
            distanceKm: t.distanceKm != null ? t.distanceKm : 1.2,
            location: {
              address: t.address || t.locationAddress,
              lat: t.latitude,
              lng: t.longitude,
            },
            categoryId: t.category || 'CAT-01',
            category: typeof t.category === 'object' ? t.category : { id: t.category || 'CAT-01', name: 'Bán lẻ & Tiêu dùng' },
            hirer: {
              name: t.clientName || 'Người đăng tin',
              organization: { name: t.clientName || 'Người đăng tin' },
              phone: '',
            },
            protocolSnapshot: {
              slaMinutes: 60,
              requireGps: true,
              requireStepPhotos: true,
            },
            status: t.status,
            expiresAt: t.deadline || new Date(Date.now() + 86400000).toISOString(),
          };
        });
        setRealTasks(adapted);
      }

      // 2. Cập nhật danh sách việc đang nhận (Looker nhận nhiều hơn 1 việc)
      if (myAssignedResult.status === 'fulfilled' && Array.isArray(myAssignedResult.value)) {
        const assignedList = myAssignedResult.value.filter(
          (t) => t.status === 'ASSIGNED' || t.status === 'SUBMITTED'
        );
        setMyAssignedTasks(assignedList);
      }

      // 3. Cập nhật số dư ví
      if (walletResult.status === 'fulfilled' && walletResult.value) {
        const w = walletResult.value;
        const avail = Number(w.balance || 0);
        const escrow = Number(w.escrowBalance || 0);
        setWalletData({
          available: avail,
          pending: escrow,
          total: avail + escrow,
        });
        setWithdrawAmount(String(avail > 0 ? avail : 0));
      }

      // 4. Cập nhật lịch sử giao dịch
      if (txnsResult.status === 'fulfilled' && Array.isArray(txnsResult.value) && txnsResult.value.length > 0) {
        const adaptedTx = txnsResult.value.map((tx) => ({
          id: tx.id,
          direction: tx.type === 'DEPOSIT' || tx.type === 'REWARD' ? TXN_DIRECTION.IN : TXN_DIRECTION.OUT,
          amount: Number(tx.amount),
          description: tx.description || 'Giao dịch ví',
          createdAt: tx.createdAt,
        }));
        setTransactionsData(adaptedTx);
      }
    } catch (err) {
      console.warn('Lỗi đồng bộ backend LookerApp:', err);
    } finally {
      setIsFetchingTasks(false);
    }
  };

  useEffect(() => {
    refreshBackendData();
  }, [userLocation]);

  // Hồ sơ và ví thực tế (lấy từ session thực, không gán cứng giá trị ảo)
  const lookerUser = useMemo(() => {
    if (currentUser) {
      const hasBank = Boolean(currentUser.bankAccountNumber && currentUser.bankName);
      const completedCount = currentUser.stats?.completedCount ?? (currentUser.completedTasksCount || 0);
      return {
        id: currentUser.id,
        name: currentUser.fullName || currentUser.name || currentUser.email,
        kycStatus: currentUser.kycStatus || 'CHUA_NOP',
        rating: currentUser.rating ?? currentUser.ratingScore ?? null,
        badgeTitle: currentUser.badgeTitle || (completedCount > 0 ? 'LOOKER NỀN TẢNG' : 'THÀNH VIÊN MỚI'),
        workingArea: currentUser.workingArea || 'Chưa cập nhật',
        stats: {
          approvalRate: currentUser.stats?.approvalRate ?? null,
          onTimeRate: currentUser.stats?.onTimeRate ?? null,
          completedCount: completedCount,
        },
        bankAccount: hasBank
          ? {
              bank: currentUser.bankName,
              accountNumber: currentUser.bankAccountNumber,
              holder: currentUser.bankAccountHolder || currentUser.fullName || '',
            }
          : null,
      };
    }
    return FALLBACK_LOOKER;
  }, [currentUser]);

  const lookerWallet = walletData || FALLBACK_WALLET;
  const lookerTransactions = useMemo(() => {
    return transactionsData.length > 0 ? transactionsData : FALLBACK_TRANSACTIONS;
  }, [transactionsData]);

  const lookerInitials = useMemo(() => {
    return (lookerUser?.name || 'LK')
      .split(' ')
      .slice(-2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }, [lookerUser?.name]);

  const lookerBank = lookerUser?.bankAccount || null;
  const isBankSetup = Boolean(lookerBank?.bank && lookerBank?.accountNumber);
  const lookerAccountMask = isBankSetup
    ? `${lookerBank.accountNumber.slice(0, 4)} **** ${lookerBank.accountNumber.slice(-4)}`
    : 'Chưa thiết lập';
  const lookerBankTail = isBankSetup ? `(*${lookerBank.accountNumber.slice(-4)})` : '';

  const handleOpenBankModal = () => {
    setBankForm({
      bankName: lookerBank?.bank || 'Vietcombank (VCB)',
      bankAccountNumber: lookerBank?.accountNumber || '',
      bankAccountHolder: lookerBank?.holder || currentUser?.fullName || '',
    });
    setBankSaveError('');
    setIsBankModalOpen(true);
  };

  const handleSaveBank = async (e) => {
    if (e) e.preventDefault();
    if (!bankForm.bankName || !bankForm.bankAccountNumber || !bankForm.bankAccountHolder) {
      setBankSaveError('Vui lòng điền đầy đủ tên ngân hàng, số tài khoản và họ tên chủ thẻ.');
      return;
    }
    setIsSavingBank(true);
    setBankSaveError('');
    try {
      await api.users.updateProfile({
        bankName: bankForm.bankName,
        bankAccountNumber: bankForm.bankAccountNumber.trim(),
        bankAccountHolder: bankForm.bankAccountHolder.trim().toUpperCase(),
      });
      if (typeof refreshUser === 'function') {
        await refreshUser();
      }
      setIsBankModalOpen(false);
      alert('Đã thiết lập tài khoản ngân hàng nhận tiền thành công!');
    } catch (err) {
      console.warn('Lỗi lưu ngân hàng:', err);
      setBankSaveError(err.message || 'Có lỗi xảy ra khi lưu thông tin ngân hàng.');
    } finally {
      setIsSavingBank(false);
    }
  };

  const lookerTotalEarned = useMemo(() => {
    return lookerTransactions
      .filter((t) => t.direction === TXN_DIRECTION.IN)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [lookerTransactions]);

  // Tin đang mở: ưu tiên từ DB thật, fallback dữ liệu tĩnh nếu mạng gián đoạn
  const fallbackListings = useMemo(() => {
    return getOpenListingsWithDistance(userLocation || DEMO_ORIGIN);
  }, [userLocation]);

  const openListings = useMemo(() => {
    return realTasks.length > 0 ? realTasks : fallbackListings;
  }, [realTasks, fallbackListings]);

  // Bộ lọc danh mục suy ra từ CATEGORIES — chỉ hiện danh mục đang có tin mở.
  const filterCategories = useMemo(() => {
    const activeCategoryIds = new Set(openListings.map((l) => l.categoryId));
    return [
      { id: 'ALL', label: `Tất cả (${openListings.length})` },
      ...CATEGORIES.filter((c) => activeCategoryIds.has(c.id)).map((c) => ({
        id: c.id,
        label: c.name,
      })),
    ];
  }, [openListings]);

  const filteredListings = useMemo(() => {
    if (filterCategory === 'ALL') return openListings;
    return openListings.filter((l) => l.categoryId === filterCategory);
  }, [openListings, filterCategory]);

  const handleOpenTask = useCallback((listing) => {
    if (listing.status === 'ASSIGNED' || listing.status === 'SUBMITTED') {
      router.push(`/looker/listing/${listing.id}/execute`);
      return;
    }
    setSelectedListing(listing);
    setIsTaskDetailOpen(true);
  }, [router]);

  const isKycApproved = currentUser?.kycStatus === 'DA_DUYET';

  const handleAcceptTask = async (task) => {
    if (!task) return;
    if (!isKycApproved) {
      if (currentUser?.kycStatus === 'CHO_DUYET') {
        alert('Hồ sơ CCCD & quét mặt của bạn đang trong hàng đợi xét duyệt. Quyền nhận việc sẽ tự động mở sau khi được Admin phê duyệt.');
      } else if (currentUser?.kycStatus === 'TU_CHOI') {
        alert('Hồ sơ định danh của bạn đã bị từ chối. Vui lòng nộp lại hồ sơ trước khi nhận việc.');
      } else {
        alert('Bạn cần hoàn tất nộp hồ sơ CCCD và quét mặt để mở khóa nhận việc.');
      }
      router.push('/looker/onboarding');
      return;
    }

    // BẮT BUỘC: Phải thiết lập tài khoản ngân hàng trước khi nhận việc
    if (!isBankSetup) {
      alert('Bạn chưa thiết lập tài khoản ngân hàng nhận thù lao. Vui lòng hoàn tất cài đặt ngân hàng trước khi nhận việc.');
      handleOpenBankModal();
      return;
    }

    setIsAcceptingTask(true);
    try {
      await api.tasks.accept(task.id);
      await refreshBackendData();
      setIsTaskDetailOpen(false);
      // Chuyển thẳng sang trang làm nhiệm vụ chi tiết
      router.push(`/looker/listing/${task.id}/execute`);
    } catch (err) {
      console.warn('Lỗi nhận việc:', err.message);
      alert(err.message || 'Không thể nhận việc');
    } finally {
      setIsAcceptingTask(false);
    }
  };

  const handleConfirmWithdraw = async () => {
    if (!isKycApproved) {
      alert('Tài khoản chưa được duyệt hồ sơ định danh (KYC). Vui lòng xác thực CCCD & quét mặt để mở khóa rút tiền.');
      return;
    }
    if (!isBankSetup) {
      alert('Bạn chưa thiết lập tài khoản ngân hàng nhận tiền. Vui lòng thiết lập trước khi rút tiền.');
      setWithdrawModal(false);
      handleOpenBankModal();
      return;
    }
    setIsWithdrawing(true);
    try {
      await api.wallet.withdraw({
        amount: parseInt(withdrawAmount, 10) || 50000,
        bankName: lookerBank.bank,
        accountNumber: lookerBank.accountNumber,
        accountHolder: lookerBank.holder || lookerUser?.name || 'CHỦ TÀI KHOẢN',
      });
      await refreshBackendData();
      setWithdrawSuccess(true);
    } catch (err) {
      console.warn('Lỗi rút tiền:', err);
      alert(err.message || 'Lỗi rút tiền');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const NAV_ITEMS = [
    { id: 'MAP', label: 'Bản Đồ', icon: Map },
    { id: 'TASKS', label: 'Tìm Việc', icon: Compass },
    {
      id: 'MY_TASKS',
      label: 'Đang Làm',
      icon: ClipboardList,
      badge: myAssignedTasks.length,
    },
    { id: 'WALLET', label: 'Ví 9Pay', icon: Wallet },
    { id: 'PROFILE', label: 'Cá Nhân', icon: User },
  ];

  if (!ready || !currentUser) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-paper-100 text-ink-900 font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-xs font-semibold text-ink-500">Đang kiểm tra quyền truy cập Looker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full bg-paper-100 text-ink-900 font-sans overflow-hidden">

      {/* ──────────────────────────────────────────────────────────────────
          DESKTOP SIDEBAR
          ────────────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-rule-subtle bg-paper-000 z-40">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-rule-subtle">
          <img
            src="/android-chrome-192x192.png"
            alt="Im-Here Logo"
            className="h-10 w-10 object-contain"
          />
          <div>
            <h1 className="font-display text-base font-bold tracking-tight text-ink-900">Im-Here Looker</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="font-mono text-[0.625rem] font-bold uppercase tracking-wider text-accent">
                GPS Trực Chiến
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2" data-lenis-prevent="true">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive
                    ? 'bg-accent-quiet text-accent font-bold'
                    : 'text-ink-700 hover:bg-paper-100 hover:text-ink-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-accent' : ''}`} />
                  <span>{item.label}</span>
                </div>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-accent font-mono text-[0.625rem] font-bold text-paper-000">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-rule-subtle">
          <Link
            href="/client/dashboard"
            className="w-full mb-3 flex items-center justify-center gap-2 rounded-xl bg-paper-100 hover:bg-paper-200 border border-rule-subtle px-3.5 py-2.5 text-xs font-bold text-ink-700 transition-colors"
          >
            <span>🔄 Chế độ: Đăng việc (Thuê người)</span>
          </Link>
          <div className="flex items-center gap-3 rounded-xl bg-paper-100 border border-rule-subtle p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent font-bold">
              {lookerInitials}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-ink-900 truncate">{lookerUser?.name}</p>
              <p className="text-xs text-ink-500 font-mono">
                {lookerUser?.rating ? `★ ${formatRating(lookerUser.rating)}` : 'Mới'} • {formatNumber(lookerUser?.stats?.completedCount || 0)} việc
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────────────
          MAIN CONTENT AREA
          ────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full bg-paper-100 text-ink-900 relative overflow-hidden">

        {/* Mobile Header (Hidden on Desktop) */}
        <header className="lg:hidden flex items-center justify-between border-b border-rule-subtle bg-paper-000/95 px-4 py-3 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <img
              src="/android-chrome-192x192.png"
              alt="Im-Here Logo"
              className="h-9 w-9 object-contain"
            />
            <div>
              <h1 className="font-display text-base font-bold tracking-tight text-ink-900">Im-Here Looker</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                <span className="font-mono text-[0.625rem] font-bold uppercase tracking-wider text-accent">
                  GPS TRỰC CHIẾN
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/client/dashboard"
              aria-label="Chuyển sang chế độ thuê việc"
              className="flex items-center gap-1 rounded-full border border-rule-subtle bg-paper-100 px-2.5 py-1 text-[11px] font-bold text-ink-700 hoverable:bg-paper-200 transition-colors"
            >
              <span>Đăng việc</span>
            </Link>
            <Link
              href="/looker/notifications"
              aria-label="Xem thông báo Looker"
              className="relative flex h-8 w-8 items-center justify-center rounded-full border border-rule-subtle bg-paper-100 text-ink-700 hoverable:bg-paper-200 transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-danger px-1 text-center text-[9px] font-bold leading-4 text-paper-000" aria-label={`${unreadCount} thông báo chưa đọc`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setActiveTab('WALLET')}
              className="flex items-center gap-1.5 rounded-full border border-rule-subtle bg-paper-100 px-3 py-1.5 text-xs font-bold text-ink-900 transition-colors hoverable:bg-paper-200 active:scale-95"
            >
              <Wallet className="h-3.5 w-3.5 text-accent" />
              <span className="tabular font-mono">{formatVnd(lookerWallet?.available)}</span>
            </button>
          </div>
        </header>

        {/* Persistent KYC Banner cho Worker nếu chưa duyệt */}
        {!isKycApproved && (
          <div className="z-30 shrink-0 elevation-rich">
            {currentUser?.kycStatus === 'CHO_DUYET' ? (
              <div className="bg-accent-blue/10 border-b border-accent-blue/20 px-4 py-2.5 text-xs text-ink-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent-blue shrink-0 animate-pulse" />
                  <span><strong>Chế độ xem việc (Hồ sơ đang chờ duyệt):</strong> Bạn chỉ có thể xem các job đang mở. Quyền nhận việc, camera thực địa và rút tiền sẽ mở sau khi Admin duyệt.</span>
                </div>
                <Link
                  href="/looker/onboarding"
                  className="shrink-0 px-3 py-1 bg-paper-000 border border-rule-subtle text-ink-700 text-[11px] font-bold rounded-lg hover:bg-paper-200 transition-colors inline-block text-center"
                >
                  Xem tiến trình
                </Link>
              </div>
            ) : currentUser?.kycStatus === 'TU_CHOI' ? (
              <div className="bg-danger/10 border-b border-danger/20 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-ink-900">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-danger shrink-0" />
                  <span><strong>Hồ sơ định danh bị từ chối:</strong> {currentUser?.rejectionReason || 'Vui lòng quét mặt và chụp lại CCCD rõ nét.'} (Đang khóa nhận việc).</span>
                </div>
                <Link
                  href="/looker/onboarding"
                  className="shrink-0 px-3 py-1 bg-danger text-paper-000 text-[11px] font-bold rounded-lg hover:bg-danger/90 transition-colors inline-block text-center"
                >
                  Nộp lại hồ sơ
                </Link>
              </div>
            ) : (
              <div className="bg-accent-amber/15 border-b border-accent-amber/30 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-ink-900">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-accent-amber shrink-0" />
                  <span><strong>Tài khoản chưa định danh:</strong> Bạn đang ở chế độ xem tin. Vui lòng xác thực CCCD &amp; quét mặt để mở khóa nhận việc và rút tiền.</span>
                </div>
                <Link
                  href="/looker/onboarding"
                  className="shrink-0 px-3.5 py-1 bg-accent text-paper-000 text-[11px] font-bold rounded-lg hover:bg-accent-hover transition-colors elevation-rich inline-block text-center"
                >
                  Xác thực ngay
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Content based on Active Tab */}
        <div className={`flex-1 ${activeTab === 'MAP' ? 'h-full overflow-hidden relative' : 'overflow-y-auto pb-24 lg:pb-0'}`} data-lenis-prevent="true">

          {/* TAB 1: BẢN ĐỒ TIN ĐĂNG GẦN BẠN (MAP) */}
          {activeTab === 'MAP' && (
            <div className="relative h-full w-full flex flex-col lg:flex-row min-h-0 overflow-hidden">
              {/* Vùng bản đồ tương tác: Trên mobile là Full-screen 100% (absolute inset-0), Desktop là 7 cột bên trái */}
              <div
                className="absolute inset-0 lg:relative lg:inset-auto lg:h-full lg:flex-[7] bg-surface-900 overflow-hidden z-0"
              >
                <TaskMap
                  listings={openListings}
                  selectedListingId={selectedListing?.id}
                  onSelectListing={setSelectedListing}
                  userLocation={userLocation}
                  flyToUserTrigger={flyToUserTrigger}
                />

                {/* Pill số lượng tin gần bạn - UI tối giản & thân thiện người dùng */}
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                  <div className="rounded-full border border-rule-subtle bg-paper-000/95 px-3.5 py-1.5 text-xs font-bold backdrop-blur-md shadow-[0_4px_16px_oklch(0_0_0/0.08)] text-ink-900 flex items-center gap-2">
                    {isFetchingTasks && openListings.length === 0 ? (
                      <>
                        <LoadingSpinner size="xs" color="accent" />
                        <span className="font-mono text-[11px] text-accent">Đang tìm việc gần bạn...</span>
                      </>
                    ) : (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                        </span>
                        <span>{openListings.length} tin quanh bạn</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Toast phản hồi trạng thái định vị ngắn gọn */}
                {gpsNotification && (
                  <div className="absolute top-4 right-4 z-20 rounded-full border border-accent/30 bg-surface-950/85 px-3 py-1.5 text-[11px] font-semibold text-paper-000 backdrop-blur-md shadow-[0_4px_12px_-2px_oklch(0_0_0/0.3)] animate-fadeIn flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    <span>{gpsNotification}</span>
                  </div>
                )}

                {/* Banner nổi nhiệm vụ đang nhận trên Bản đồ */}
                {myAssignedTasks.length > 0 && (
                  <div className="absolute top-16 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-20">
                    <button
                      type="button"
                      onClick={() => setActiveTab('MY_TASKS')}
                      className="w-full flex items-center justify-between gap-3 p-3 bg-surface-950/90 hover:bg-surface-950 text-paper-000 rounded-2xl border border-accent/40 shadow-[0_8px_24px_oklch(0_0_0/0.3)] backdrop-blur-md transition-[transform,background-color] active:scale-[0.98] text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-paper-000 font-bold text-xs">
                          {myAssignedTasks.length}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate text-paper-000 flex items-center gap-1.5">
                            <span>Nhiệm vụ đang nhận</span>
                            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                          </p>
                          <p className="text-[11px] text-on-surface-500 truncate">
                            {myAssignedTasks[0]?.title || 'Bấm để vào làm việc & báo cáo'}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[11px] font-bold text-accent flex items-center gap-1 bg-accent/15 px-2.5 py-1.5 rounded-xl border border-accent/30">
                        Làm ngay <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  </div>
                )}

                {/* Nút định vị vị trí hiện tại của Looker - Luôn nổi phía trên Bottom Sheet */}
                <button
                  type="button"
                  onClick={handleLocateUser}
                  disabled={isLocating}
                  aria-label="Định vị vị trí hiện tại của Looker"
                  title="Căn giữa vị trí của bạn"
                  className="absolute bottom-56 right-4 lg:bottom-6 lg:right-6 z-20 flex h-12 w-12 items-center justify-center rounded-2xl border border-rule-subtle bg-paper-000/95 backdrop-blur-md transition-[transform,background-color] hover:scale-105 active:scale-95 shadow-[0_6px_20px_oklch(0_0_0/0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group disabled:opacity-75"
                >
                  {isLocating ? (
                    <LoadingSpinner size="sm" color="accent" />
                  ) : (
                    <Navigation className="h-5 w-5 text-ink-900 group-hover:text-accent group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </div>

              {/* Bottom Sheet kéo trượt: Trên mobile là lớp nổi đè lên bản đồ, khi kéo xuống sẽ lộ toàn bộ bản đồ ra */}
              <div
                ref={sheetRef}
                className="absolute bottom-0 inset-x-0 z-20 h-[58vh] max-h-[72vh] rounded-t-[28px] border-t border-rule-strong bg-paper-000 px-5 lg:px-8 shadow-[0_-12px_40px_oklch(0_0_0/0.12)] flex flex-col pt-3.5 pb-20 lg:pb-6 lg:relative lg:inset-auto lg:h-full lg:flex-[5] lg:rounded-none lg:border-t-0 lg:border-l lg:shadow-none lg:!transform-none"
              >
                <div
                  className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-paper-300 lg:hidden cursor-grab active:cursor-grabbing transition-colors hover:bg-paper-200 touch-none"
                  onTouchStart={handleDragStart}
                  onMouseDown={handleDragStart}
                />

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-lg lg:text-xl font-bold text-ink-900">Tin Đăng Gần Đây</h2>
                    <p className="text-sm text-ink-500 mt-1">Sẵn sàng nhận việc quanh vị trí của bạn</p>
                  </div>
                  <button onClick={() => setActiveTab('TASKS')} className="text-sm font-bold text-accent hover:underline hidden lg:block">
                    Xem tất cả ({openListings.length})
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1" data-lenis-prevent="true">
                  {isFetchingTasks && openListings.length === 0 ? (
                    <>
                      <Skeleton variant="card" />
                      <Skeleton variant="card" />
                    </>
                  ) : (
                    openListings.slice(0, 3).map((listing) => (
                      <div
                        key={listing.id}
                        onClick={() => setSelectedListing(listing)}
                        className={`group cursor-pointer rounded-2xl border bg-paper-000 p-4 transition-[transform,box-shadow,border-color] hoverable:shadow-[0_8px_30px_oklch(0.18_0.04_235/0.08)] hoverable:-translate-y-1 active:scale-[0.99] animate-render-reveal ${
                          selectedListing?.id === listing.id ? 'border-accent ring-1 ring-accent' : 'border-rule-subtle hoverable:border-accent/30'
                        }`}
                      >
                      <div className="flex justify-between items-start mb-3">
                        <span className="rounded-full bg-accent/10 px-2.5 py-1 font-mono text-[0.625rem] font-bold text-accent">
                          {listing.category?.name}
                        </span>
                        <span className="font-display text-lg font-bold text-ink-900 tabular-nums">
                          +{formatVnd(listing.reward)}
                        </span>
                      </div>
                      <h3 className="font-display text-base font-bold leading-tight text-ink-900 group-hover:text-accent transition-colors">
                        {listing.title}
                      </h3>
                      <div className="mt-3 flex items-center gap-1.5 text-sm text-ink-500">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="line-clamp-1">{listing.location?.address}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-rule-subtle pt-3">
                        <div className="flex items-center gap-3 text-xs font-mono text-ink-500">
                          <span className="flex items-center gap-1"><Navigation className="h-3.5 w-3.5"/> {formatDistance(listing.distanceKm)}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5"/> {formatDuration(listing.protocolSnapshot?.slaMinutes)}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenTask(listing); }}
                          className="font-bold text-accent text-sm flex items-center gap-1 hover:underline p-1 -mr-1 rounded-md active:bg-accent/10 transition-colors"
                        >
                          Chi tiết <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TASKS */}
          {activeTab === 'TASKS' && (
            <div className="p-5 lg:p-10 max-w-7xl mx-auto w-full">
              <header className="mb-8">
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-ink-900">Sàn Tin Đăng</h2>
                <p className="text-ink-500 mt-2 text-base">Lọc và nhận các tin đăng phù hợp với bạn.</p>
              </header>

              <div className="flex flex-wrap gap-2 lg:gap-3 mb-8">
                {filterCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition-[color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      filterCategory === cat.id
                        ? 'bg-ink-900 text-paper-000'
                        : 'bg-paper-000 border border-rule-subtle text-ink-700 hover:bg-paper-100 hover:text-ink-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-12 gap-5 lg:gap-6">
                {isFetchingTasks && openListings.length === 0 ? (
                  [1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="col-span-12 md:col-span-6 lg:col-span-4">
                      <Skeleton variant="card" className="h-56" />
                    </div>
                  ))
                ) : (
                  filteredListings.map((listing) => (
                    <div key={listing.id} className="col-span-12 md:col-span-6 lg:col-span-4 flex flex-col rounded-2xl border border-rule-subtle bg-paper-000 p-5 lg:p-6 transition-[transform,box-shadow] hoverable:shadow-[0_12px_40px_oklch(0.18_0.04_235/0.08)] hoverable:-translate-y-1 active:scale-[0.99] animate-render-reveal">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-accent">{listing.id}</span>
                        <span className="rounded-full bg-paper-100 px-2.5 py-1 text-[0.6875rem] font-semibold text-ink-700">
                          {hirerNameOf(listing)}
                        </span>
                      </div>
                      {listing.urgent && (
                        <span className="rounded-full bg-accent-orange/10 px-2.5 py-1 text-[0.625rem] font-bold text-accent-orange uppercase tracking-wider flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Hỏa tốc
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-lg font-bold text-ink-900 leading-snug mb-3 flex-1">
                      {listing.title}
                    </h3>

                    <div className="space-y-2 text-sm text-ink-700 mb-5">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-ink-500" />
                        <span className="line-clamp-2">{listing.location?.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-y border-rule-subtle py-3 mb-5 font-mono text-[0.6875rem] text-ink-700 text-center">
                      <div className="flex-1 flex flex-col gap-1 items-center">
                        <Navigation className="h-4 w-4 text-ink-500" />
                        <span>{formatDistance(listing.distanceKm)}</span>
                      </div>
                      <div className="flex-1 flex flex-col gap-1 items-center border-l border-rule-subtle">
                        <Clock className="h-4 w-4 text-ink-500" />
                        <span>{formatDuration(listing.protocolSnapshot?.slaMinutes)}</span>
                      </div>
                      <div className="flex-1 flex flex-col gap-1 items-center border-l border-rule-subtle">
                        <Shield className="h-4 w-4 text-ink-500" />
                        <span>{formatTimeLeft(listing.expiresAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <span className="block text-[0.625rem] text-ink-500 uppercase font-bold tracking-wider mb-0.5">Thù lao</span>
                        <div className="font-display text-xl font-bold text-accent tabular-nums">
                          {formatVnd(listing.reward)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenTask(listing)}
                        className="rounded-xl bg-ink-900 px-5 py-2.5 text-sm font-bold text-paper-000 transition-colors hover:bg-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                ))
              )}
              </div>
            </div>
          )}

          {/* TAB 3: NHIỆM VỤ ĐANG NHẬN (MY_TASKS) */}
          {activeTab === 'MY_TASKS' && (
            <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto w-full">
              <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="font-mono text-xs font-bold text-accent uppercase tracking-wider mb-1">
                    02 — VIỆC ĐANG NHẬN
                  </div>
                  <h2 className="font-display text-2xl lg:text-3xl font-bold text-ink-900">
                    Nhiệm Vụ Đang Thực Hiện
                  </h2>
                  <p className="text-ink-500 mt-1 text-sm">
                    Các công việc bạn đã nhận độc quyền. Hoàn thành GPS check-in và gửi ảnh chứng cứ để nhận thù lao.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => refreshBackendData()}
                  className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-rule-subtle bg-paper-000 text-xs font-bold text-ink-700 hover:text-ink-900 hover:bg-paper-100 transition-colors shadow-[0_2px_8px_oklch(0_0_0/0.04)]"
                >
                  <RotateCw className="w-3.5 h-3.5 text-accent" /> Làm mới
                </button>
              </header>

              {myAssignedTasks.length === 0 ? (
                <div className="rounded-3xl border border-rule-subtle bg-paper-000 p-8 sm:p-12 text-center shadow-[0_4px_24px_oklch(0_0_0/0.04)]">
                  <div className="w-16 h-16 rounded-2xl bg-paper-100 text-ink-400 flex items-center justify-center mx-auto mb-4 border border-rule-subtle">
                    <ClipboardList className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-1">
                    Chưa có nhiệm vụ nào đang nhận
                  </h3>
                  <p className="text-sm text-ink-500 max-w-md mx-auto mb-6">
                    Bạn hiện chưa nhận nhiệm vụ nào. Khám phá các tin đăng thực địa gần bạn trên Bản Đồ hoặc danh sách Tìm Việc để bắt đầu kiếm thu nhập!
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('MAP')}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-accent text-paper-000 font-bold text-sm hover:bg-accent-hover transition-colors shadow-[0_4px_16px_oklch(0.68_0.198_152/0.25)]"
                    >
                      Mở Bản Đồ Tìm Việc
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('TASKS')}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl border border-rule-subtle bg-paper-100 text-ink-900 font-bold text-sm hover:bg-paper-200 transition-colors"
                    >
                      Xem Danh Sách Việc
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {myAssignedTasks.map((task) => {
                    const isCheckedIn = Boolean(task.is_checked_in || task.isCheckedIn);

                    return (
                      <div
                        key={task.id}
                        className="rounded-3xl border border-rule-subtle bg-paper-000 p-5 lg:p-6 shadow-[0_4px_20px_oklch(0_0_0/0.04)] hover:shadow-[0_8px_30px_oklch(0_0_0/0.08)] transition-[box-shadow,transform] relative overflow-hidden"
                      >
                        {/* Status bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/20">
                              #{task.id}
                            </span>
                            <span className="text-xs font-semibold text-ink-500 bg-paper-100 px-2.5 py-1 rounded-lg">
                              {task.category || 'Xác minh thực địa'}
                            </span>
                          </div>

                          {isCheckedIn ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/30 text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đã Check-in GPS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-amber/15 text-accent-amber border border-accent-amber/30 text-xs font-bold">
                              <Crosshair className="w-3.5 h-3.5" /> Cần Check-in GPS (≤ 100m)
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h3 className="font-display text-lg lg:text-xl font-bold text-ink-900 mb-2 leading-snug">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-ink-600 line-clamp-2 mb-4 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Location & Reward meta */}
                        <div className="flex flex-col sm:flex-row gap-3 p-3.5 rounded-2xl bg-paper-100 border border-rule-subtle mb-5">
                          <div className="flex-1 flex items-start gap-2 text-xs text-ink-700">
                            <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="font-bold block text-ink-900">Địa điểm thực địa</span>
                              <span className="truncate block text-ink-600">
                                {task.address || task.location || 'Địa điểm chỉ định'}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 flex items-start gap-2 text-xs text-ink-700">
                            <Award className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block text-ink-900">Thù lao cam kết</span>
                              <span className="font-display text-base font-bold text-accent tabular-nums">
                                {formatVnd(task.reward)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Mobile Actions: Touch-friendly */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                          <Link
                            href={`/looker/listing/${task.id}/execute`}
                            className="flex-1 py-3 px-4 rounded-xl bg-accent text-paper-000 font-bold text-sm hover:bg-accent-hover transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-[0_4px_16px_oklch(0.68_0.198_152/0.25)] text-center"
                          >
                            <Crosshair className="w-4 h-4" />
                            <span>Vào Làm Nhiệm Vụ & Báo Cáo</span>
                            <ChevronRight className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/looker/listing/${task.id}/chat`}
                            className="sm:w-auto py-3 px-4 rounded-xl border border-rule-subtle bg-paper-000 hover:bg-paper-100 text-ink-900 font-bold text-sm flex items-center justify-center gap-2 transition-colors text-center"
                          >
                            <MessageSquare className="w-4 h-4 text-accent" />
                            <span>Nhắn Tin</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenTask(task)}
                            className="sm:w-auto py-3 px-4 rounded-xl border border-rule-subtle text-ink-600 hover:text-ink-900 hover:bg-paper-100 font-semibold text-xs transition-colors"
                          >
                            Xem Yêu Cầu
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WALLET */}
          {activeTab === 'WALLET' && (
            <div className="p-5 lg:p-10 max-w-4xl mx-auto w-full">
              <header className="mb-6">
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-ink-900">Ví Thù Lao 9Pay</h2>
                <p className="text-ink-500 mt-2 text-base">Quản lý thu nhập và rút tiền tức thì 24/7.</p>
              </header>

              {!isKycApproved && (
                <div className="mb-6 p-4 rounded-2xl bg-danger/10 border border-danger/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-ink-900">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-danger/20 text-danger flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-danger block">Chức năng Rút Tiền đang bị khóa</span>
                      <span className="text-ink-600">Bạn chỉ có thể thực hiện rút thù lao về tài khoản ngân hàng sau khi hồ sơ định danh CCCD &amp; quét mặt được phê duyệt.</span>
                    </div>
                  </div>
                  <Link
                    href="/looker/onboarding"
                    className="shrink-0 px-3.5 py-1.5 rounded-xl bg-accent text-paper-000 font-bold text-xs hover:bg-accent-hover transition-colors text-center elevation-rich"
                  >
                    {currentUser?.kycStatus === 'CHO_DUYET' ? 'Xem trạng thái' : 'Xác thực ngay'}
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Balance Card - Thẻ Fintech sang trọng */}
                <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-ink-900 via-surface-900 to-ink-900 p-6 lg:p-8 text-paper-000 relative overflow-hidden shadow-[0_16px_40px_oklch(0.18_0.04_235/0.14)] border border-rule-dark">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Wallet className="w-48 h-48" />
                  </div>

                  <div className="relative z-10 flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-paper-000 font-bold">
                        9P
                      </div>
                      <span className="font-mono text-sm font-bold tracking-wider text-accent">9PAY WALLET</span>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 font-mono text-[0.6875rem] font-bold text-accent">
                      <CheckCircle2 className="h-3.5 w-3.5" /> LIÊN KẾT
                    </span>
                  </div>

                  <div className="relative z-10">
                    <span className="text-sm font-medium text-paper-000/70 block mb-2">Số dư khả dụng</span>
                    <div className="font-display text-[clamp(2.25rem,4vw,3.25rem)] font-extrabold text-paper-000 tabular-nums tracking-tight">
                      {formatNumber(lookerWallet?.available)} <span className="text-[clamp(1.5rem,2.5vw,2rem)] font-sans font-medium text-accent">VNĐ</span>
                    </div>
                  </div>

                  <div className="relative z-10 mt-8 flex flex-col sm:flex-row gap-4 sm:items-center justify-between border-t border-paper-000/10 pt-6">
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="block text-paper-000/70 mb-1 text-xs">Chờ đối soát</span>
                        <strong className="text-accent-amber font-mono text-base">{formatVnd(lookerWallet?.pending)}</strong>
                      </div>
                      <div>
                        <span className="block text-paper-000/70 mb-1 text-xs">Tổng thu</span>
                        <strong className="text-accent font-mono text-base">+{formatVnd(lookerTotalEarned)}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!isKycApproved) {
                          alert('Tài khoản chưa được duyệt hồ sơ định danh. Vui lòng xác thực CCCD & quét mặt để mở khóa rút tiền.');
                          return;
                        }
                        setWithdrawModal(true);
                      }}
                      className={`rounded-xl px-6 py-3 text-sm font-bold text-paper-000 shadow-[0_4px_20px_oklch(0.68_0.198_152/0.4)] transition-transform flex items-center gap-2 ${
                        isKycApproved
                          ? 'bg-accent hover:scale-105 active:scale-95'
                          : 'bg-paper-200 text-ink-400 opacity-60 cursor-not-allowed shadow-none'
                      }`}
                    >
                      {!isKycApproved && <Lock className="w-4 h-4" />}
                      <span>Rút Tiền Ngay</span>
                    </button>
                  </div>
                </div>

                {/* Bank Info & History */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Bank Account */}
                  <div className="rounded-2xl border border-rule-subtle bg-paper-000 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-mono text-xs font-bold text-ink-500 uppercase tracking-wider">Tài Khoản Nhận Thù Lao</h3>
                      {isBankSetup && (
                        <button
                          onClick={handleOpenBankModal}
                          className="flex items-center gap-1 text-xs font-bold text-accent hover:underline"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Thay đổi
                        </button>
                      )}
                    </div>

                    {isBankSetup ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-quiet text-accent font-bold text-lg border border-accent/20">
                            <Landmark className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="block font-bold text-ink-900 text-sm">{lookerBank.bank}</span>
                            <span className="font-mono text-xs text-ink-500 mt-0.5 block">{lookerAccountMask}</span>
                            <span className="text-[0.6875rem] font-semibold text-ink-400 uppercase mt-0.5 block">
                              {lookerBank.holder || currentUser?.fullName || ''}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full bg-accent/15 px-3 py-1 text-[0.625rem] font-bold text-accent border border-accent/20">
                          Đang kích hoạt
                        </span>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-accent-amber/40 bg-accent-amber/5 p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <AlertCircle className="w-5 h-5 text-accent-amber shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-bold text-ink-900">Chưa thiết lập tài khoản ngân hàng</h4>
                            <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                              Bạn bắt buộc phải cài đặt thông tin ngân hàng nhận tiền trước khi có thể nhận nhiệm vụ hoặc rút thù lao.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleOpenBankModal}
                          className="w-full py-2.5 px-4 rounded-xl bg-ink-900 text-paper-000 font-bold text-xs hover:bg-ink-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Landmark className="w-3.5 h-3.5" /> Thiết Lập Tài Khoản Nhận Ngay
                        </button>
                      </div>
                    )}
                  </div>

                  {/* History list */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-mono text-xs font-bold text-ink-500 uppercase tracking-wider">Lịch Sử Giao Dịch</h3>
                      <Link href="/looker/history" className="text-xs font-bold text-accent hover:underline">Xem tất cả</Link>
                    </div>
                    <div className="space-y-3">
                      {lookerTransactions.map((txn) => (
                        <div key={txn.id} className="flex items-center justify-between rounded-xl border border-rule-subtle bg-paper-000 p-4 transition-colors hover:bg-paper-100">
                          <div className="flex items-center gap-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${txn.direction === TXN_DIRECTION.OUT ? 'bg-surface-900 text-paper-000' : 'bg-accent/15 text-accent'}`}>
                              {txn.direction === TXN_DIRECTION.OUT ? <ArrowRightLeft className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                            </div>
                            <div>
                              <span className="block font-bold text-ink-900 text-sm">{txn.description}</span>
                              <span className="block text-[0.6875rem] text-ink-500 mt-1 font-mono">{formatDateTime(txn.createdAt)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`block font-mono text-sm font-bold tabular-nums ${txn.direction === TXN_DIRECTION.IN ? 'text-accent' : 'text-ink-900'}`}>
                              {txn.direction === TXN_DIRECTION.IN ? '+' : '−'}{formatVnd(txn.amount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {activeTab === 'PROFILE' && (
            <div className="p-5 lg:p-10 max-w-4xl mx-auto w-full space-y-6 lg:space-y-8">
              <header>
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-ink-900">Hồ Sơ Cá Nhân</h2>
                <p className="text-ink-500 mt-2 text-base">Đánh giá, lịch sử làm việc và thiết lập tài khoản cá nhân.</p>
              </header>

              <div className="grid grid-cols-12 gap-6 lg:gap-8">
                {/* Profile Main Card */}
                <div className="col-span-12 lg:col-span-7 rounded-3xl border border-rule-subtle bg-paper-000 p-6 lg:p-8">
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-900 text-paper-000 font-display text-3xl font-bold">
                        {lookerInitials}
                      </div>
                      {lookerUser?.rating ? (
                        <span className="absolute -bottom-2 -right-2 rounded-lg bg-accent px-2 py-1 font-mono text-[0.625rem] font-bold text-paper-000 border border-paper-000">
                          ★ {formatRating(lookerUser.rating)}
                        </span>
                      ) : (
                        <span className="absolute -bottom-2 -right-2 rounded-lg bg-surface-700 px-2 py-1 font-mono text-[0.625rem] font-bold text-paper-000 border border-paper-000">
                          MỚI
                        </span>
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-xl font-bold text-ink-900">{lookerUser?.name}</h3>
                          {/* Huy hiệu uy tín */}
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent-amber/20 px-2.5 py-0.5 text-[0.625rem] font-bold text-accent-amber border border-accent-amber/30">
                            {(lookerUser?.stats?.completedCount || 0) >= 20 ? '👑 ' : ''}
                            {lookerUser?.badgeTitle || ((lookerUser?.stats?.completedCount || 0) > 0 ? 'LOOKER NỀN TẢNG' : 'THÀNH VIÊN MỚI')}
                          </span>
                        </div>
                        {lookerUser?.kycStatus === 'DA_DUYET' ? (
                          <span className="inline-flex w-max items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-[0.6875rem] font-bold text-accent">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Đã duyệt CCCD
                          </span>
                        ) : lookerUser?.kycStatus === 'CHO_DUYET' ? (
                          <span className="inline-flex w-max items-center gap-1.5 rounded-full bg-accent-amber/20 px-2.5 py-1 text-[0.6875rem] font-bold text-accent-amber border border-accent-amber/30">
                            <Clock className="h-3.5 w-3.5" /> Chờ duyệt CCCD
                          </span>
                        ) : (
                          <Link href="/looker/onboarding" className="inline-flex w-max items-center gap-1.5 rounded-full bg-danger/15 px-2.5 py-1 text-[0.6875rem] font-bold text-danger hover:underline">
                            <AlertCircle className="h-3.5 w-3.5" /> Chưa nộp CCCD (Bấm nộp)
                          </Link>
                        )}
                      </div>
                      <p className="font-mono text-sm text-ink-500 mb-2">Khu vực: <span className="font-semibold text-ink-900">{lookerUser?.workingArea || 'Hà Nội & Lân cận'}</span></p>
                      <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                        <Award className="h-4 w-4" />
                        {lookerUser?.rating
                          ? `Đánh giá ${formatRating(lookerUser.rating)}/5.00 (${formatNumber(lookerUser?.stats?.completedCount || 0)} việc đã làm)`
                          : `Chưa có đánh giá (${formatNumber(lookerUser?.stats?.completedCount || 0)} việc đã làm)`}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between text-center border-t border-rule-subtle pt-8">
                    <div className="flex-1">
                      <span className="block text-xs text-ink-500 mb-1.5">Tỷ lệ xác nhận</span>
                      <strong className="font-display text-xl lg:text-2xl font-bold text-accent">
                        {lookerUser?.stats?.approvalRate != null && (lookerUser?.stats?.completedCount || 0) > 0
                          ? `${lookerUser.stats.approvalRate}%`
                          : '—'}
                      </strong>
                    </div>
                    <div className="flex-1 border-x border-rule-subtle">
                      <span className="block text-xs text-ink-500 mb-1.5">Đúng hạn</span>
                      <strong className="font-display text-xl lg:text-2xl font-bold text-ink-900">
                        {lookerUser?.stats?.onTimeRate != null && (lookerUser?.stats?.completedCount || 0) > 0
                          ? `${lookerUser.stats.onTimeRate}%`
                          : '—'}
                      </strong>
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs text-ink-500 mb-1.5">Việc đã làm</span>
                      <strong className="font-display text-xl lg:text-2xl font-bold text-ink-900">
                        {formatNumber(lookerUser?.stats?.completedCount || 0)}
                      </strong>
                    </div>
                  </div>

                  {/* Lối tắt nghiệp vụ */}
                  <div className="mt-6 pt-6 border-t border-rule-subtle flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/looker/history"
                      className="flex-1 flex items-center justify-between p-3 rounded-xl border border-rule-subtle bg-paper-100 hover:bg-paper-200 transition-colors text-xs font-bold text-ink-900"
                    >
                      <span>Lịch sử việc làm</span>
                      <ChevronRight className="h-4 w-4 text-ink-500" />
                    </Link>
                    <Link
                      href="/looker/onboarding"
                      className="flex-1 flex items-center justify-between p-3 rounded-xl border border-rule-subtle bg-paper-100 hover:bg-paper-200 transition-colors text-xs font-bold text-ink-900"
                    >
                      <span>Hồ sơ định danh</span>
                      <ChevronRight className="h-4 w-4 text-ink-500" />
                    </Link>
                  </div>

                  {/* Chuyển sang Chế độ Người Thuê */}
                  <div className="mt-4 pt-4 border-t border-rule-subtle">
                    <Link
                      href="/client/dashboard"
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border border-accent/20 bg-accent/5 hover:bg-accent/10 transition-colors text-xs font-bold text-accent"
                    >
                      <span className="flex items-center gap-2">
                        <span>🔄</span>
                        <span>Chuyển sang Chế độ Đăng Việc (Thuê Người)</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-accent" />
                    </Link>
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-5 space-y-6">
                  {/* Settings */}
                  <div className="rounded-2xl border border-rule-subtle bg-paper-000 p-2 space-y-1">
                    <button
                      onClick={handleOpenBankModal}
                      className="w-full flex items-center justify-between p-4 font-semibold text-ink-900 hover:bg-paper-100 rounded-xl transition-colors text-left"
                    >
                      <span className="flex items-center gap-3 text-sm">
                        <Landmark className="h-5 w-5 text-accent" />
                        <div>
                          <span className="block font-bold">Tài khoản ngân hàng nhận tiền</span>
                          <span className="block text-xs text-ink-500 font-mono">
                            {isBankSetup ? `${lookerBank.bank} (${lookerAccountMask})` : 'Chưa thiết lập (Cần bổ sung)'}
                          </span>
                        </div>
                      </span>
                      <ChevronRight className="h-4 w-4 text-ink-300" />
                    </button>
                    {[
                      { icon: Bell, label: 'Thông báo việc lân cận', href: '/looker/notifications' },
                      { icon: Lock, label: 'Bảo mật 2 lớp & Sinh trắc học', href: '#' },
                      { icon: MessageSquare, label: 'Hỗ trợ trực tuyến Looker Support', href: '#' }
                    ].map((item, i) => (
                      <Link key={i} href={item.href} className="w-full flex items-center justify-between p-4 font-semibold text-ink-900 hover:bg-paper-100 rounded-xl transition-colors">
                        <span className="flex items-center gap-3 text-sm">
                          <item.icon className="h-5 w-5 text-ink-500" />
                          {item.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-ink-300" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ──────────────────────────────────────────────────────────────────
          MOBILE BOTTOM NAVIGATION (HIDDEN ON DESKTOP)
          ────────────────────────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 w-full z-40 border-t border-rule-subtle bg-paper-000/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 transition-transform active:scale-95 ${
                  isActive ? 'text-accent' : 'text-ink-500 hoverable:text-ink-900'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[9px] font-bold text-paper-000 shadow-[0_2px_6px_oklch(0.68_0.198_152/0.4)] animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[0.625rem] font-semibold ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ──────────────────────────────────────────────────────────────────
          MODALS
          ────────────────────────────────────────────────────────────────── */}

      {/* LISTING DETAIL MODAL */}
      {isTaskDetailOpen && selectedListing && (
        <div
          onClick={() => setIsTaskDetailOpen(false)}
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-surface-950/80 p-0 lg:p-4 backdrop-blur-sm modal-backdrop"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl lg:rounded-3xl bg-paper-000 flex flex-col modal-panel"
            data-lenis-prevent="true"
          >

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-rule-subtle bg-paper-000/95 px-5 lg:px-8 py-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-accent">{selectedListing.id}</span>
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[0.6875rem] font-bold text-accent">
                  {selectedListing.category?.name}
                </span>
              </div>
              <button
                onClick={() => setIsTaskDetailOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-100 text-ink-700 hover:bg-paper-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 lg:p-8 flex-1">
              <h3 className="font-display text-2xl lg:text-3xl font-bold text-ink-900 leading-tight">
                {selectedListing.title}
              </h3>
              <p className="mt-3 text-sm text-ink-500 flex items-center gap-2">
                <User className="h-4 w-4" /> Người đăng: <strong className="text-ink-900">{hirerNameOf(selectedListing)}</strong>
              </p>

              <div className="mt-6 rounded-2xl border border-rule-subtle bg-paper-100 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-ink-900 text-sm block mb-1">Địa điểm thực hiện</span>
                    <p className="text-ink-700 text-sm leading-relaxed">{selectedListing.location?.address}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 lg:gap-8 border-t border-rule-subtle pt-4 font-mono text-xs text-ink-700">
                  <span className="flex items-center gap-1.5"><Navigation className="h-4 w-4"/> {formatDistance(selectedListing.distanceKm)}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> {formatDuration(selectedListing.protocolSnapshot?.slaMinutes)}</span>
                  <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-accent"/> {formatTimeLeft(selectedListing.expiresAt)}</span>
                </div>
              </div>

              {/* Rẽ nhánh theo nghi thức: chỉ hiện khi tin yêu cầu xác thực vị trí */}
              {selectedListing.protocolSnapshot?.requireGps && (
                <div className="mt-6 rounded-2xl border border-accent/30 bg-accent-quiet p-4 flex items-start gap-3">
                  <Crosshair className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-ink-900 text-sm block mb-1">Xác thực vị trí khi nhận việc</span>
                    <p className="text-ink-700 text-sm leading-relaxed">
                      Bạn cần có mặt tại địa điểm và bật định vị để hệ thống ghi nhận.
                    </p>
                  </div>
                </div>
              )}

              {/* Hướng dẫn từ Người Thuê */}
              {selectedListing.instructions && (
                <div className="mt-6 rounded-2xl border border-rule-subtle bg-paper-100 p-4">
                  <h4 className="font-mono text-xs font-bold text-ink-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-accent" /> Hướng Dẫn Thực Hiện
                  </h4>
                  <p className="text-sm text-ink-900 leading-relaxed whitespace-pre-line font-medium">
                    {selectedListing.instructions}
                  </p>
                </div>
              )}

              {/* Checklist Tiêu Chí Kiểm Tra Thực Địa do Người Đăng Thiết Lập */}
              {selectedListing.checklist && selectedListing.checklist.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-mono text-xs font-bold text-ink-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Checklist Tiêu Chí Kiểm Tra ({selectedListing.checklist.length})</span>
                    <span className="text-accent text-[11px] font-bold">Yêu cầu hoàn tất đủ</span>
                  </h4>
                  <div className="space-y-2.5">
                    {selectedListing.checklist.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-2xl border border-rule-subtle p-3.5 bg-paper-000"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent text-xs font-bold mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-ink-900 text-sm leading-relaxed font-medium">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bộ Câu Hỏi Khảo Sát (Nếu người thuê có tạo câu hỏi) */}
              {selectedListing.questions && selectedListing.questions.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-mono text-xs font-bold text-ink-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Câu Hỏi Khảo Sát Hiện Trường ({selectedListing.questions.length})</span>
                    <span className="text-accent text-[11px] font-bold">Cần trả lời khi làm việc</span>
                  </h4>
                  <div className="space-y-2.5">
                    {selectedListing.questions.map((q, idx) => (
                      <div
                        key={q.id || idx}
                        className="rounded-2xl border border-rule-subtle p-3.5 bg-paper-000 flex items-start gap-3"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-paper-200 text-ink-700 text-xs font-bold mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-ink-900 text-sm leading-relaxed font-semibold block">
                            {q.title}
                          </span>
                          <span className="mt-1 inline-block rounded-md bg-paper-100 px-2 py-0.5 font-mono text-[10px] font-bold text-ink-500 uppercase">
                            {q.type === 'YES_NO' ? 'Trắc nghiệm: Có / Không' : 'Văn bản trả lời'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 border-t border-rule-subtle bg-paper-000 p-5 lg:p-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[0.625rem] text-ink-500 uppercase font-bold tracking-wider block mb-1">Thù lao hoàn thành</span>
                <div className="font-display text-2xl lg:text-3xl font-extrabold text-accent tabular-nums">
                  {formatVnd(selectedListing.reward)}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                {selectedListing.status === 'ASSIGNED' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsTaskDetailOpen(false);
                      router.push(`/looker/listing/${selectedListing.id}/execute`);
                    }}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-paper-000 shadow-[0_8px_20px_oklch(0.68_0.198_152/0.25)] transition-transform hover:-translate-y-0.5"
                  >
                    <Crosshair className="h-4 w-4" /> Tiếp Tục Thực Hiện (GPS Check-in &amp; Báo Cáo)
                  </button>
                ) : isKycApproved ? (
                  <button
                    type="button"
                    onClick={() => handleAcceptTask(selectedListing)}
                    disabled={isAcceptingTask}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-paper-000 shadow-[0_8px_20px_oklch(0.68_0.198_152/0.25)] transition-transform hover:-translate-y-0.5 disabled:opacity-70"
                  >
                    {isAcceptingTask ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Đang khóa nhận việc...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Nhận Việc Độc Quyền
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-paper-100 p-2.5 rounded-2xl border border-rule-subtle w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 text-danger font-semibold text-xs">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>
                        {currentUser?.kycStatus === 'CHO_DUYET'
                          ? 'Hồ sơ đang chờ duyệt — Tạm khóa nhận việc'
                          : currentUser?.kycStatus === 'TU_CHOI'
                          ? 'Hồ sơ bị từ chối — Cần nộp lại để nhận việc'
                          : 'Yêu cầu duyệt CCCD & Quét mặt để nhận việc'}
                      </span>
                    </div>
                    <Link
                      href="/looker/onboarding"
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-accent text-paper-000 text-xs font-bold hover:bg-accent-hover transition-colors text-center elevation-rich"
                    >
                      {currentUser?.kycStatus === 'CHO_DUYET' ? 'Kiểm tra trạng thái' : 'Xác thực ngay'}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}



      {/* WITHDRAW MODAL */}
      {withdrawModal && (
        <div
          onClick={() => { setWithdrawModal(false); setWithdrawSuccess(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 p-4 backdrop-blur-md modal-backdrop"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-rule-subtle bg-paper-000 modal-panel modal-panel--zoom"
          >
            <div className="flex items-center justify-between border-b border-rule-subtle p-5 lg:p-6">
              <h3 className="font-display text-xl font-bold text-ink-900 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-paper-000 text-xs">9P</div>
                Rút Tiền Nhanh
              </h3>
              <button
                onClick={() => { setWithdrawModal(false); setWithdrawSuccess(false); }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-100 text-ink-700 hover:bg-paper-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 lg:p-6">
              {withdrawSuccess ? (
                <div className="text-center py-4 modal-panel--zoom">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-accent" />
                  </div>
                  <h4 className="font-display text-xl font-bold text-ink-900 mb-2">Thành Công!</h4>
                  <p className="text-sm text-ink-500 leading-relaxed mb-6">
                    Đã chuyển <strong className="text-ink-900 tabular-nums">{formatVnd(parseInt(withdrawAmount, 10))}</strong> đến {lookerBank.bank} {lookerBankTail}. Tiền sẽ về trong tích tắc.
                  </p>
                  <button
                    onClick={() => { setWithdrawModal(false); setWithdrawSuccess(false); }}
                    className="w-full rounded-xl bg-ink-900 py-3.5 text-sm font-bold text-paper-000 hover:bg-ink-700 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-rule-subtle bg-paper-100 p-4">
                    <span className="text-[0.625rem] font-mono text-ink-500 uppercase tracking-wider block mb-2">Chuyển đến</span>
                    <div className="flex items-center justify-between text-sm font-bold text-ink-900">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper-000 border border-rule-subtle text-xs">
                          {lookerBank.bank ? lookerBank.bank.slice(0, 3).toUpperCase() : '—'}
                        </div>
                        {lookerBank.bank || '—'} {lookerBankTail}
                      </div>
                      <span className="text-accent text-xs">Miễn phí</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-ink-700 mb-2">Số tiền rút (VNĐ)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="10000"
                        value={withdrawAmount}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/[^0-9]/g, '');
                          setWithdrawAmount(clean === '' ? '' : String(Number(clean)));
                        }}
                        className="w-full rounded-xl border-2 border-rule-subtle bg-paper-000 px-4 py-4 pr-16 font-display text-2xl font-bold text-ink-900 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/10 transition-[border-color,box-shadow] tabular-nums"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-ink-500">VNĐ</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-ink-500">
                      <span>Khả dụng: <strong className="tabular-nums text-accent font-bold">{formatVnd(lookerWallet?.available)}</strong></span>
                      <button onClick={() => setWithdrawAmount(String(lookerWallet?.available ?? 0))} className="font-bold text-accent hover:underline">Rút toàn bộ</button>
                    </div>
                    {Number(withdrawAmount) > (lookerWallet?.available || 0) ? (
                      <p className="text-xs text-danger font-medium mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Số tiền rút vượt quá số dư khả dụng trong ví.
                      </p>
                    ) : (Number(withdrawAmount) <= 0 || withdrawAmount === '') && (
                      <p className="text-xs text-danger font-medium mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Số tiền rút phải lớn hơn 0 VNĐ.
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-accent-quiet border border-accent/20 p-4 text-sm text-ink-700 flex items-start gap-3">
                    <Shield className="h-5 w-5 text-accent shrink-0" />
                    <p className="leading-relaxed">Yêu cầu rút tiền sẽ được gửi để xử lý.</p>
                  </div>

                  <button
                    onClick={handleConfirmWithdraw}
                    disabled={isWithdrawing || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > (lookerWallet?.available || 0)}
                    className="w-full rounded-xl bg-accent py-4 text-sm font-bold text-paper-000 transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isWithdrawing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Đang chuyển lệnh...
                      </>
                    ) : (
                      'Xác Nhận Rút Tiền'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BANK SETUP MODAL */}
      {isBankModalOpen && (
        <div
          onClick={() => setIsBankModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 p-4 backdrop-blur-md modal-backdrop"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-rule-subtle bg-paper-000 modal-panel modal-panel--zoom overflow-hidden elevation-rich"
          >
            <div className="flex items-center justify-between border-b border-rule-subtle p-5 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-quiet text-accent">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink-900">Thiết Lập Tài Khoản Nhận Thù Lao</h3>
                  <p className="text-xs text-ink-500">Bắt buộc để nhận nhiệm vụ và giải ngân</p>
                </div>
              </div>
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-100 text-ink-700 hover:bg-paper-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="p-5 lg:p-6 space-y-4">
              {bankSaveError && (
                <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{bankSaveError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-600 mb-1.5">
                  Tên Ngân Hàng <span className="text-danger">*</span>
                </label>
                <select
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full rounded-xl border border-rule-subtle bg-paper-000 px-3.5 py-3 text-sm font-semibold text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {VIETNAM_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-600 mb-1.5">
                  Số Tài Khoản Ngân Hàng <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 0398829102"
                  value={bankForm.bankAccountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, bankAccountNumber: e.target.value.replace(/[^0-9a-zA-Z]/g, '') })}
                  className="w-full rounded-xl border border-rule-subtle bg-paper-000 px-3.5 py-3 text-sm font-mono font-bold text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-600 mb-1.5">
                  Họ Và Tên Chủ Tài Khoản <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  placeholder="NGUYEN VAN A"
                  value={bankForm.bankAccountHolder}
                  onChange={(e) => setBankForm({ ...bankForm, bankAccountHolder: e.target.value.toUpperCase() })}
                  className="w-full rounded-xl border border-rule-subtle bg-paper-000 px-3.5 py-3 text-sm font-bold uppercase text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                <span className="block text-[0.6875rem] text-ink-500 mt-1">
                  Khuyến nghị: Tên chủ tài khoản phải khớp với Họ tên trên Căn cước công dân đã xác thực.
                </span>
              </div>

              <div className="rounded-xl bg-paper-100 p-3.5 text-xs text-ink-600 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>
                  Thông tin tài khoản được mã hóa bảo mật. Mọi khoản thù lao từ nhiệm vụ sau khi được duyệt sẽ được bảo lưu và giải ngân trực tiếp vào số tài khoản này.
                </span>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-rule-subtle text-ink-700 font-bold text-sm hover:bg-paper-100 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSavingBank}
                  className="flex-1 py-3 px-4 rounded-xl bg-accent text-paper-000 font-bold text-sm hover:bg-accent-hover transition-colors elevation-rich disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSavingBank ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang Lưu...
                    </>
                  ) : (
                    'Lưu Tài Khoản Nhận'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
