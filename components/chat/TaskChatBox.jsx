'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/components/auth/AuthContext';
import { createRealtimeClient } from '@/lib/realtime';

export default function TaskChatBox({ taskId, title = 'Hộp thoại trao đổi nhiệm vụ' }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const connectedRef = useRef(false);

  const fetchMessages = useCallback(async () => {
    if (!taskId) return;
    try {
      const data = await api.chat.getMessages(taskId);
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Lỗi tải tin nhắn:', err);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const addMessage = useCallback((message) => {
    if (!message) return;
    setMessages((current) => current.some((item) => String(item.id) === String(message.id))
      ? current
      : [...current, message]);
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = window.setInterval(() => {
      if (!connectedRef.current) fetchMessages();
    }, 15000);
    const client = createRealtimeClient(api.getToken(), () => {
      connectedRef.current = true;
      setIsConnected(true);
      client.subscribe(`/topic/tasks/${taskId}`, (frame) => {
        try {
          addMessage(JSON.parse(frame.body));
        } catch (error) {
          console.warn('Không đọc được tin nhắn realtime:', error);
        }
      });
      fetchMessages();
    }, () => {
      connectedRef.current = false;
      setIsConnected(false);
    });
    client?.activate();
    return () => {
      window.clearInterval(interval);
      connectedRef.current = false;
      client?.deactivate();
    };
  }, [taskId, fetchMessages, addMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      const newMsg = await api.chat.sendMessage(taskId, text);
      setInputText('');
      if (newMsg) {
        addMessage(newMsg);
      } else {
        await fetchMessages();
      }
    } catch (err) {
      alert('Không thể gửi tin nhắn: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[420px] rounded-2xl border border-ink-100 bg-paper-000 shadow-elevated overflow-hidden" data-testid="chat-box">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-paper-100 border-b border-ink-100">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-accent-amber'}`} />
          <MessageSquare className="w-4 h-4 text-ink-700" />
          <span className="text-xs font-bold text-ink-900 uppercase tracking-wider">{title}</span>
        </div>
        <span className="text-[11px] text-ink-500 font-medium" aria-live="polite">
          {isConnected ? 'Đang kết nối · ' : 'Đang đồng bộ · '}{messages.length} tin nhắn
        </span>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-paper-050" data-testid="chat-messages-container">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-ink-400 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang tải cuộc trò chuyện...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-ink-400 text-xs text-center p-4">
            <MessageSquare className="w-8 h-8 stroke-1 text-ink-300 mb-2" />
            Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = currentUser?.id && String(msg.senderId) === String(currentUser.id);
            const senderName = isMe ? 'Bạn' : (msg.senderName || 'Đối phương');
            return (
              <div
                key={msg.id || idx}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                data-testid="chat-message-item"
              >
                <span className="text-[10px] text-ink-400 px-1 mb-0.5">
                  {senderName}
                </span>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    isMe
                      ? 'bg-accent text-paper-000 rounded-br-xs'
                      : 'bg-paper-100 text-ink-900 border border-ink-100 rounded-bl-xs'
                  }`}
                  data-testid="chat-message-content"
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 bg-paper-000 border-t border-ink-100 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập tin nhắn trao đổi..."
          className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-paper-100 border border-ink-100 text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-accent"
          data-testid="chat-input"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className="px-3.5 py-2.5 rounded-xl bg-accent text-paper-000 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-[background-color,border-color,color,transform,opacity] duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-1.5 shrink-0"
          data-testid="chat-send-btn"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>Gửi</span>
        </button>
      </form>
    </div>
  );
}
