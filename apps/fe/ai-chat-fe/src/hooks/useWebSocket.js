import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * 通用WebSocket Hook
 * @param {string} url WebSocket服务器地址
 * @param {object} options 可选项：{ onMessage, onOpen, onClose, onError, heartbeatInterval }
 */
export default function useWebSocket(url, options = {}) {
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const heartbeatRef = useRef(null);

  const send = useCallback((data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    if (!url) return;
    ws.current = new window.WebSocket(url);

    ws.current.onopen = (event) => {
      setConnected(true);
      if (options.onOpen) options.onOpen(event);
      // 心跳
      if (options.heartbeatInterval) {
        heartbeatRef.current = setInterval(() => {
          send(options.heartbeatMsg || 'ping');
        }, options.heartbeatInterval);
      }
    };
    ws.current.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
      if (options.onMessage) options.onMessage(event);
    };
    ws.current.onclose = (event) => {
      setConnected(false);
      if (options.onClose) options.onClose(event);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
    ws.current.onerror = (event) => {
      if (options.onError) options.onError(event);
    };
    return () => {
      if (ws.current) ws.current.close();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
    // eslint-disable-next-line
  }, [url]);

  return { connected, messages, send };
}