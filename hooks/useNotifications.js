'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import { createRealtimeClient } from '@/lib/realtime';

function normalizeNotification(item) {
  return { ...item, body: item.content ?? item.body ?? '', read: Boolean(item.isRead ?? item.read) };
}

function publishNotificationChange(detail) {
  window.dispatchEvent(new CustomEvent('imhere:notifications-updated', { detail }));
}

export default function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(userId));

  const refresh = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }
    try {
      const items = await api.notifications.getAll();
      setNotifications(Array.isArray(items) ? items.map(normalizeNotification) : []);
    } catch (error) {
      console.warn('Không tải được thông báo:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return undefined;
    let alive = true;
    const token = api.getToken();
    const sync = async () => {
      try {
        const items = await api.notifications.getAll();
        if (alive) setNotifications(Array.isArray(items) ? items.map(normalizeNotification) : []);
      } catch (error) {
        console.warn('Không tải được thông báo:', error);
      } finally {
        if (alive) setIsLoading(false);
      }
    };
    sync();
    const interval = window.setInterval(sync, 30000);
    const handleLocalChange = (event) => {
      const detail = event.detail || {};
      if (detail.notification) {
        const incoming = normalizeNotification(detail.notification);
        setNotifications((current) => [incoming, ...current.filter((item) => item.id !== incoming.id)]);
      } else if (detail.id != null) {
        setNotifications((current) => current.map((item) => String(item.id) === String(detail.id)
          ? { ...item, read: true, isRead: true }
          : item));
      } else if (detail.allRead) {
        setNotifications((current) => current.map((item) => ({ ...item, read: true, isRead: true })));
      }
    };
    window.addEventListener('imhere:notifications-updated', handleLocalChange);

    const client = createRealtimeClient(token, () => {
      client.subscribe(`/topic/notifications/${userId}`, (frame) => {
        try {
          const incoming = normalizeNotification(JSON.parse(frame.body));
          if (alive) {
            setNotifications((current) => [incoming, ...current.filter((item) => item.id !== incoming.id)]);
            publishNotificationChange({ notification: incoming });
          }
        } catch (error) {
          console.warn('Không đọc được thông báo realtime:', error);
        }
      });
    });
    client?.activate();

    return () => {
      alive = false;
      window.clearInterval(interval);
      window.removeEventListener('imhere:notifications-updated', handleLocalChange);
      client?.deactivate();
    };
  }, [userId]);

  const markRead = useCallback(async (id) => {
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true, isRead: true } : item));
    if (typeof window !== 'undefined') publishNotificationChange({ id });
    try {
      await api.notifications.markRead(id);
    } catch (error) {
      console.warn('Không đánh dấu được thông báo:', error);
      refresh();
    }
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true, isRead: true })));
    if (typeof window !== 'undefined') publishNotificationChange({ allRead: true });
    try {
      await api.notifications.markAllRead();
    } catch (error) {
      console.warn('Không đánh dấu được toàn bộ thông báo:', error);
      refresh();
    }
  }, [refresh]);

  return { notifications, unreadCount: notifications.filter((item) => !item.read).length, isLoading, refresh, markRead, markAllRead };
}
