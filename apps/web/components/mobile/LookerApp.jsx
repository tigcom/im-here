'use client';

import { useState, useRef, useEffect } from 'react';
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
  Check,
  TrendingUp,
  Award,
  Bell,
  Lock,
  MessageSquare,
  ArrowRightLeft,
  Navigation,
  AlertCircle
} from 'lucide-react';
import dynamic from 'next/dynamic';

const TaskMap = dynamic(() => import('./TaskMap'), { ssr: false });

const MOCK_TASKS = [
  {
    id: 'TASK-8801',
    category: 'RETAIL',
    categoryLabel: 'Kiểm toán quầy kệ',
    title: 'Khảo sát trưng bày bia Heineken Silver tại WinMart+',
    address: '142 Hoàng Diệu, Phường 9, Quận 4, TP. Hồ Chí Minh',
    lat: 10.76211,
    lng: 106.70258,
    distance: '0.4 km',
    reward: 85000,
    timeEst: '15 phút',
    expiresIn: '45 phút',
    sla: 'Hỏa tốc',
    status: 'AVAILABLE',
    urgent: true,
    steps: [
      'Chụp góc rộng toàn cảnh kệ nước giải khát (chính diện)',
      'Chụp cận cảnh biển giá khuyến mãi & hạn sử dụng lốc 6 lon',
      'Đếm và nhập số lượng facing Heineken Silver đang trưng bày',
      'Ghi nhận tình trạng out-of-stock (hết hàng) nếu có',
    ],
    client: 'Heineken Vietnam FMCG Audit',
  },
  {
    id: 'TASK-8802',
    category: 'ASSET',
    categoryLabel: 'Thẩm định tài sản',
    title: 'Xác minh hiện trạng xe VinFast VF8 thế chấp',
    address: 'Hầm B2 Tòa Lancaster, 22 Lê Thánh Tôn, Bến Nghé, Quận 1',
    lat: 10.77908,
    lng: 106.70359,
    distance: '1.2 km',
    reward: 180000,
    timeEst: '25 phút',
    expiresIn: '2 giờ',
    sla: 'Ưu tiên',
    status: 'AVAILABLE',
    urgent: false,
    steps: [
      'Chụp biển số xe + tem kiểm định kính chắn gió trước',
      'Chụp đồng hồ ODO hiển thị số km lăn bánh thực tế',
      'Chụp 4 góc thân xe kiểm tra trầy xước, va móp',
      'Gắn thẻ RFID / chụp số khung gầm dưới nắp capo',
    ],
    client: 'VPBank Risk & Collateral Audit',
  },
  {
    id: 'TASK-8803',
    category: 'KYC',
    categoryLabel: 'Xác minh cư trú',
    title: 'Xác thực địa chỉ cư trú & thông tin hộ kinh doanh',
    address: '58/12 Nguyễn Thông, Phường Võ Thị Sáu, Quận 3',
    lat: 10.7820,
    lng: 106.6850,
    distance: '2.5 km',
    reward: 120000,
    timeEst: '20 phút',
    expiresIn: '4 giờ',
    sla: 'Tiêu chuẩn',
    status: 'AVAILABLE',
    urgent: false,
    steps: [
      'Chụp biển số nhà & bảng hiệu cửa hàng mặt tiền',
      'Xác nhận người vay có đang thường trú tại địa chỉ',
      'Chụp ảnh không gian kinh doanh tạp hóa bên trong',
      'Thu thập chữ ký xác nhận của chủ hộ',
    ],
    client: 'Home Credit Consumer Finance',
  },
  {
    id: 'TASK-8804',
    category: 'RETAIL',
    categoryLabel: 'Biển hiệu & POSM',
    title: 'Kiểm tra hộp đèn nhận diện & biển hiệu GrabFood',
    address: '320 Cách Mạng Tháng 8, Phường 10, Quận 3',
    lat: 10.7815,
    lng: 106.6800,
    distance: '3.1 km',
    reward: 65000,
    timeEst: '10 phút',
    expiresIn: '6 giờ',
    sla: 'Tiêu chuẩn',
    status: 'AVAILABLE',
    urgent: false,
    steps: [
      'Chụp ảnh biển hiệu quán từ vỉa hè đối diện',
      'Kiểm tra decal logo GrabFood dán trước quầy thanh toán',
      'Kiểm tra hoạt động máy in hóa đơn POS',
    ],
    client: 'Grab Vietnam Merchant Operations',
  },
];

const MOCK_WALLET_HISTORY = [
  {
    id: 'TXN-9021',
    title: 'Thù lao nhiệm vụ #TASK-8790',
    desc: 'Kiểm tra kho lạnh Circle K Bùi Viện',
    amount: 110000,
    type: 'INCOME',
    time: '11:42 - Hôm nay',
    bankRef: '9PAY-INSTANT-892',
  },
  {
    id: 'TXN-9020',
    title: 'Rút tiền về Vietcombank (*8832)',
    desc: 'Rút thù lao tức thì qua 9Pay Fast Transfer',
    amount: -500000,
    type: 'WITHDRAW',
    time: '09:15 - Hôm nay',
    bankRef: '9PAY-VCB-7741',
  },
  {
    id: 'TXN-9019',
    title: 'Thù lao nhiệm vụ #TASK-8785',
    desc: 'Xác thực tài sản nhà phố Quận 7',
    amount: 220000,
    type: 'INCOME',
    time: '16:30 - Hôm qua',
    bankRef: '9PAY-INSTANT-554',
  },
];

export default function LookerApp() {
  const [activeTab, setActiveTab] = useState('MAP');
  const [selectedTask, setSelectedTask] = useState(MOCK_TASKS[0]);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraPhotoCaptured, setCameraPhotoCaptured] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('450000');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');
  
  // Logic kéo thả Bottom Sheet trên Mobile
  const [mapHeightVh, setMapHeightVh] = useState(40);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const startMapHeight = useRef(40);

  const handleDragStart = (e) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return;
    isDragging.current = true;
    dragStartY.current = e.touches ? e.touches[0].clientY : e.clientY;
    startMapHeight.current = mapHeightVh;
  };

  const handleDragMove = (e) => {
    if (!isDragging.current) return;
    if (e.cancelable) e.preventDefault(); // Ngăn cuộn trang khi đang kéo
    const currentY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaY = currentY - dragStartY.current;
    
    // Convert deltaY to vh
    const deltaVh = (deltaY / window.innerHeight) * 100;
    let newHeight = startMapHeight.current + deltaVh;
    
    // Giới hạn kéo: bản đồ nhỏ nhất 15vh, lớn nhất 65vh (để chừa chỗ cho thanh handle)
    if (newHeight < 15) newHeight = 15;
    if (newHeight > 65) newHeight = 65;
    
    setMapHeightVh(newHeight);
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    // Snap về các điểm mốc (Anchor points)
    if (mapHeightVh < 25) setMapHeightVh(15);
    else if (mapHeightVh > 55) setMapHeightVh(65);
    else setMapHeightVh(40);
  };

  useEffect(() => {
    const handleGlobalMove = (e) => {
      if (isDragging.current) handleDragMove(e);
    };
    const handleGlobalEnd = () => {
      if (isDragging.current) handleDragEnd();
    };

    window.addEventListener('touchmove', handleGlobalMove, { passive: false });
    window.addEventListener('touchend', handleGlobalEnd);
    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalEnd);

    return () => {
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalEnd);
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalEnd);
    };
  }, [mapHeightVh]);

  const filteredTasks = MOCK_TASKS.filter((task) => {
    if (filterCategory === 'ALL') return true;
    return task.category === filterCategory;
  });

  const handleOpenTask = (task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleStartTaskCamera = () => {
    setIsTaskDetailOpen(false);
    setIsCameraActive(true);
    setCameraPhotoCaptured(false);
    setReportSuccess(false);
  };

  const handleCapturePhoto = () => {
    setCameraPhotoCaptured(true);
  };

  const handleSubmitProof = () => {
    setIsSubmittingReport(true);
    setTimeout(() => {
      setIsSubmittingReport(false);
      setReportSuccess(true);
      setTimeout(() => {
        setIsCameraActive(false);
        setReportSuccess(false);
        setActiveTab('WALLET');
      }, 1500);
    }, 1200);
  };

  const NAV_ITEMS = [
    { id: 'MAP', label: 'Bản Đồ', icon: Map },
    { id: 'TASKS', label: 'Việc Làm', icon: ClipboardList },
    { id: 'CAMERA', label: 'Camera', icon: Camera, isPrimary: true },
    { id: 'WALLET', label: 'Ví 9Pay', icon: Wallet },
    { id: 'PROFILE', label: 'Cá Nhân', icon: User },
  ];

  return (
    <div className="flex h-screen w-full bg-surface-950 text-on-surface-900 font-sans overflow-hidden">
      
      {/* ──────────────────────────────────────────────────────────────────
          DESKTOP SIDEBAR
          ────────────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-rule-dark bg-surface-950 z-40">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-rule-dark">
          <img 
            src="/android-chrome-192x192.png" 
            alt="Im-Here Logo" 
            className="h-10 w-10 object-contain" 
          />
          <div>
            <h1 className="font-display text-base font-bold tracking-tight">Im-Here Looker</h1>
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
            
            if (item.isPrimary) {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedTask(MOCK_TASKS[0]);
                    handleStartTaskCamera();
                  }}
                  className="w-full flex items-center gap-3 rounded-xl bg-accent px-4 py-3.5 text-sm font-bold text-paper-000 shadow-lg transition-all hover:bg-accent-hover hover:-translate-y-0.5 mt-4 mb-2"
                >
                  <Icon className="h-5 w-5" />
                  {item.label} Mở Báo Cáo
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive 
                    ? 'bg-surface-800 text-on-surface-900' 
                    : 'text-on-surface-500 hover:bg-surface-900 hover:text-on-surface-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-accent' : ''}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-rule-dark">
          <div className="flex items-center gap-3 rounded-xl bg-surface-900 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent font-bold">
              NA
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">Nguyễn Văn An</p>
              <p className="text-xs text-on-surface-500 font-mono">LV.3 • 9Pay Liên kết</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────────────
          MAIN CONTENT AREA
          ────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full bg-paper-100 text-ink-900 lg:rounded-l-3xl lg:shadow-[-20px_0_40px_oklch(0_0_0/0.5)] relative overflow-hidden">
        
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
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                <span className="font-mono text-[0.625rem] font-bold uppercase tracking-wider text-accent">
                  GPS TRỰC CHIẾN
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('WALLET')}
            className="flex items-center gap-1.5 rounded-full border border-rule-subtle bg-paper-100 px-3 py-1.5 text-xs font-bold text-ink-900 transition-colors hover:bg-paper-200"
          >
            <Wallet className="h-3.5 w-3.5 text-accent" />
            <span className="tabular font-mono">765.000đ</span>
          </button>
        </header>

        {/* Dynamic Content based on Active Tab */}
        <div className="flex-1 overflow-y-auto pb-24 lg:pb-0" data-lenis-prevent="true">
          
          {/* TAB 1: BẢN ĐỒ THỰC ĐỊA & RADAR VIỆC LÀM (MAP) */}
          {activeTab === 'MAP' && (
            <div className="h-full flex flex-col lg:flex-row min-h-0">
              {/* Vùng bản đồ tương tác */}
              <div 
                className="relative shrink-0 lg:!h-full lg:flex-[7] bg-surface-900 overflow-hidden transition-[height] duration-75 ease-out"
                style={{ height: `${mapHeightVh}vh` }}
              >
                <img
                  src="/images/mobile-ui-map-view.png"
                  alt="Bản đồ định vị Looker"
                  className="h-full w-full object-cover opacity-80 mix-blend-luminosity hidden"
                />

                <TaskMap 
                  tasks={MOCK_TASKS} 
                  selectedTaskId={selectedTask?.id} 
                  onSelectTask={setSelectedTask} 
                />

                {/* Lớp Overlay hiển thị thông tin chung */}
                <div className="absolute top-4 left-4 z-20 rounded-xl border border-rule-subtle bg-paper-000/90 px-3 py-2 text-xs font-bold backdrop-blur-md shadow-sm pointer-events-none">
                  Bán kính 3km <span className="text-on-surface-300 mx-1">|</span> <span className="text-accent">{MOCK_TASKS.length} việc khả dụng</span>
                </div>

                <button className="absolute bottom-4 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-2xl border border-rule-subtle bg-paper-000/90 shadow-lg backdrop-blur-md transition-transform hover:scale-105">
                  <Navigation className="h-5 w-5 text-ink-900" />
                </button>
              </div>

              {/* Bảng danh sách kéo trượt - Desktop: lg:flex-[5] lg:border-l */}
              <div className="relative -mt-6 lg:mt-0 flex-1 lg:flex-[5] min-h-0 rounded-t-3xl lg:rounded-none lg:border-l border-rule-subtle bg-paper-000 px-5 lg:px-8 shadow-[0_-10px_40px_oklch(0_0_0/0.05)] lg:shadow-none flex flex-col h-full z-20 py-5">
                <div 
                  className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-paper-300 lg:hidden cursor-grab active:cursor-grabbing transition-colors hover:bg-paper-400" 
                  onTouchStart={handleDragStart}
                  onMouseDown={handleDragStart}
                />
                
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-lg lg:text-xl font-bold text-ink-900">Nhiệm Vụ Gần Đây</h2>
                    <p className="text-sm text-ink-500 mt-1">Sẵn sàng nhận việc quanh vị trí của bạn</p>
                  </div>
                  <button onClick={() => setActiveTab('TASKS')} className="text-sm font-bold text-accent hover:underline hidden lg:block">
                    Xem tất cả ({MOCK_TASKS.length})
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1" data-lenis-prevent="true">
                  {MOCK_TASKS.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`group cursor-pointer rounded-2xl border bg-paper-000 p-4 transition-all hover:shadow-[0_8px_30px_oklch(0.18_0.04_235/0.08)] hover:-translate-y-1 ${
                        selectedTask?.id === task.id ? 'border-accent shadow-md ring-1 ring-accent' : 'border-rule-subtle hover:border-accent/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="rounded-full bg-accent/10 px-2.5 py-1 font-mono text-[0.625rem] font-bold text-accent">
                          {task.categoryLabel}
                        </span>
                        <span className="font-display text-lg font-bold text-ink-900 tabular-nums">
                          +{task.reward.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <h3 className="font-display text-base font-bold leading-tight text-ink-900 group-hover:text-accent transition-colors">
                        {task.title}
                      </h3>
                      <div className="mt-3 flex items-center gap-1.5 text-sm text-ink-500">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="line-clamp-1">{task.address}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-rule-subtle pt-3">
                        <div className="flex items-center gap-3 text-xs font-mono text-ink-500">
                          <span className="flex items-center gap-1"><Navigation className="h-3.5 w-3.5"/> {task.distance}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5"/> {task.timeEst}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenTask(task); }}
                          className="font-bold text-accent text-sm flex items-center gap-1 hover:underline p-1 -mr-1 rounded-md active:bg-accent/10 transition-colors"
                        >
                          Chi tiết <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TASKS */}
          {activeTab === 'TASKS' && (
            <div className="p-5 lg:p-10 max-w-7xl mx-auto w-full">
              <header className="mb-8">
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-ink-900">Sàn Nhiệm Vụ</h2>
                <p className="text-ink-500 mt-2 text-base">Lọc và nhận các nhiệm vụ thực địa phù hợp với bạn.</p>
              </header>

              <div className="flex flex-wrap gap-2 lg:gap-3 mb-8">
                {[
                  { id: 'ALL', label: `Tất cả (${MOCK_TASKS.length})` },
                  { id: 'RETAIL', label: 'Quầy kệ FMCG' },
                  { id: 'ASSET', label: 'Thẩm định tài sản' },
                  { id: 'KYC', label: 'Xác minh KYC' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      filterCategory === cat.id
                        ? 'bg-ink-900 text-paper-000 shadow-md'
                        : 'bg-paper-000 border border-rule-subtle text-ink-700 hover:bg-paper-100 hover:text-ink-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="flex flex-col rounded-2xl border border-rule-subtle bg-paper-000 p-5 lg:p-6 transition-all hover:shadow-[0_12px_40px_oklch(0.18_0.04_235/0.08)] hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-accent">{task.id}</span>
                        <span className="rounded-full bg-paper-100 px-2.5 py-1 text-[0.6875rem] font-semibold text-ink-700">
                          {task.client}
                        </span>
                      </div>
                      {task.urgent && (
                        <span className="rounded-full bg-accent-orange/10 px-2.5 py-1 text-[0.625rem] font-bold text-accent-orange uppercase tracking-wider flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Hỏa tốc
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-lg font-bold text-ink-900 leading-snug mb-3 flex-1">
                      {task.title}
                    </h3>

                    <div className="space-y-2 text-sm text-ink-700 mb-5">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-ink-500" />
                        <span className="line-clamp-2">{task.address}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-y border-rule-subtle py-3 mb-5 font-mono text-[0.6875rem] text-ink-700 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <Navigation className="h-4 w-4 text-ink-500" />
                        <span>{task.distance}</span>
                      </div>
                      <div className="flex flex-col gap-1 items-center border-l border-rule-subtle">
                        <Clock className="h-4 w-4 text-ink-500" />
                        <span>{task.timeEst}</span>
                      </div>
                      <div className="flex flex-col gap-1 items-center border-l border-rule-subtle">
                        <Shield className="h-4 w-4 text-ink-500" />
                        <span>{task.expiresIn}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <span className="block text-[0.625rem] text-ink-500 uppercase font-bold tracking-wider mb-0.5">Thù lao</span>
                        <div className="font-display text-xl font-bold text-accent tabular-nums">
                          {task.reward.toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenTask(task)}
                        className="rounded-xl bg-ink-900 px-5 py-2.5 text-sm font-bold text-paper-000 transition-colors hover:bg-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WALLET */}
          {activeTab === 'WALLET' && (
            <div className="p-5 lg:p-10 max-w-4xl mx-auto w-full">
              <header className="mb-8">
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-ink-900">Ví Thù Lao 9Pay</h2>
                <p className="text-ink-500 mt-2 text-base">Quản lý thu nhập và rút tiền tức thì 24/7.</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Balance Card */}
                <div className="lg:col-span-7 rounded-3xl bg-surface-950 p-6 lg:p-8 text-on-surface-900 shadow-xl relative overflow-hidden">
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
                    <span className="text-sm font-medium text-on-surface-500 block mb-2">Số dư khả dụng</span>
                    <div className="font-display text-4xl lg:text-5xl font-extrabold text-on-surface-900 tabular-nums tracking-tight">
                      765.000 <span className="text-2xl lg:text-3xl font-sans font-medium text-accent">VNĐ</span>
                    </div>
                  </div>

                  <div className="relative z-10 mt-8 flex flex-col sm:flex-row gap-4 sm:items-center justify-between border-t border-rule-dark pt-6">
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="block text-on-surface-500 mb-1 text-xs">Chờ đối soát</span>
                        <strong className="text-accent-amber font-mono text-base">180.000đ</strong>
                      </div>
                      <div>
                        <span className="block text-on-surface-500 mb-1 text-xs">Hôm nay</span>
                        <strong className="text-accent font-mono text-base">+345.000đ</strong>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setWithdrawModal(true)}
                      className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-paper-000 shadow-[0_4px_20px_oklch(0.68_0.198_152/0.4)] transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper-000"
                    >
                      Rút Tiền Ngay
                    </button>
                  </div>
                </div>

                {/* Bank Info & History */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Bank Account */}
                  <div className="rounded-2xl border border-rule-subtle bg-paper-000 p-5 shadow-sm">
                    <h3 className="font-mono text-xs font-bold text-ink-500 uppercase tracking-wider mb-4">Tài Khoản Nhận</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-paper-100 font-bold text-ink-900 text-lg border border-rule-subtle">
                          VCB
                        </div>
                        <div>
                          <span className="block font-bold text-ink-900 text-sm">Vietcombank</span>
                          <span className="font-mono text-xs text-ink-500 mt-0.5 block">1018 **** 8832</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-paper-100 px-3 py-1 text-[0.625rem] font-bold text-ink-700">Mặc định</span>
                    </div>
                  </div>

                  {/* History list */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-mono text-xs font-bold text-ink-500 uppercase tracking-wider">Lịch Sử Giao Dịch</h3>
                      <button className="text-xs font-bold text-accent hover:underline">Xem tất cả</button>
                    </div>
                    <div className="space-y-3">
                      {MOCK_WALLET_HISTORY.map((txn) => (
                        <div key={txn.id} className="flex items-center justify-between rounded-xl border border-rule-subtle bg-paper-000 p-4 transition-colors hover:bg-paper-100">
                          <div className="flex items-center gap-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${txn.type === 'WITHDRAW' ? 'bg-surface-900 text-paper-000' : 'bg-accent/15 text-accent'}`}>
                              {txn.type === 'WITHDRAW' ? <ArrowRightLeft className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                            </div>
                            <div>
                              <span className="block font-bold text-ink-900 text-sm">{txn.title}</span>
                              <span className="block text-[0.6875rem] text-ink-500 mt-1">{txn.time}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`block font-mono text-sm font-bold tabular-nums ${txn.amount > 0 ? 'text-accent' : 'text-ink-900'}`}>
                              {txn.amount > 0 ? '+' : ''}{txn.amount.toLocaleString('vi-VN')}đ
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
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-ink-900">Hồ Sơ Đối Tác</h2>
                <p className="text-ink-500 mt-2 text-base">Cấp bậc, chứng chỉ và thiết lập tài khoản cá nhân.</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Profile Main Card */}
                <div className="rounded-3xl border border-rule-subtle bg-paper-000 p-6 lg:p-8 shadow-sm">
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-900 text-paper-000 font-display text-3xl font-bold shadow-md">
                        NA
                      </div>
                      <span className="absolute -bottom-2 -right-2 rounded-lg bg-accent px-2 py-1 font-mono text-[0.625rem] font-bold text-paper-000 shadow-sm border border-paper-000">
                        LV.3
                      </span>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h3 className="font-display text-xl font-bold text-ink-900">Nguyễn Văn An</h3>
                        <span className="inline-flex w-max items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-[0.6875rem] font-bold text-accent">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Đã KYC
                        </span>
                      </div>
                      <p className="font-mono text-sm text-ink-500 mb-3">ID: LKR-84-0918</p>
                      <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                        <Award className="h-4 w-4" /> Đánh giá 4.96/5.00 (142 nhiệm vụ)
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-3 text-center border-t border-rule-subtle pt-8">
                    <div>
                      <span className="block text-xs text-ink-500 mb-1.5">Tỷ lệ duyệt</span>
                      <strong className="font-display text-xl lg:text-2xl font-bold text-accent">99.3%</strong>
                    </div>
                    <div className="border-x border-rule-subtle">
                      <span className="block text-xs text-ink-500 mb-1.5">Tốc độ SLA</span>
                      <strong className="font-display text-xl lg:text-2xl font-bold text-ink-900">42p</strong>
                    </div>
                    <div>
                      <span className="block text-xs text-ink-500 mb-1.5">Tổng thu</span>
                      <strong className="font-display text-xl lg:text-2xl font-bold text-ink-900">12.4 Tr</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Certificates */}
                  <div className="rounded-2xl border border-rule-subtle bg-paper-000 p-6 shadow-sm">
                    <h3 className="font-mono text-xs font-bold text-ink-500 uppercase tracking-wider mb-5">Chứng Chỉ Nghiệp Vụ</h3>
                    <div className="space-y-3">
                      {['Khảo sát bán lẻ FMCG', 'Thẩm định xe cộ & thiết bị', 'Xác minh cư trú KYC'].map((cert, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-rule-subtle bg-paper-100 p-3.5">
                          <span className="font-bold text-ink-900 text-sm">{cert}</span>
                          <span className="font-mono text-[0.625rem] font-bold text-accent flex items-center gap-1">
                            <Check className="h-3 w-3" /> HỢP LỆ
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="rounded-2xl border border-rule-subtle bg-paper-000 p-2 shadow-sm">
                    {[
                      { icon: Bell, label: 'Thông báo nhiệm vụ lân cận' },
                      { icon: Lock, label: 'Bảo mật 2 lớp & Sinh trắc học' },
                      { icon: MessageSquare, label: 'Hỗ trợ trực tuyến Looker Support' }
                    ].map((item, i) => (
                      <button key={i} className="w-full flex items-center justify-between p-4 font-semibold text-ink-900 hover:bg-paper-100 rounded-xl transition-colors">
                        <span className="flex items-center gap-3 text-sm">
                          <item.icon className="h-5 w-5 text-ink-500" />
                          {item.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-ink-300" />
                      </button>
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
            
            if (item.isPrimary) {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedTask(MOCK_TASKS[0]);
                    handleStartTaskCamera();
                  }}
                  className="flex -mt-6 h-14 w-14 items-center justify-center rounded-full bg-accent text-paper-000 shadow-[0_8px_20px_oklch(0.68_0.198_152/0.4)] transition-transform hover:scale-105 active:scale-95"
                >
                  <Camera className="h-6 w-6" />
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 transition-colors ${
                  isActive ? 'text-accent' : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className={`text-[0.625rem] font-semibold ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ──────────────────────────────────────────────────────────────────
          MODALS
          ────────────────────────────────────────────────────────────────── */}
      
      {/* TASK DETAIL MODAL */}
      {isTaskDetailOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-surface-950/80 p-0 lg:p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl lg:rounded-3xl bg-paper-000 shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 lg:zoom-in-95 duration-300" data-lenis-prevent="true">
            
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-rule-subtle bg-paper-000/95 px-5 lg:px-8 py-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-accent">{selectedTask.id}</span>
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[0.6875rem] font-bold text-accent">
                  {selectedTask.categoryLabel}
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
                {selectedTask.title}
              </h3>
              <p className="mt-3 text-sm text-ink-500 flex items-center gap-2">
                <User className="h-4 w-4" /> Khách hàng: <strong className="text-ink-900">{selectedTask.client}</strong>
              </p>

              <div className="mt-6 rounded-2xl border border-rule-subtle bg-paper-50 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-ink-900 text-sm block mb-1">Địa điểm thực hiện</span>
                    <p className="text-ink-700 text-sm leading-relaxed">{selectedTask.address}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 lg:gap-8 border-t border-rule-subtle pt-4 font-mono text-xs text-ink-700">
                  <span className="flex items-center gap-1.5"><Navigation className="h-4 w-4"/> {selectedTask.distance}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> {selectedTask.timeEst}</span>
                  <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-accent-orange"/> SLA: {selectedTask.sla}</span>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-mono text-xs font-bold text-ink-500 uppercase tracking-wider mb-4">
                  Các Bước Bắt Buộc ({selectedTask.steps.length})
                </h4>
                <div className="space-y-3">
                  {selectedTask.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4 rounded-xl border border-rule-subtle p-4 bg-paper-000 shadow-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-paper-000">
                        {idx + 1}
                      </span>
                      <span className="text-ink-900 text-sm leading-relaxed font-medium pt-0.5">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-rule-subtle bg-paper-000 p-5 lg:p-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[0.625rem] text-ink-500 uppercase font-bold tracking-wider block mb-1">Thù lao hoàn thành</span>
                <div className="font-display text-2xl lg:text-3xl font-extrabold text-accent tabular-nums">
                  {selectedTask.reward.toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
              <button
                onClick={handleStartTaskCamera}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 text-sm font-bold text-paper-000 shadow-[0_8px_20px_oklch(0.68_0.198_152/0.25)] transition-transform hover:-translate-y-0.5"
              >
                <Camera className="h-5 w-5" /> Bắt Đầu Chụp Báo Cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CAMERA EXECUTION MODAL */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950 p-0 sm:p-4 lg:p-8 backdrop-blur-md">
          <div className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden sm:rounded-3xl bg-surface-950 text-on-surface-900 border sm:border-rule-dark shadow-2xl animate-in zoom-in-95 duration-300">
            
            <div className="absolute top-0 w-full z-10 flex items-center justify-between bg-gradient-to-b from-surface-950/90 to-transparent px-4 py-4 sm:px-6">
              <div className="flex items-center gap-2 bg-surface-950/80 px-3 py-1.5 rounded-full backdrop-blur-md border border-rule-dark">
                <span className="h-2.5 w-2.5 rounded-full bg-accent animate-ping" />
                <span className="font-mono text-xs font-bold text-accent tracking-wider">LIVE PROOF</span>
              </div>
              <button
                onClick={() => setIsCameraActive(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-900/80 text-on-surface-700 hover:text-on-surface-900 backdrop-blur-md transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="relative flex-1 bg-surface-900 overflow-hidden">
              <img
                src="/images/mobile-ui-camera-execution.png"
                alt="Camera thực địa"
                className="h-full w-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-10 pointer-events-none" />

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 sm:w-80 sm:h-80 border-2 border-dashed border-paper-000/50 rounded-3xl relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-2xl -m-[2px]" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-2xl -m-[2px]" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent rounded-bl-2xl -m-[2px]" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent rounded-br-2xl -m-[2px]" />
                  
                  {cameraPhotoCaptured && (
                    <div className="absolute inset-0 flex items-center justify-center bg-accent/20 rounded-3xl backdrop-blur-sm transition-all duration-300">
                      <CheckCircle2 className="w-16 h-16 text-accent drop-shadow-md" />
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-8 rounded-2xl border border-rule-dark bg-surface-950/85 p-4 backdrop-blur-md shadow-2xl">
                <div className="flex items-center justify-between font-mono text-[0.625rem] sm:text-xs text-accent font-bold mb-2">
                  <span className="flex items-center gap-1.5"><Shield className="h-3 w-3 sm:h-4 sm:w-4" /> SECURE VERIFICATION</span>
                  <span>GEO-LOCKED</span>
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 text-[0.5625rem] sm:text-[0.6875rem] text-on-surface-500 font-mono">
                  <div>LAT/LNG: <span className="text-on-surface-900 font-medium">10.7769°N, 106.7009°E</span></div>
                  <div className="text-right">ACCURACY: <span className="text-on-surface-900 font-medium">±1.8m</span></div>
                  <div>TASK: <span className="text-on-surface-900 font-medium">{selectedTask?.id}</span></div>
                  <div className="text-right">HASH: <span className="text-on-surface-900 font-medium text-[0.5rem] sm:text-[0.625rem]">e3b0c44298fc1c14</span></div>
                </div>
              </div>
            </div>

            <div className="bg-surface-950 p-6 sm:p-8 border-t border-rule-dark z-20">
              {reportSuccess ? (
                <div className="rounded-2xl bg-accent/10 border border-accent/20 p-6 text-center animate-in fade-in duration-300">
                  <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-3" />
                  <h4 className="font-display text-lg sm:text-xl font-bold text-accent mb-2">Báo Cáo Đã Gửi Thành Công!</h4>
                  <p className="text-sm text-on-surface-500">Hệ thống AI QA đang duyệt ảnh. Thù lao sẽ sớm cộng vào Ví 9Pay.</p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  {!cameraPhotoCaptured ? (
                    <button
                      onClick={handleCapturePhoto}
                      className="group relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-[6px] border-paper-000/20 bg-transparent transition-transform hover:scale-105 active:scale-95"
                    >
                      <div className="absolute h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-paper-000 group-hover:bg-accent transition-colors" />
                    </button>
                  ) : (
                    <div className="flex w-full sm:w-auto gap-4">
                      <button
                        onClick={() => setCameraPhotoCaptured(false)}
                        className="flex-1 sm:w-32 rounded-xl bg-surface-900 py-3.5 sm:py-4 text-sm font-bold text-on-surface-900 hover:bg-surface-800 transition-colors"
                      >
                        Chụp Lại
                      </button>
                      <button
                        onClick={handleSubmitProof}
                        disabled={isSubmittingReport}
                        className="flex-1 sm:w-48 rounded-xl bg-accent py-3.5 sm:py-4 text-sm font-bold text-paper-000 shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
                      >
                        {isSubmittingReport ? (
                          <>Đang xử lý...</>
                        ) : (
                          <>Nộp Báo Cáo <ChevronRight className="h-4 w-4" /></>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {withdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-rule-subtle bg-paper-000 shadow-2xl animate-in zoom-in-95 duration-200">
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
                <div className="text-center py-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-accent" />
                  </div>
                  <h4 className="font-display text-xl font-bold text-ink-900 mb-2">Thành Công!</h4>
                  <p className="text-sm text-ink-500 leading-relaxed mb-6">
                    Đã chuyển <strong className="text-ink-900 tabular-nums">{parseInt(withdrawAmount, 10).toLocaleString('vi-VN')} VNĐ</strong> đến Vietcombank (*8832). Tiền sẽ về trong tích tắc.
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
                  <div className="rounded-2xl border border-rule-subtle bg-paper-50 p-4">
                    <span className="text-[0.625rem] font-mono text-ink-500 uppercase tracking-wider block mb-2">Chuyển đến</span>
                    <div className="flex items-center justify-between text-sm font-bold text-ink-900">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper-000 border border-rule-subtle text-xs">VCB</div>
                        Vietcombank (*8832)
                      </div>
                      <span className="text-accent text-xs">Miễn phí</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-ink-700 mb-2">Số tiền rút (VNĐ)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full rounded-xl border-2 border-rule-subtle bg-paper-000 px-4 py-4 pr-16 font-display text-2xl font-bold text-ink-900 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/10 transition-all tabular-nums"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-ink-500">VNĐ</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-ink-500">
                      <span>Khả dụng: <strong className="tabular-nums">765.000đ</strong></span>
                      <button onClick={() => setWithdrawAmount('765000')} className="font-bold text-accent hover:underline">Rút toàn bộ</button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-accent-quiet border border-accent/20 p-4 text-sm text-ink-700 flex items-start gap-3">
                    <Shield className="h-5 w-5 text-accent shrink-0" />
                    <p className="leading-relaxed">Giao dịch được xử lý và bảo vệ bởi <strong className="text-ink-900">Cổng thanh toán 9Pay</strong>.</p>
                  </div>

                  <button
                    onClick={() => setWithdrawSuccess(true)}
                    className="w-full rounded-xl bg-accent py-4 text-sm font-bold text-paper-000 shadow-lg transition-transform hover:-translate-y-0.5"
                  >
                    Xác Nhận Rút Tiền
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
