const STORAGE_KEYS = {
  API_KEY: 'zxf_api_key',
  CONVERSATIONS: 'zxf_conversations',
  ACTIVE_CONVERSATION: 'zxf_active_convo',
};

export function getApiKey() {
  try {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  } catch {
    return '';
  }
}

export function setApiKey(key) {
  try {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  } catch {
    // localStorage full or unavailable
  }
}

export function removeApiKey() {
  try {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  } catch {
    // ignore
  }
}

export function getConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  } catch {
    // localStorage full
  }
}

export function getActiveConversationId() {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION) || null;
  } catch {
    return null;
  }
}

export function setActiveConversationId(id) {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
    }
  } catch {
    // ignore
  }
}

export function createConversation() {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: '新对话',
    messages: [],
    createdAt: new Date().toISOString(),
  };
}
