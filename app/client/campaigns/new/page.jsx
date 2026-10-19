'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Clock,
  Coins,
  Plus,
  Trash2,
  ChevronDown,
  Layers,
  Check,
  Navigation,
  FileText,
  CheckSquare,
  AlertCircle,
  Wallet,
  HelpCircle,
} from 'lucide-react';

import { useAuth } from '@/components/auth/AuthContext';
import { api } from '@/lib/api';
import { getActiveCategories } from '@/lib/data';
import { CATEGORY_GROUP_LABEL } from '@/lib/constants';
import { formatVnd } from '@/lib/format';
import AddressMapSelector from '@/components/map/AddressMapSelector';

export default function NewListingPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const categories = getActiveCategories();
  const groups = Array.from(new Set(categories.map((c) => c.group)));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'CAT-01');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState(21.0285);
  const [longitude, setLongitude] = useState(105.8542);
  const [deadlineHours, setDeadlineHours] = useState(24);
  const [reward, setReward] = useState(50000);
  const [instructions, setInstructions] = useState('Kiểm tra thực địa, bật GPS xác thực trong bán kính 100m, chụp ảnh rõ nét và hoàn thành đủ checklist.');
  const [checklist, setChecklist] = useState([
    'Kiểm tra đúng biển hiệu và số nhà địa chỉ thực tế',
    'Chụp ảnh hiện trạng toàn cảnh mặt tiền',
    'Ghi nhận các thông tin bất thường (nếu có)'
  ]);

  // Bộ câu hỏi khảo sát (Option không bắt buộc)
  const [questions, setQuestions] = useState([]);

  const [walletBalance, setWalletBalance] = useState(currentUser?.walletBalance || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const selectedCategory = categories.find((item) => item.id === categoryId);
  const backendCategoryById = {
    'CAT-RETAIL-AUDIT': 'RETAIL_AUDIT',
    'CAT-ASSET-CHECK': 'ASSET_INSPECTION',
    'CAT-ADDRESS-VERIFY': 'KYC_VERIFICATION',
  };
  const backendCategoryByGroup = {
    ERRAND: 'ERRAND', DELIVERY: 'DELIVERY', ASSIST: 'ERRAND', VERIFICATION: 'RETAIL_AUDIT',
  };

  // Tải số dư ví thực tế từ backend
  useEffect(() => {
    let isMounted = true;
    api.wallet.getMyWallet()
      .then((w) => {
        if (isMounted && w && typeof w.balance !== 'undefined') {
          setWalletBalance(Number(w.balance));
        }
      })
      .catch((err) => console.warn('Lỗi lấy ví người dùng:', err));

    return () => { isMounted = false; };
  }, [currentUser]);

  const handleAddChecklist = () => {
    setChecklist((prev) => [...prev, '']);
  };

  const handleUpdateChecklist = (index, value) => {
    setChecklist((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleRemoveChecklist = (index) => {
    setChecklist((prev) => prev.filter((_, i) => i !== index));
  };

  // Các thao tác quản lý Bộ câu hỏi khảo sát (Option không bắt buộc)
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: `q_${Date.now()}`, title: '', type: 'YES_NO' },
    ]);
  };

  const handleUpdateQuestion = (index, field, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate số dư, thù lao, deadline
  const isRewardValid = Number(reward) >= 10000;
  const isDeadlineValid = Number(deadlineHours) >= 1;
  const isBalanceEnough = walletBalance >= Number(reward);
  const canSubmit = title.trim() && description.trim() && location.trim() && isRewardValid && isDeadlineValid && isBalanceEnough;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!isBalanceEnough) {
      setSubmitError(`Số dư ví khả dụng (${formatVnd(walletBalance)}) không đủ để ký quỹ ${formatVnd(reward)}. Vui lòng nạp thêm tiền vào ví.`);
      return;
    }
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const activeChecklist = checklist.filter((c) => c.trim().length > 0).map((c) => ({ title: c }));
      const activeQuestions = questions
        .filter((q) => q.title && q.title.trim().length > 0)
        .map((q, idx) => ({
          id: q.id || `q_${idx + 1}`,
          title: q.title.trim(),
          type: q.type || 'YES_NO',
        }));

      await api.tasks.create({
        title: title.trim(),
        description: description.trim(),
        category: backendCategoryById[categoryId] || backendCategoryByGroup[selectedCategory?.group] || 'ERRAND',
        address: location.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        rewardAmount: Number(reward),
        instructions: instructions.trim(),
        checklistRequirementsJson: JSON.stringify(activeChecklist.length > 0 ? activeChecklist : [{ title: 'Kiểm tra hiện trạng thực tế' }]),
        questionsJson: activeQuestions.length > 0 ? JSON.stringify(activeQuestions) : null,
        deadline: new Date(Date.now() + Number(deadlineHours) * 60 * 60 * 1000).toISOString(),
      });
      router.push('/client/campaigns');
    } catch (err) {
      console.error('Lỗi tạo nhiệm vụ:', err);
      setSubmitError(err.message || 'Không thể tạo nhiệm vụ. Vui lòng kiểm tra kết nối.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-accent-quiet">
          KÝ QUỸ BẢO ĐẢM
        </span>
        <h1 className="font-display text-2xl font-bold text-ink-900 mt-2">
          Đăng nhiệm vụ thực địa mới
        </h1>
        <p className="text-xs text-ink-500 mt-1">
          Thiết lập tiêu đề, tọa độ GPS thực địa, hướng dẫn và checklist yêu cầu. Tiền thù lao sẽ được tạm giữ tự động trong quỹ Escrow.
        </p>
      </div>

      {/* Cảnh báo số dư ví */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
        isBalanceEnough 
          ? 'bg-paper-100 border-rule-subtle text-ink-700' 
          : 'bg-danger/10 border-danger/30 text-danger'
      }`}>
        <div className="flex items-center gap-2.5">
          <Wallet className="w-4 h-4 flex-shrink-0" />
          <span>
            Số dư khả dụng hiện tại: <strong className="font-mono text-sm font-bold">{formatVnd(walletBalance)}</strong>
          </span>
        </div>
        {!isBalanceEnough && (
          <span className="font-bold flex items-center gap-1 text-[11px]">
            <AlertCircle className="w-3.5 h-3.5" /> Không đủ ký quỹ
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-float bg-paper-000 p-6 sm:p-7 rounded-[24px] border border-rule-strong space-y-6">
          
          {/* Tiêu đề nhiệm vụ */}
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1.5">
              Tiêu đề nhiệm vụ <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Kiểm tra biển hiệu & bảng giá nhà thuốc Cầu Giấy"
              className="w-full px-4 py-2.5 bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-sm font-medium text-ink-900 focus:outline-none"
            />
          </div>

          {/* Mô tả chi tiết */}
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1.5">
              Mô tả chi tiết công việc <span className="text-danger">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả cụ thể mục tiêu khảo sát, yêu cầu cần làm tại thực địa..."
              className="w-full px-4 py-3 bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-sm font-medium text-ink-900 focus:outline-none resize-none"
            />
          </div>

          {/* Phân loại danh mục */}
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1.5">
              Danh mục nhiệm vụ
            </label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-sm font-semibold text-ink-900 focus:outline-none"
              >
                {groups.map((group) => (
                  <optgroup key={group} label={CATEGORY_GROUP_LABEL[group] || group}>
                    {categories
                      .filter((c) => c.group === group)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-ink-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Địa chỉ thực hiện & Bản đồ chọn vị trí với gợi ý tìm kiếm */}
          <AddressMapSelector
            address={location}
            latitude={latitude}
            longitude={longitude}
            onChange={({ address, latitude: newLat, longitude: newLng }) => {
              setLocation(address);
              setLatitude(newLat);
              setLongitude(newLng);
            }}
            required
          />

          {/* Thù lao & Thời hạn */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-7">
              <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                Thù lao chi trả (VNĐ) <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <Coins className="w-4 h-4 text-ink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step={5000}
                  min={10000}
                  required
                  value={reward}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setReward(clean === '' ? 0 : Number(clean));
                  }}
                  className="w-full pl-10 pr-14 py-2.5 bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-sm font-mono font-bold text-ink-900 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-accent">
                  VNĐ
                </span>
              </div>
              {!isRewardValid && (
                <p className="text-[11px] text-danger font-medium mt-1">
                  Thù lao tối thiểu phải từ 10.000 VNĐ trở lên.
                </p>
              )}
            </div>

            <div className="col-span-12 sm:col-span-5">
              <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                Thời hạn hoàn thành (Giờ) <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-ink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={1}
                  max={168}
                  required
                  value={deadlineHours}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setDeadlineHours(clean === '' ? 0 : Number(clean));
                  }}
                  className="w-full pl-10 pr-14 py-2.5 bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-sm font-mono font-bold text-ink-900 focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-500">
                  Giờ
                </span>
              </div>
              {!isDeadlineValid && (
                <p className="text-[11px] text-danger font-medium mt-1">
                  Thời hạn hoàn thành tối thiểu phải từ 1 giờ trở lên.
                </p>
              )}
            </div>
          </div>

          {/* Hướng dẫn thực hiện */}
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-accent" />
              Hướng dẫn thực hiện cho Người nhận việc
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ghi chú cụ thể các lưu ý khi tới điểm khảo sát..."
              className="w-full px-4 py-2.5 bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-xs font-medium text-ink-900 focus:outline-none resize-none"
            />
          </div>

          {/* Danh sách Checklist yêu cầu */}
          <div className="border-t border-rule-subtle pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-accent" />
                Checklist các mục bắt buộc người nhận việc phải tick &amp; chụp ảnh
              </label>
              <button
                type="button"
                onClick={handleAddChecklist}
                className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm mục
              </button>
            </div>

            <div className="space-y-2">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-paper-200 text-ink-700 text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleUpdateChecklist(idx, e.target.value)}
                    placeholder={`Yêu cầu kiểm tra mục ${idx + 1}...`}
                    className="flex-1 px-3.5 py-2 bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-xs font-medium text-ink-900 focus:outline-none"
                  />
                  {checklist.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklist(idx)}
                      className="p-1.5 text-ink-500 hover:text-danger rounded-lg transition-colors"
                      aria-label="Xóa mục checklist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bộ câu hỏi khảo sát thực địa (Option tùy chọn - không bắt buộc) */}
          <div className="border-t border-rule-subtle pt-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-ink-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-accent" />
                  <span>Bộ câu hỏi khảo sát hiện trường</span>
                  <span className="font-mono text-[10px] font-bold text-accent bg-accent/15 px-2 py-0.5 rounded-full">
                    Tùy chọn
                  </span>
                </label>
                <p className="text-[11px] text-ink-500 mt-0.5">
                  Thêm câu hỏi cần Người nhận việc trả lời tại thực địa (ví dụ: tình trạng mở cửa, số lượng, giá cả...).
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 text-xs font-bold transition-colors shadow-[0_2px_8px_oklch(0_0_0/0.04)]"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm câu hỏi
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-rule-subtle bg-paper-100/50 p-4 text-center">
                <p className="text-xs text-ink-500 font-medium">
                  Chưa có câu hỏi khảo sát nào. Nếu không cần thu thập câu trả lời cụ thể, bạn có thể bỏ qua phần này.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-2xl border border-rule-subtle bg-paper-100"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-paper-200 text-ink-700 text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={q.title}
                        onChange={(e) => handleUpdateQuestion(idx, 'title', e.target.value)}
                        placeholder="VD: Cửa hàng có đang mở cửa hoạt động không?..."
                        className="flex-1 px-3.5 py-2 bg-paper-000 border border-rule-subtle focus:border-accent rounded-xl text-xs font-medium text-ink-900 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pl-7 sm:pl-0">
                      <select
                        value={q.type || 'YES_NO'}
                        onChange={(e) => handleUpdateQuestion(idx, 'type', e.target.value)}
                        className="px-3 py-2 bg-paper-000 border border-rule-subtle focus:border-accent rounded-xl text-xs font-semibold text-ink-900 focus:outline-none"
                      >
                        <option value="YES_NO">Có / Không</option>
                        <option value="TEXT">Trả lời chữ</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="p-2 text-ink-500 hover:text-danger rounded-xl hover:bg-paper-200 transition-colors"
                        title="Xoá câu hỏi này"
                        aria-label="Xoá câu hỏi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tổng kết Ký quỹ Escrow (Theo đúng chuẩn BRD 100%) */}
          <div className="p-4 bg-paper-100 rounded-2xl border border-rule-subtle space-y-2 text-xs">
            <div className="flex justify-between text-ink-700">
              <span>Thù lao người nhận việc (Worker):</span>
              <span className="font-mono font-bold text-ink-900">{formatVnd(reward)}</span>
            </div>
            <div className="flex justify-between text-ink-700">
              <span>Phí dịch vụ trung gian:</span>
              <span className="font-mono text-accent font-bold">0 VNĐ (Miễn phí)</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-rule-subtle items-center">
              <span className="font-bold text-ink-900">Tổng tiền tạm giữ ký quỹ (Escrow):</span>
              <span className="font-display text-base font-bold text-accent">
                {formatVnd(reward)}
              </span>
            </div>
          </div>

          {submitError && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}
        </div>

        {/* Nút bấm Đăng nhiệm vụ */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="flex-1 px-6 py-3.5 rounded-xl font-display font-bold text-sm bg-accent hover:bg-accent-hover text-paper-000 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-button"
          >
            {isSubmitting ? (
              <span>Đang xác thực &amp; ký quỹ nhiệm vụ...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Xác nhận Đăng việc &amp; Ký quỹ {formatVnd(reward)}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
