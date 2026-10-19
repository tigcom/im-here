'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Loader2,
  FileText,
  User,
  ShieldCheck,
  CheckCheck,
  Clock,
} from 'lucide-react';

import api from '@/lib/api';
import { useAuth } from '@/components/auth/AuthContext';
import { formatVnd } from '@/lib/format';

export default function LookerTaskChatPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params?.id;
  const { currentUser } = useAuth();

  const [task, setTask] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Tải thông tin nhiệm vụ
  useEffect(() => {
    let isMounted = true;
    async function loadTaskInfo() {
      if (!taskId) return;
      try {
        const data = await api.tasks.getById(taskId);
        if (isMounted && data) {
          setTask(data);
        }
      } catch (err) {
        console.warn('Lỗi tải thông tin nhiệm vụ chat:', err);
      }
    }
    loadTaskInfo();
    return () => { isMounted = false; };
  }, [taskId]);

  // 2. Tải và đồng bộ tin nhắn định kỳ (Polling 2.5s)
  useEffect(() => {
    let isMounted = true;

    async function fetchMessages(showLoading = false) {
      if (!taskId) return;
      if (showLoading) setIsLoading(true);
      try {
        const data = await api.chat.getMessages(taskId);
        if (isMounted && Array.isArray(data)) {
          setMessages(data);
        }
      } catch (err) {
        console.warn('Lỗi tải tin nhắn:', err);
      } finally {
        if (isMounted && showLoading) {
          setIsLoading(false);
          setTimeout(scrollToBottom, 100);
        }
      }
    }

    fetchMessages(true);

    const interval = setInterval(() => {
      fetchMessages(false);
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [taskId]);

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // 3. Gửi tin nhắn mới
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text || isSending || !taskId) return;

    setIsSending(true);
    setInputText('');

    // Optimistic Update
    const optimisticMsg = {
      id: 'temp-' + Date.now(),
      taskId: Number(taskId),
      senderId: currentUser?.id,
      senderName: currentUser?.fullName || currentUser?.name || 'Tôi',
      content: text,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 50);

    try {
      const savedMsg = await api.chat.sendMessage(taskId, text);
      if (savedMsg) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? savedMsg : m))
        );
      }
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err);
      // Giữ nguyên tin nhắn hoặc đánh dấu lỗi
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const hirerName = task?.clientName || 'Người Đăng Việc';

  return (
    <div className="flex h-dvh w-full flex-col bg-paper-100 text-ink-900 font-sans overflow-hidden">
      {/* ── TOP MOBILE APP BAR ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-rule-subtle bg-paper-000 px-4 py-3 shadow-[0_2px_8px_oklch(0_0_0/0.05)]">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/looker/listing/${taskId}/execute`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rule-subtle bg-paper-100 text-ink-700 hover:bg-paper-200 active:scale-95 transition-[transform,background-color]"
            aria-label="Quay lại nhiệm vụ"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent font-bold">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-sm font-bold text-ink-900 truncate">
                  {hirerName}
                </h1>
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
              </div>
              <p className="font-mono text-[0.6875rem] text-ink-500 truncate">
                Nhiệm vụ #{taskId} • {task?.title || 'Đang thực hiện'}
              </p>
            </div>
          </div>
        </div>

        {/* Nút xem lại chi tiết nhiệm vụ */}
        <Link
          href={`/looker/listing/${taskId}/execute`}
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rule-subtle bg-paper-100 text-xs font-bold text-ink-700 hover:bg-paper-200 transition-colors"
        >
          <FileText className="h-3.5 w-3.5 text-accent" />
          <span className="hidden sm:inline">Việc làm</span>
        </Link>
      </header>

      {/* ── THÔNG BÁO GẮN KẾT AN TOÀN ── */}
      <div className="bg-paper-000/60 border-b border-rule-subtle px-4 py-1.5 flex items-center justify-between text-[0.6875rem] text-ink-500 font-mono">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          Kênh trao đổi riêng cho nhiệm vụ #{taskId}
        </span>
        {task?.rewardAmount && (
          <span className="font-bold text-accent">
            {formatVnd(task.rewardAmount)} (Ký quỹ 100%)
          </span>
        )}
      </div>

      {/* ── MESSAGES LIST CONTAINER (Scroll dọc tự nhiên) ── */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-paper-100"
        data-lenis-prevent="true"
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2 text-ink-500">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
              <span className="text-xs font-semibold">Đang nạp tin nhắn...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper-000 border border-rule-subtle text-accent shadow-xs">
              <User className="h-7 w-7" />
            </div>
            <div>
              <p className="font-display text-base font-bold text-ink-900">
                Bắt đầu trò chuyện với {hirerName}
              </p>
              <p className="mt-1 text-xs text-ink-500 max-w-xs">
                Bạn có thể thông báo tình hình thực địa, hỏi thêm thông tin hoặc gửi ghi chú trực tiếp cho người đăng việc tại đây.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            // Xác định tin nhắn là của mình hay của đối phương
            const isMe =
              msg.senderId === currentUser?.id ||
              msg.senderName === currentUser?.fullName ||
              msg.senderName === currentUser?.name;

            const timeStr = msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <div
                key={msg.id || index}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {!isMe && (
                  <span className="text-[0.6875rem] font-bold text-ink-500 mb-1 pl-1">
                    {msg.senderName || hirerName}
                  </span>
                )}
                <div
                  className={`max-w-[82%] sm:max-w-md rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-accent text-paper-000 rounded-br-xs font-medium'
                      : 'bg-paper-000 text-ink-900 border border-rule-subtle rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="font-mono text-[0.625rem] text-ink-400">
                    {timeStr}
                  </span>
                  {isMe && (
                    <CheckCheck className={`h-3 w-3 ${msg.isOptimistic ? 'text-ink-400' : 'text-accent'}`} />
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── BOTTOM STICKY INPUT BAR ── */}
      <footer className="sticky bottom-0 z-30 border-t border-rule-subtle bg-paper-000 p-3 sm:p-4 pb-safe">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 max-w-3xl mx-auto"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập tin nhắn cho người thuê..."
            className="flex-1 rounded-2xl border border-rule-subtle bg-paper-100 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-accent focus:bg-paper-000 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-paper-000 hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-[transform,background-color] shadow-[0_4px_16px_oklch(0.68_0.198_152/0.25)]"
            aria-label="Gửi tin nhắn"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </footer>
    </div>
  );
}
