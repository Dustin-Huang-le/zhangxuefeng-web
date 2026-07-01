import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import InputBox from './InputBox';

export default function ChatArea({ conversation, onSend, onToggleSidebar, hasApiKey, onSetupApiKey }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* 顶部导航 */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-gray-400 hover:text-white transition-colors p-1"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div>
          <h1 className="text-sm font-semibold text-white">张雪峰 · 志愿填报助手</h1>
          <p className="text-xs text-gray-500">基于张雪峰生前公开言论与思维框架</p>
        </div>
      </header>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto">
        {!conversation ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center space-y-3">
              <div className="text-6xl">🎓</div>
              <p className="text-lg">选择一个对话或开始新对话</p>
              <p className="text-sm text-gray-600">左侧菜单栏可以查看历史记录</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {conversation.messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          {hasApiKey ? (
            <InputBox onSend={onSend} disabled={!conversation} />
          ) : (
            <div className="p-4 text-center">
              <button
                onClick={onSetupApiKey}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
              >
                设置 API Key 开始使用
              </button>
              <p className="text-xs text-gray-500 mt-2">
                需要 DeepSeek API Key，去 platform.deepseek.com 免费申请
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
