export default function Sidebar({
  conversations,
  activeId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onOpenSettings,
  isOpen,
  apiKeySet,
}) {
  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[280px] bg-gray-900 flex flex-col border-r border-gray-800
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* 头部 */}
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新对话
        </button>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">暂无对话记录</p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelectChat(c.id)}
            className={`
              group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-sm
              transition-colors
              ${
                c.id === activeId
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
              }
            `}
          >
            <span className="flex-1 truncate">{c.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('确定要删除这个对话吗？')) {
                  onDeleteChat(c.id);
                }
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-0.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* 底部 */}
      <div className="p-3 border-t border-gray-800 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
          <span className={`w-2 h-2 rounded-full ${apiKeySet ? 'bg-green-500' : 'bg-red-500'}`} />
          {apiKeySet ? 'API Key 已设置' : '未设置 API Key'}
        </div>
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          API 设置
        </button>
      </div>
    </aside>
  );
}
