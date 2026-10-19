'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { ROLE } from '@/lib/constants';
import { 
  UserCheck, 
  Building2, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Smartphone, 
  RotateCcw,
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { switchRole, switchAppMode, registerWithBackend } = useAuth();
  const [initialMode, setInitialMode] = useState('doer'); // doer | hirer
  
  // Bước đăng ký: 1 = Nhập thông tin, 2 = Xác thực OTP số điện thoại
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    companyName: '',
    taxId: '',
    province: 'Hà Nội'
  });

  // State OTP
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Đếm ngược 60s cho OTP
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Focus ô đầu tiên khi vào bước 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Bước 1: Gửi yêu cầu nhận mã OTP
  const handleProceedToOtp = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!form.fullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên.');
      return;
    }
    const cleanPhone = form.phone.trim().replace(/\s+/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Số điện thoại không hợp lệ (tối thiểu 10 chữ số).');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setErrorMessage('Địa chỉ email không hợp lệ.');
      return;
    }
    if (form.password.length < 6) {
      setErrorMessage('Mật khẩu phải có độ dài từ 6 ký tự trở lên.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setCountdown(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
    }, 400);
  };

  // Xử lý nhập 6 ô OTP
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];

    if (cleanVal.length > 1) {
      // Trường hợp dán cả chuỗi 6 số
      const pasted = cleanVal.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    setErrorMessage('');

    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setCountdown(60);
    setCanResend(false);
    setOtpDigits(['', '', '', '', '', '']);
    setErrorMessage('');
    otpInputRefs.current[0]?.focus();
  };

  // Bước 2: Xác nhận OTP & Hoàn tất đăng ký
  const handleVerifyOtpAndRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const enteredOtp = otpDigits.join('').trim();
    if (enteredOtp.length < 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã xác thực OTP.');
      return;
    }

    // YÊU CẦU: Mock xác nhận 111111 đúng mới vào app
    if (enteredOtp !== '111111') {
      setErrorMessage('Mã OTP không chính xác. Vui lòng nhập đúng mã OTP xác thực thử nghiệm: 111111');
      return;
    }

    setIsLoading(true);
    try {
      const role = initialMode === 'hirer' ? 'ROLE_CLIENT' : 'ROLE_SHEPHERD';
      
      if (registerWithBackend) {
        await registerWithBackend({
          email: form.email.trim(),
          password: form.password,
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          role: role
        });
      } else {
        await api.auth.register({
          email: form.email.trim(),
          password: form.password,
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          role: role
        });
      }

      setIsSuccess(true);
      switchRole(ROLE.USER);
      switchAppMode(initialMode);

      // YÊU CẦU: Sau khi đăng ký xong phải xác thực hồ sơ (KYC Gate)
      setTimeout(() => {
        if (initialMode === 'doer') {
          router.push('/looker/onboarding'); // Chuyển thẳng vào nộp hồ sơ CCCD
        } else {
          router.push('/client/dashboard'); // Vào portal Client (nơi có KYC Gate bắt buộc)
        }
      }, 700);
    } catch (err) {
      console.error('Lỗi đăng ký:', err);
      setErrorMessage(err.message || 'Đăng ký tài khoản không thành công. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col justify-center items-center bg-paper-100 px-4 py-12 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] emerald-glow pointer-events-none opacity-25" />

      <div className="w-full max-w-[500px] z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <img src="/android-chrome-192x192.png" alt="Logo" className="w-9 h-9" />
            <span className="font-display text-2xl font-bold text-ink-900">
              Im-Here<span className="text-accent">.</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            {step === 1 ? 'Tạo Tài Khoản Người Dùng' : 'Xác Thực Số Điện Thoại'}
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            {step === 1
              ? 'Một tài khoản đa năng duy nhất — Vừa Nhận Việc vừa Đăng Việc linh hoạt'
              : `Mã OTP đã được gửi đến số điện thoại ${form.phone || 'của bạn'}`}
          </p>
        </div>

        <div className="card-float bg-paper-000 p-6 sm:p-8 rounded-[24px] border border-rule-strong shadow-[0_12px_36px_oklch(0_0_0/0.06)]">
          {step === 1 ? (
            /* BƯỚC 1: NHẬP THÔNG TIN TÀI KHOẢN */
            <>
              <div className="mb-2">
                <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wider block mb-2">
                  Bạn muốn bắt đầu bằng vai trò nào?
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setInitialMode('doer')}
                  className={`flex-1 p-4 rounded-2xl border text-left transition-colors ${
                    initialMode === 'doer'
                      ? 'border-accent bg-accent-quiet/40 ring-1 ring-accent'
                      : 'border-rule-subtle bg-paper-100 hover:bg-paper-200'
                  }`}
                >
                  <UserCheck className={`w-5 h-5 mb-2 ${initialMode === 'doer' ? 'text-accent' : 'text-ink-500'}`} />
                  <div className="text-xs font-bold text-ink-900">Nhận Việc Kiếm Tiền</div>
                  <div className="text-[11px] text-ink-500 mt-0.5">Làm nhiệm vụ thực địa quanh GPS</div>
                </button>
                <button
                  type="button"
                  onClick={() => setInitialMode('hirer')}
                  className={`flex-1 p-4 rounded-2xl border text-left transition-colors ${
                    initialMode === 'hirer'
                      ? 'border-accent-blue bg-accent-blue/10 ring-1 ring-accent-blue'
                      : 'border-rule-subtle bg-paper-100 hover:bg-paper-200'
                  }`}
                >
                  <Building2 className={`w-5 h-5 mb-2 ${initialMode === 'hirer' ? 'text-accent-blue' : 'text-ink-500'}`} />
                  <div className="text-xs font-bold text-ink-900">Đăng Việc Thuê Người</div>
                  <div className="text-[11px] text-ink-500 mt-0.5">Nhờ người đi chợ, kiểm tra, chụp ảnh</div>
                </button>
              </div>

              <form onSubmit={handleProceedToOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                    Họ và tên người dùng / Đại diện *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Trần Hoàng Nam"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-sm font-semibold text-ink-900 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                      Số điện thoại nhận OTP *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0912 345 678"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-sm font-semibold text-ink-900 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                      Email đăng nhập *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@vidu.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-sm font-semibold text-ink-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                    Mật khẩu đăng nhập *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Tối thiểu 6 ký tự (VD: MatKhau@123)"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-sm font-semibold text-ink-900 focus:outline-none"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-display font-bold text-sm bg-accent hover:bg-accent-hover text-paper-000 flex items-center justify-center gap-2 transition-colors hover:scale-[1.01] active:scale-[0.99] mt-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="xs" color="white" />
                      <span>Đang gửi mã OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Tiếp Tục — Nhận Mã OTP Xác Thực SĐT</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* BƯỚC 2: XÁC THỰC MÃ OTP QUA SỐ ĐIỆN THOẠI */
            <div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent-quiet text-accent flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="w-7 h-7" />
                </div>
                <h2 className="font-display text-lg font-bold text-ink-900">
                  Nhập Mã Xác Thực OTP
                </h2>
                <p className="text-xs text-ink-500 mt-1">
                  Mã OTP 6 chữ số đã được gửi đến số điện thoại:
                </p>
                <div className="font-mono text-sm font-bold text-ink-900 mt-0.5">
                  {form.phone}
                </div>

                {/* Hướng dẫn mã mock 111111 theo yêu cầu */}
                <div className="mt-3.5 p-3 rounded-xl bg-accent-quiet/80 border border-accent/30 text-accent text-xs flex items-center justify-center gap-2 font-medium">
                  <KeyRound className="w-4 h-4 shrink-0" />
                  <span>Mã OTP thử nghiệm hệ thống: <strong className="font-mono font-bold tracking-wider text-sm">111111</strong></span>
                </div>
              </div>

              <form onSubmit={handleVerifyOtpAndRegister} className="space-y-5">
                {/* 6 ô nhập mã OTP */}
                <div>
                  <div className="flex justify-between items-center gap-2 max-w-[340px] mx-auto">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-display text-2xl font-bold rounded-xl border-2 transition-[border-color,background-color] focus:outline-none ${
                          digit
                            ? 'border-accent bg-accent-quiet/20 text-ink-900'
                            : 'border-rule-subtle bg-paper-100 text-ink-900 focus:border-accent'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-center mt-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpDigits(['1', '1', '1', '1', '1', '1']);
                        setErrorMessage('');
                      }}
                      className="text-[11px] text-accent hover:underline font-semibold"
                    >
                      ⚡ Nhập nhanh mã 111111
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-ink-500 pt-1">
                  <span>Chưa nhận được mã?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-bold text-accent hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Gửi lại mã OTP
                    </button>
                  ) : (
                    <span className="font-mono text-ink-400">
                      Gửi lại sau <strong className="text-accent">{countdown}s</strong>
                    </span>
                  )}
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrorMessage('');
                    }}
                    className="py-3 px-4 rounded-xl border border-rule-subtle text-xs font-bold text-ink-700 hover:bg-paper-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Đổi SĐT</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || isSuccess}
                    className="flex-1 py-3 px-4 rounded-xl font-display font-bold text-sm bg-accent hover:bg-accent-hover text-paper-000 flex items-center justify-center gap-2 transition-colors hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Đăng Ký Thành Công!</span>
                      </>
                    ) : isLoading ? (
                      <>
                        <LoadingSpinner size="xs" color="white" />
                        <span>Đang xác thực...</span>
                      </>
                    ) : (
                      <>
                        <span>Xác Nhận &amp; Vào Ứng Dụng</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-xs text-ink-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-bold text-accent hover:underline">
            Đăng nhập ngay
          </Link>
          {' '}·{' '}
          <Link href="/" className="font-medium text-ink-700 hover:underline">
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
