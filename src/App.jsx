import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ApiKeySetup from './components/ApiKeySetup';
import { ZXF_SYSTEM_PROMPT } from './lib/prompt';
import {
  getApiKey,
  setApiKey,
  getConversations,
  saveConversations,
  getActiveConversationId,
  setActiveConversationId,
  createConversation,
} from './lib/storage';

export default function App() {
  const [apiKey, setApiKeyState] = useState('');
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 初始化
  useEffect(() => {
    const key = getApiKey();
    setApiKeyState(key);
    if (!key) {
      setShowApiSetup(true);
    }

    let convos = getConversations();
    if (convos.length === 0) {
      // 创建第一个对话
      const first = createConversation();
      // 添加欢迎消息
      first.messages = [
        {
          role: 'assistant',
          content:
            '哎你好！我是张雪峰，本名张子彪，黑龙江齐齐哈尔富裕县人。\n\n填志愿这事儿，我跟你说——**选对专业比多考20分还重要**。\n\n你是哪个省的？考了多少分？家里做什么的？男孩女孩？想去哪个城市？先告诉我这些，咱再聊。',
          timestamp: new Date().toISOString(),
        },
      ];
      first.title = '新对话';
      convos = [first];
      saveConversations(convos);
    }

    setConversations(convos);

    const activeId = getActiveConversationId();
    const targetId = activeId && convos.find((c) => c.id === activeId) ? activeId : convos[0].id;
    setActiveId(targetId);
    setActiveConversationId(targetId);
  }, []);

  const activeConvo = conversations.find((c) => c.id === activeId) || null;

  const updateConversation = useCallback(
    (id, updater) => {
      setConversations((prev) => {
        const next = prev.map((c) => {
          if (c.id !== id) return c;
          const updated = updater(c);
          return updated;
        });
        saveConversations(next);
        return next;
      });
    },
    []
  );

  const handleNewChat = useCallback(() => {
    const convo = createConversation();
    convo.messages = [
      {
        role: 'assistant',
        content:
          '哎你好！我是张雪峰。填志愿这事儿，选对专业比多考20分还重要。你是哪个省的？考了多少分？家里做什么的？先告诉我这些，咱再聊。',
        timestamp: new Date().toISOString(),
      },
    ];
    setConversations((prev) => {
      const next = [convo, ...prev];
      saveConversations(next);
      return next;
    });
    setActiveId(convo.id);
    setActiveConversationId(convo.id);
    setSidebarOpen(false);
  }, []);

  const handleDeleteChat = useCallback(
    (id) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        saveConversations(next);

        if (id === activeId && next.length > 0) {
          setActiveId(next[0].id);
          setActiveConversationId(next[0].id);
        } else if (next.length === 0) {
          setActiveId(null);
          setActiveConversationId(null);
        }
        return next;
      });
    },
    [activeId]
  );

  const handleSelectChat = useCallback((id) => {
    setActiveId(id);
    setActiveConversationId(id);
    setSidebarOpen(false);
  }, []);

  const handleSendMessage = useCallback(
    async (content) => {
      if (!activeId || !apiKey) return;

      const userMsg = { role: 'user', content, timestamp: new Date().toISOString() };

      // 添加用户消息
      updateConversation(activeId, (c) => {
        const msgs = [...c.messages, userMsg];
        // 自动设置标题（取第一条用户消息的前20字）
        const userMsgs = msgs.filter((m) => m.role === 'user');
        const title =
          userMsgs.length === 1
            ? content.slice(0, 20) + (content.length > 20 ? '...' : '')
            : c.title;
        return { ...c, messages: msgs, title };
      });

      // 添加 loading 占位
      const loadingId = 'loading_' + Date.now();
      updateConversation(activeId, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          { role: 'assistant', content: '...', timestamp: new Date().toISOString(), loading: true, _id: loadingId },
        ],
      }));

      try {
        // 构建发往 API 的消息
        const convo = getConversations().find((c) => c.id === activeId);
        const allMessages = convo ? convo.messages.filter((m) => !m.loading) : [];

        const apiMessages = [
          { role: 'system', content: ZXF_SYSTEM_PROMPT },
          ...allMessages.map((m) => ({ role: m.role, content: m.content })),
        ];

        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, apiKey }),
        });

        const data = await resp.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // 替换 loading 消息为实际回复
        updateConversation(activeId, (c) => ({
          ...c,
          messages: c.messages
            .filter((m) => m._id !== loadingId)
            .concat([
              {
                role: 'assistant',
                content: data.content,
                timestamp: new Date().toISOString(),
              },
            ]),
        }));
      } catch (err) {
        // 替换 loading 为错误消息
        updateConversation(activeId, (c) => ({
          ...c,
          messages: c.messages
            .filter((m) => m._id !== loadingId)
            .concat([
              {
                role: 'assistant',
                content: `出错了：${err.message}`,
                timestamp: new Date().toISOString(),
                error: true,
              },
            ]),
        }));
      }
    },
    [activeId, apiKey, updateConversation]
  );

  const handleSaveApiKey = useCallback((key) => {
    setApiKey(key);
    setApiKeyState(key);
    setShowApiSetup(false);
  }, []);

  const handleClearApiKey = useCallback(() => {
    setApiKey('');
    setApiKeyState('');
    setShowApiSetup(true);
  }, []);

  return (
    <div className="flex h-full bg-gray-950">
      {/* 遮罩层（移动端侧边栏打开时） */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onOpenSettings={() => setShowApiSetup(true)}
        isOpen={sidebarOpen}
        apiKeySet={!!apiKey}
      />

      <ChatArea
        conversation={activeConvo}
        onSend={handleSendMessage}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        hasApiKey={!!apiKey}
        onSetupApiKey={() => setShowApiSetup(true)}
      />

      {showApiSetup && (
        <ApiKeySetup
          currentKey={apiKey}
          onSave={handleSaveApiKey}
          onClear={handleClearApiKey}
          onClose={() => {
            if (apiKey) setShowApiSetup(false);
          }}
        />
      )}
    </div>
  );
}
