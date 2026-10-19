'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { ROLE } from '@/lib/constants';
import {
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  MapPin,
  PlusCircle
} from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithBackend, switchAppMode } = useAuth();

  // Chế độ lựa chọn sau đăng nhập thành công cho User
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Tab phương thức: 'password' (SĐT/Email + Mật khẩu) hoặc 'otp' (SĐT + OTP)
  const [authMethod, setAuthMethod] = useState('password'); 

  // Form fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP flow states
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Xử lý gửi OTP
  const handleRequestOtp = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!identifier.trim()) {
      setErrorMessage('Vui lòng nhập số điện thoại để nhận mã xác thực.');
      return;
    }

    setErrorMessage('Đăng nhập OTP chưa được tích hợp với nhà cung cấp xác thực. Vui lòng dùng mật khẩu.');
  };

  // Xử lý đăng nhập
  const handlePerformLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (authMethod === 'password') {
      if (!identifier.trim()) {
        setErrorMessage('Vui lòng nhập số điện thoại hoặc email.');
        return;
      }
      if (!password) {
        setErrorMessage('Vui lòng nhập mật khẩu.');
        return;
      }
    } else {
      const code = otpDigits.join('');
      if (code.length < 6) {
        setErrorMessage('Vui lòng nhập đủ 6 chữ số mã OTP.');
        return;
      }
    }

    setIsLoading(true);

    const handlePostLoginSuccess = (user, role) => {
      if (role === ROLE.ADMIN) {
        router.push('/admin/dashboard');
        return;
      }

      const redirectParam = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect')
        : null;

      if (redirectParam) {
        if (redirectParam.startsWith('/looker')) {
          switchAppMode('doer');
        } else if (redirectParam.startsWith('/client')) {
          switchAppMode('hirer');
        }
        router.push(redirectParam);
        return;
      }

      setLoggedInUser(user);
      setShowModeSelection(true);
    };

    try {
      if (authMethod === 'password') {
        // Đăng nhập trực tiếp qua Backend Java Spring Boot (hỗ trợ cả Email & SĐT)
        const { user, role } = await loginWithBackend(identifier.trim(), password);
        setIsLoading(false);
        handlePostLoginSuccess(user, role);
        return;
      } else {
        setIsLoading(false);
        setErrorMessage('Đăng nhập OTP chưa khả dụng. Vui lòng chọn đăng nhập bằng mật khẩu.');
        return;
      }
    } catch (err) {
      console.warn('Backend login attempt failed:', err.message);
      if (err.message && (err.message.includes('chính xác') || err.message.includes('mật khẩu') || err.message.includes('tạm khóa'))) {
        setIsLoading(false);
        setErrorMessage(err.message);
        return;
      }
    }

    setIsLoading(false);
    setErrorMessage('Không thể đăng nhập. Vui lòng kiểm tra thông tin hoặc kết nối máy chủ.');
  };

  const handleOtpInput = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Tự động nhảy ô tiếp theo
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className="min-h-dvh flex flex-col justify-center items-center bg-paper-100 px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] emerald-glow pointer-events-none opacity-25" />

      <div className="w-full max-w-[440px] z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <img
              src="/android-chrome-192x192.png"
              alt="Im-Here Logo"
              className="h-10 w-10 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="font-display text-2xl font-bold tracking-tight text-ink-900">
              Im-Here<span className="text-accent">.</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-ink-900 tracking-tight">
            {showModeSelection ? 'Chọn không gian làm việc' : 'Đăng nhập tài khoản'}
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 mt-1.5 leading-relaxed">
            {showModeSelection
              ? 'Nền tảng đa năng: 1 tài khoản vừa thuê vừa nhận việc'
              : 'Nền tảng kết nối việc làm và thuê nhân lực linh hoạt'}
          </p>
        </div>

        {showModeSelection ? (
          /* Card Lựa chọn Chế độ cho User */
          <div className="card-float bg-paper-000 p-6 sm:p-8 rounded-[24px] border border-rule-strong shadow-[0_12px_36px_oklch(0_0_0/0.06)]">
            <div className="text-center mb-6">
              <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-accent-quiet inline-block mb-2">
                ĐĂNG NHẬP THÀNH CÔNG
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-900">
                Xin chào, {loggedInUser?.fullName || 'bạn'}!
              </h2>
              <p className="text-xs text-ink-500 mt-1 leading-relaxed">
                Hôm nay bạn muốn tham gia nền tảng ở chế độ nào?
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {/* Option 1: Nhận việc (Doer / Looker) */}
              <button
                type="button"
                onClick={() => {
                  switchAppMode('doer');
                  router.push('/looker');
                }}
                className="w-full text-left p-4 sm:p-5 rounded-2xl border border-rule-subtle bg-paper-100 hover:bg-paper-200 hover:border-accent transition-[border-color,background-color,transform] hover:-translate-y-0.5 group flex items-start gap-3.5"
              >
                <div className="w-11 h-11 rounded-xl bg-accent-quiet text-accent flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold text-ink-900 group-hover:text-accent">
                      Vào Nhận Việc (Kiếm Tiền)
                    </h3>
                    <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-accent group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-xs text-ink-500 mt-1 leading-relaxed">
                    Bật GPS quét các nhiệm vụ gần bạn (đi chợ, xếp hàng, kiểm tra thực địa), nộp kết quả nhận thù lao vào ví.
                  </p>
                </div>
              </button>

              {/* Option 2: Đăng việc (Hirer / Client) */}
              <button
                type="button"
                onClick={() => {
                  switchAppMode('hirer');
                  router.push('/client/dashboard');
                }}
                className="w-full text-left p-4 sm:p-5 rounded-2xl border border-rule-subtle bg-paper-100 hover:bg-paper-200 hover:border-accent-blue transition-[border-color,background-color,transform] hover:-translate-y-0.5 group flex items-start gap-3.5"
              >
                <div className="w-11 h-11 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold text-ink-900 group-hover:text-accent-blue">
                      Vào Đăng Việc (Thuê Người)
                    </h3>
                    <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-accent-blue group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-xs text-ink-500 mt-1 leading-relaxed">
                    Tạo nhiệm vụ nhờ người hỗ trợ, quản lý tiến độ thực hiện và nghiệm thu báo cáo công việc.
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-rule-subtle flex items-center justify-between text-[11px] text-ink-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>Chung 1 tài khoản &amp; 1 ví tiền</span>
              </span>
              <button
                type="button"
                onClick={() => setShowModeSelection(false)}
                className="font-semibold text-accent hover:underline"
              >
                Đổi tài khoản
              </button>
            </div>
          </div>
        ) : (
          /* Card Đăng nhập */
          <div className="card-float bg-paper-000 p-6 sm:p-8 rounded-[24px] border border-rule-strong shadow-[0_12px_36px_oklch(0_0_0/0.06)]">
          {/* Tabs phương thức đăng nhập */}
          <div className="flex rounded-xl bg-paper-100 p-1 mb-6 border border-rule-subtle">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('password');
                setOtpSent(false);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-[color,background-color] ${
                authMethod === 'password'
                  ? 'bg-paper-000 text-ink-900 border border-rule-subtle'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              Mật khẩu
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('otp');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-[color,background-color] ${
                authMethod === 'otp'
                  ? 'bg-paper-000 text-ink-900 border border-rule-subtle'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              Mã xác thực OTP
            </button>
          </div>

          {/* Thông báo lỗi nếu có */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-2.5 text-xs text-danger">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form theo mật khẩu */}
          {authMethod === 'password' && (
            <form method="post" action="#" onSubmit={handlePerformLogin} autoComplete="on" className="space-y-4">
              <div>
                <label htmlFor="login-username" className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Số điện thoại hoặc Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-500">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Nhập SĐT hoặc email đã đăng ký"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-sm font-medium text-ink-900 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-xs font-semibold text-ink-700">
                    Mật khẩu
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setAuthMethod('otp');
                    }}
                    className="text-[11px] font-semibold text-accent hover:underline"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-sm font-medium text-ink-900 focus:outline-none transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-500 hover:text-ink-900"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="remember-me"
                    name="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-rule-subtle text-accent focus:ring-accent"
                  />
                  <span className="text-xs text-ink-700 font-medium">Ghi nhớ mật khẩu & đăng nhập</span>
                </label>
                {rememberMe && identifier && (
                  <span className="text-[10px] text-accent font-mono font-semibold">✓ Đã bật lưu</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-display font-bold text-sm bg-accent hover:bg-accent-hover text-paper-000 flex items-center justify-center gap-2 transition-[background-color,transform,opacity] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="xs" color="white" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form theo OTP */}
          {authMethod === 'otp' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                      Số điện thoại nhận mã
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-500">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Nhập số điện thoại (VD: 0908 123 456)"
                        className="w-full pl-10 pr-4 py-3 bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-sm font-medium text-ink-900 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-ink-500 mt-1.5">
                      Hệ thống sẽ gửi mã xác thực gồm 6 chữ số đến số điện thoại này.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3.5 px-4 rounded-xl font-display font-bold text-sm bg-accent hover:bg-accent-hover text-paper-000 flex items-center justify-center gap-2 transition-[background-color,transform,opacity] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="xs" color="white" />
                        <span>Đang gửi mã...</span>
                      </>
                    ) : (
                      <>
                        <span>Gửi mã xác thực</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePerformLogin} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-ink-700">
                        Nhập mã xác thực gửi tới <span className="font-mono text-ink-900 font-bold">{identifier}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] font-semibold text-accent hover:underline"
                      >
                        Đổi số
                      </button>
                    </div>

                    <div className="grid grid-cols-6 gap-2 my-3">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpInput(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-full h-12 text-center font-mono font-bold text-lg bg-paper-100 border border-rule-subtle focus:border-accent rounded-xl text-ink-900 focus:outline-none"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-ink-500 mt-2">
                      <span>Không nhận được mã?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpDigits(['', '', '', '', '', '']);
                          handleRequestOtp(new Event('submit'));
                        }}
                        className="font-semibold text-accent hover:underline"
                      >
                        Gửi lại mã
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3.5 px-4 rounded-xl font-display font-bold text-sm bg-accent hover:bg-accent-hover text-paper-000 flex items-center justify-center gap-2 transition-[background-color,transform,opacity] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="xs" color="white" />
                        <span>Đang kiểm tra...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Xác nhận & Đăng nhập</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Cam kết bảo mật */}
          <div className="mt-5 pt-4 border-t border-rule-subtle flex items-center justify-center gap-2 text-[11px] text-ink-500">
            <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
            <span>Dữ liệu đăng nhập được mã hóa an toàn</span>
          </div>
        </div>
      )}

      {/* Footer điều hướng đăng ký (chỉ hiện khi đang ở form đăng nhập) */}
      {!showModeSelection && (
        <div className="text-center mt-6 text-xs text-ink-500">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-bold text-accent hover:underline">
            Đăng ký tài khoản mới
          </Link>
          {' '}·{' '}
          <Link href="/" className="font-medium text-ink-700 hover:underline">
            Trang chủ
          </Link>
        </div>
      )}
      </div>
    </div>
  );
}
