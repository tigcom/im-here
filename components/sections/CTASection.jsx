'use client';

import ActionButton from '../ActionButton';
import { useAuth } from '@/components/auth/AuthContext';

export default function CTASection() {
  const { currentUser } = useAuth();

  return (
    <section
      id="bat-dau"
      className="relative bg-paper-000 px-[6vw] py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="panel-cta-gradient overflow-hidden p-8 md:p-14 text-paper-000">
          <div className="grid grid-cols-12 gap-y-10 lg:gap-x-12 items-center">
            {/* 7 CỘT: TIÊU ĐỀ & CTA HAI PHÍA */}
            <div className="col-span-12 lg:col-span-7">
              <span className="label font-semibold text-paper-000/90 block">
                05 — BẮT ĐẦU
              </span>

              <h2 className="display-lg mt-3 font-bold text-paper-000">
                Thử một việc ngay hôm nay.
              </h2>

              <p className="body-md mt-4 text-paper-000/90 max-w-[560px]">
                Dù bạn đang cần người giúp hay đang rảnh muốn kiếm thêm — Im-Here lo
                phần còn lại. Tạo tin hoặc nhận việc chỉ trong vài phút.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <ActionButton
                  variant="primary"
                  onClick={() => {
                    if (!currentUser) {
                      window.location.href = '/login?redirect=/client/campaigns/new';
                    } else {
                      window.location.href = '/client/campaigns/new';
                    }
                  }}
                >
                  Đăng tin thuê người
                </ActionButton>
                <ActionButton
                  variant="ghost"
                  onClick={() => {
                    if (!currentUser) {
                      window.location.href = '/login?redirect=/looker';
                    } else {
                      window.location.href = '/looker';
                    }
                  }}
                >
                  Nhận việc kiếm tiền
                </ActionButton>
              </div>
            </div>

            {/* 5 CỘT: THẺ HAI PHÍA */}
            <div className="col-span-12 lg:col-span-5">
              <div className="card-float p-7 text-ink-900">
                <span className="label text-accent font-semibold">HAI PHÍA CỦA CHỢ</span>
                <div className="mt-5 space-y-5">
                  <div className="border-l-2 border-accent pl-4">
                    <h3 className="font-display text-base font-bold text-ink-900">
                      Bạn cần thuê người
                    </h3>
                    <p className="text-xs text-ink-500 mt-1">
                      Đăng việc, chọn người phù hợp, xác nhận khi xong.
                    </p>
                  </div>
                  <div className="border-l-2 border-accent-blue pl-4">
                    <h3 className="font-display text-base font-bold text-ink-900">
                      Bạn muốn nhận việc
                    </h3>
                    <p className="text-xs text-ink-500 mt-1">
                      Tìm việc gần bạn, làm theo lúc rảnh, nhận tiền vào ví.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
