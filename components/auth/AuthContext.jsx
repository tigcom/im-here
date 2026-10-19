'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { USERS, DEMO_ACCOUNTS, getUserById } from '@/lib/data';
import { ROLE } from '@/lib/constants';
import api from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(ROLE.USER);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [appMode, setAppMode] = useState('doer'); // 'doer' (Nhận việc) | 'hirer' (Thuê việc)

  // Ánh xạ role backend sang role frontend (Chỉ có ROLE.ADMIN và ROLE.USER đa năng)
  const mapBackendRole = (beRole) => {
    if (beRole === 'ROLE_ADMIN') return ROLE.ADMIN;
    return ROLE.USER;
  };

  const toggleAppMode = () => {
    const nextMode = appMode === 'doer' ? 'hirer' : 'doer';
    setAppMode(nextMode);
    try {
      localStorage.setItem('imhere_app_mode', nextMode);
    } catch {}
    return nextMode;
  };

  const switchAppMode = (mode) => {
    setAppMode(mode);
    try {
      localStorage.setItem('imhere_app_mode', mode);
    } catch {}
  };

  // Định dạng đối tượng user từ API backend với dữ liệu thực tế
  const formatBackendUser = (me, mappedRole) => {
    const completed = me.completedTasksCount || 0;
    const total = me.totalAssignedTasks || 0;
    return {
      id: me.id,
      name: me.fullName,
      fullName: me.fullName,
      email: me.email,
      phone: me.phone || null,
      role: mappedRole,
      backendRole: me.role,
      kycStatus: me.kycStatus || 'CHUA_NOP',
      walletBalance: me.walletBalance || 0,
      bankName: me.bankName || null,
      bankAccountNumber: me.bankAccountNumber || null,
      bankAccountHolder: me.bankAccountHolder || null,
      rating: me.ratingScore ?? null,
      ratingScore: me.ratingScore ?? null,
      badgeTitle: me.badgeTitle || (completed > 0 ? 'LOOKER NỀN TẢNG' : 'THÀNH VIÊN MỚI'),
      workingArea: me.workingArea || 'Chưa cập nhật',
      stats: {
        completedCount: completed,
        totalAssignedTasks: total,
        approvalRate: me.completionRate ?? null,
        onTimeRate: null,
      },
    };
  };

  // Khôi phục phiên làm việc từ backend hoặc localStorage
  useEffect(() => {
    async function restoreSession() {
      try {
        const token = api.getToken();
        if (token) {
          try {
            const me = await api.auth.me();
            if (me) {
              const mappedRole = mapBackendRole(me.role);
              const userObj = formatBackendUser(me, mappedRole);
              setCurrentUser(userObj);
              setCurrentRole(mappedRole);
              setIsLoggedIn(true);
              setReady(true);
              return;
            }
          } catch (e) {
            console.warn('Backend session expired or unreachable, checking local demo session:', e.message);
            if (e.message && (e.message.includes('Chưa đăng nhập') || e.message.includes('401'))) {
              api.auth.logout();
            }
          }
        }

        // Fallback sang demo account nếu không có token backend
        const savedId = localStorage.getItem('imhere_user_id');
        const saved = savedId ? getUserById(savedId) : null;
        if (saved) {
          setCurrentUser(saved);
          setCurrentRole(saved.role);
          setIsLoggedIn(true);
        }
      } catch {
        // localStorage có thể bị chặn
      } finally {
        setReady(true);
      }
    }

    restoreSession();
  }, []);

  /** Đăng nhập trực tiếp với backend Java Spring Boot */
  const loginWithBackend = async (email, password) => {
    const authData = await api.auth.login(email, password);
    const mappedRole = mapBackendRole(authData.role);
    let userObj;
    try {
      const me = await api.auth.me();
      if (me) {
        userObj = formatBackendUser(me, mappedRole);
      }
    } catch {}

    if (!userObj) {
      userObj = {
        id: authData.id,
        name: authData.fullName,
        fullName: authData.fullName,
        email: authData.email,
        role: mappedRole,
        backendRole: authData.role,
        kycStatus: authData.kycStatus || 'CHUA_NOP',
        walletBalance: authData.walletBalance || 0,
        bankName: authData.bankName || null,
        bankAccountNumber: authData.bankAccountNumber || null,
        bankAccountHolder: authData.bankAccountHolder || null,
        rating: null,
        ratingScore: null,
        badgeTitle: 'THÀNH VIÊN MỚI',
        workingArea: 'Chưa cập nhật',
        stats: { completedCount: 0, totalAssignedTasks: 0, approvalRate: null, onTimeRate: null },
      };
    }

    setCurrentUser(userObj);
    setCurrentRole(mappedRole);
    setIsLoggedIn(true);
    try {
      localStorage.setItem('imhere_user_id', String(authData.id));
    } catch {}
    return { user: userObj, role: mappedRole };
  };

  /** Đăng ký tài khoản với backend */
  const registerWithBackend = async (payload) => {
    const authData = await api.auth.register(payload);
    const mappedRole = mapBackendRole(authData.role);
    // Tài khoản vừa tạo mới hoàn toàn: 0 việc, chưa có đánh giá, chưa có tỷ lệ xác nhận
    const userObj = {
      id: authData.id,
      name: authData.fullName,
      fullName: authData.fullName,
      email: authData.email,
      role: mappedRole,
      backendRole: authData.role,
      kycStatus: authData.kycStatus || 'CHUA_NOP',
      walletBalance: authData.walletBalance || 0,
      bankName: null,
      bankAccountNumber: null,
      bankAccountHolder: null,
      rating: null,
      ratingScore: null,
      badgeTitle: 'THÀNH VIÊN MỚI',
      workingArea: 'Chưa cập nhật',
      stats: {
        completedCount: 0,
        totalAssignedTasks: 0,
        approvalRate: null,
        onTimeRate: null,
      },
    };
    setCurrentUser(userObj);
    setCurrentRole(mappedRole);
    setIsLoggedIn(true);
    try {
      localStorage.setItem('imhere_user_id', String(authData.id));
    } catch {}
    return { user: userObj, role: mappedRole };
  };

  /** Chuyển vai trò demo */
  const switchRole = (role) => {
    const account = DEMO_ACCOUNTS[role];
    const user = account ? getUserById(account.userId) : null;
    if (!user) return;

    setCurrentRole(user.role);
    setCurrentUser(user);
    setIsLoggedIn(true);
    try {
      localStorage.setItem('imhere_user_id', user.id);
    } catch {}
  };

  /** Đăng nhập demo bằng id */
  const login = (userId) => {
    const user = getUserById(userId);
    if (!user) return;
    setCurrentRole(user.role);
    setCurrentUser(user);
    setIsLoggedIn(true);
    try {
      localStorage.setItem('imhere_user_id', user.id);
    } catch {}
  };

  const refreshUser = async () => {
    try {
      const me = await api.auth.me();
      if (me) {
        const mappedRole = mapBackendRole(me.role);
        const userObj = formatBackendUser(me, mappedRole);
        setCurrentUser(userObj);
        setCurrentRole(mappedRole);
        return userObj;
      }
    } catch (e) {
      console.warn('Lỗi refresh user:', e);
    }
  };

  const logout = () => {
    api.auth.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    try {
      localStorage.removeItem('imhere_user_id');
      localStorage.removeItem('imhere_jwt_token');
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        ready,
        currentRole,
        currentUser,
        isLoggedIn,
        appMode,
        toggleAppMode,
        switchAppMode,
        loginWithBackend,
        registerWithBackend,
        refreshUser,
        checkAuth: refreshUser,
        switchRole,
        login,
        logout,
        demoAccounts: DEMO_ACCOUNTS,
        usersList: USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Gọi ngoài Provider là lỗi lập trình. Trả về trạng thái CHƯA đăng nhập
    // thay vì giả vờ đã đăng nhập — để lỗi lộ ra thay vì bị che.
    console.warn('useAuth() được gọi ngoài <AuthProvider>');
    return {
      ready: true,
      currentRole: null,
      currentUser: null,
      isLoggedIn: false,
      switchRole: () => {},
      login: () => {},
      logout: () => {},
      demoAccounts: DEMO_ACCOUNTS,
      usersList: USERS,
    };
  }
  return context;
}
