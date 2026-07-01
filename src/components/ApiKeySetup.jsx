import { useState } from 'react';

export default function ApiKeySetup({ currentKey, onSave, onClear, onClose }) {
  const [key, setKey] = useState(currentKey || '');
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    const trimmed = key.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('sk-')) {
      alert('API Key 格式不正确，DeepSeek 的 Key 以 sk- 开头');
      return;
    }
    onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-md p-6 space-y-5 shadow-2xl border border-gray-700">
        <div className="text-center">
          <div className="text-4xl mb-2">🎓</div>
          <h2 className="text-xl font-bold text-white">设置 API Key</h2>
          <p className="text-gray-400 text-sm mt-1">
            使用 DeepSeek API 驱动张雪峰 AI，自带联网搜索能力
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">DeepSeek API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white text-sm pr-12 focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <a
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-400 hover:text-blue-300 underline text-center"
          >
            还没有 Key？去 DeepSeek 官网免费申请 →
          </a>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-3 text-xs text-gray-400 space-y-1.5">
          <p className="font-medium text-gray-300">说明：</p>
          <p>• Key 只保存在你的浏览器里，不会上传到任何服务器</p>
          <p>• 每次提问通过本站后端转发到 DeepSeek，Key 不会暴露</p>
          <p>• DeepSeek API 按量计费，一次对话约几分钱</p>
          <p>• 支持联网搜索，自动查询最新就业数据</p>
        </div>

        <div className="flex gap-3">
          {currentKey && onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              取消
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            保存并开始使用
          </button>
        </div>

        {currentKey && (
          <button
            onClick={() => {
              if (confirm('确定要清除当前 API Key 吗？')) {
                onClear();
              }
            }}
            className="w-full text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            清除已保存的 API Key
          </button>
        )}
      </div>
    </div>
  );
}
