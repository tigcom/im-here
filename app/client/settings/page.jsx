'use client';

import { useState } from 'react';
import { Building2, Shield, User, Webhook, Save, KeyRound } from 'lucide-react';

import { useAuth } from '@/components/auth/AuthContext';
import { getUserById } from '@/lib/data';
import { HIRER_TYPE } from '@/lib/constants';

export default function ClientSettingsPage() {
  const { currentUser } = useAuth();
  const user = currentUser || getUserById('USR-CL-8803');
  const isOrg = user?.hirerType === HIRER_TYPE.ORGANIZATION;
  const org = user?.organization;

  const [saved, setSaved] = useState(false);
  const [keyNotice, setKeyNotice] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRotateKey = () => {
    setKeyNotice('Tính năng đổi khóa hiện chưa khả dụng.');
    setTimeout(() => setKeyNotice(''), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Cài đặt hồ sơ &amp; tích hợp</h1>
        <p className="text-xs text-ink-500 mt-1">
          {isOrg
            ? 'Quản lý thông tin doanh nghiệp và khoá kết nối tích hợp.'
            : 'Quản lý thông tin cá nhân của bạn.'}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hồ sơ người đăng */}
        <div className="card-float bg-paper-000 p-6 rounded-[24px] border border-rule-subtle space-y-4">
          <div className="flex items-center gap-2 border-b border-rule-subtle pb-3">
            {isOrg ? (
              <Building2 className="w-4 h-4 text-accent" />
            ) : (
              <User className="w-4 h-4 text-accent" />
            )}
            <h2 className="font-display text-sm font-bold text-ink-900">
              {isOrg ? 'Thông tin doanh nghiệp' : 'Thông tin cá nhân'}
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {isOrg ? (
              <>
                <div>
                  <label className="block font-semibold text-ink-700 mb-1">
                    Tên công ty đăng ký kinh doanh
                  </label>
                  <input
                    type="text"
                    defaultValue={org?.name || ''}
                    className="w-full px-3.5 py-2.5 bg-paper-100 rounded-xl border border-rule-subtle font-semibold text-ink-900"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block font-semibold text-ink-700 mb-1">
                      Mã số thuế doanh nghiệp
                    </label>
                    <input
                      type="text"
                      defaultValue={org?.taxId || ''}
                      className="w-full px-3.5 py-2.5 bg-paper-100 rounded-xl border border-rule-subtle font-mono font-semibold text-ink-900"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block font-semibold text-ink-700 mb-1">
                      Người đại diện
                    </label>
                    <input
                      type="text"
                      defaultValue={org?.representative || ''}
                      className="w-full px-3.5 py-2.5 bg-paper-100 rounded-xl border border-rule-subtle font-semibold text-ink-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-ink-700 mb-1">
                    Địa chỉ trụ sở
                  </label>
                  <input
                    type="text"
                    defaultValue={org?.address || ''}
                    className="w-full px-3.5 py-2.5 bg-paper-100 rounded-xl border border-rule-subtle font-semibold text-ink-900"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block font-semibold text-ink-700 mb-1">Họ và tên</label>
                    <input
                      type="text"
                      defaultValue={user?.name || ''}
                      className="w-full px-3.5 py-2.5 bg-paper-100 rounded-xl border border-rule-subtle font-semibold text-ink-900"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block font-semibold text-ink-700 mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      defaultValue={user?.phone || ''}
                      className="w-full px-3.5 py-2.5 bg-paper-100 rounded-xl border border-rule-subtle font-mono font-semibold text-ink-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-ink-700 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    className="w-full px-3.5 py-2.5 bg-paper-100 rounded-xl border border-rule-subtle font-semibold text-ink-900"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Webhook & tích hợp */}
        <div className="card-float bg-paper-000 p-6 rounded-[24px] border border-rule-subtle space-y-4">
          <div className="flex items-center gap-2 border-b border-rule-subtle pb-3">
            <Webhook className="w-4 h-4 text-accent-blue" />
            <h2 className="font-display text-sm font-bold text-ink-900">
              Webhook &amp; tích hợp hệ thống
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-ink-700 mb-1">
                Địa chỉ nhận thông báo về nhiệm vụ
              </label>
              <input
                type="url"
                defaultValue={org?.webhookUrl || ''}
                placeholder="https://api.example.com/hooks/imhere"
                className="w-full px-3.5 py-2.5 bg-paper-100 rounded-xl border border-rule-subtle font-mono text-ink-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink-700 mb-1">
                Khóa xác thực webhook
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 bg-paper-100 rounded-xl border border-rule-subtle font-mono text-ink-900">
                  <Shield className="w-3.5 h-3.5 text-ink-500" />
                  <span className="tracking-widest">••••••••</span>
                </div>
                <button
                  type="button"
                  onClick={handleRotateKey}
                  className="px-3.5 py-2.5 rounded-xl border border-rule-subtle hover:border-accent text-xs font-bold text-ink-700 hover:text-accent transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Đổi khoá</span>
                </button>
              </div>
              <p className="text-[11px] text-ink-500 mt-1">
                Khóa xác thực được ẩn trong giao diện để bảo vệ tài khoản.
              </p>
              {keyNotice && (
                <p className="text-[11px] text-accent font-semibold mt-1">{keyNotice}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl font-display font-bold text-xs bg-accent hover:bg-accent-hover text-paper-000 flex items-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{saved ? 'Đã lưu thay đổi!' : 'Lưu cài đặt'}</span>
        </button>
      </form>
    </div>
  );
}
