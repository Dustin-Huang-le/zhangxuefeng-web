import { useState, useRef, useEffect } from 'react';

export default function InputBox({ onSend, disabled }) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);

  // 自动调整高度
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending || disabled) return;

    setSending(true);
    setInput('');
    // 重置高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await onSend(trimmed);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-end gap-2 bg-gray-800 rounded-2xl border border-gray-700 px-4 py-2 focus-within:border-blue-500 transition-colors">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入你的问题，比如：560分河南理科想学计算机..."
          disabled={disabled || sending}
          rows={1}
          className="flex-1 bg-transparent text-white text-sm resize-none outline-none placeholder-gray-500 py-1.5 max-h-[200px] disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending || disabled}
          className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {sending ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-xs text-gray-600 text-center mt-2">
        张雪峰 AI 由 DeepSeek 驱动，支持联网搜索 · 内容仅供参考，最终决定请结合实际
      </p>
    </div>
  );
}
