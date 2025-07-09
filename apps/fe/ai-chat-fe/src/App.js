import React from 'react';
import './index.css';
import useWebSocket from './hooks/useWebSocket';
import { useRef, useState } from 'react';

function App() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  // 请根据实际后端WebSocket地址替换ws://localhost:3001
  const { connected, messages, send } = useWebSocket('ws://localhost:3001', { heartbeatInterval: 20000 });

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      send(input);
      setInput('');
    }
  };

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  // 自动滚动
  React.useEffect(scrollToBottom, [messages]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-600 text-white p-4 text-xl font-bold text-center shadow">
        AI 聊天室 {connected ? <span className="ml-2 text-green-300 text-base">● 在线</span> : <span className="ml-2 text-red-300 text-base">● 离线</span>}
      </header>
      <main className="flex-1 flex flex-col items-center justify-end p-4">
        {/* 聊天消息列表 */}
        <div className="w-full max-w-xl flex-1 overflow-y-auto mb-4 bg-white rounded shadow p-4" id="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className="mb-2 text-left">
              <span className="inline-block bg-gray-200 px-3 py-1 rounded text-gray-800">{msg}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {/* 输入框和发送按钮 */}
        <form className="w-full max-w-xl flex gap-2" onSubmit={handleSend}>
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="请输入消息..."
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            disabled={!connected || !input.trim()}
          >发送</button>
        </form>
      </main>
    </div>
  );
}

export default App;
