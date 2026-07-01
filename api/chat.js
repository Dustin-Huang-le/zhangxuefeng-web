// Vercel Edge Function — 代理 DeepSeek API + 联网搜索
// 架构：浏览器 → /api/chat → DeepSeek API（带 tool calling 实现联网搜索）

const DEEPSEEK_API = 'https://api.deepseek.com/v1/chat/completions';

// DuckDuckGo 搜索（免费，无需 API Key）
async function webSearch(query) {
  const results = [];

  try {
    // 使用 DuckDuckGo HTML 搜索
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!resp.ok) return [{ title: '搜索失败', snippet: '请稍后重试', url: '' }];

    const html = await resp.text();

    // 解析搜索结果
    const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([^<]*)<\/a>/gi;
    let match;
    let count = 0;

    while ((match = resultRegex.exec(html)) !== null && count < 8) {
      const href = match[1];
      const title = match[2].replace(/<[^>]*>/g, '').trim();
      const snippet = match[3].replace(/<[^>]*>/g, '').trim();

      if (title && snippet) {
        results.push({ title, snippet, url: href });
        count++;
      }
    }

    // 如果没解析到结果，尝试更宽松的匹配
    if (results.length === 0) {
      const looseRegex = /class="result__snippet"[^>]*>([^<]+)</gi;
      const titleRegex = /class="result__a"[^>]*>([^<]+)</gi;
      const snippets = [];
      const titles = [];
      let m;
      while ((m = looseRegex.exec(html)) !== null) {
        snippets.push(m[1].trim());
      }
      while ((m = titleRegex.exec(html)) !== null) {
        titles.push(m[1].replace(/<[^>]*>/g, '').trim());
      }
      for (let i = 0; i < Math.min(titles.length, snippets.length, 8); i++) {
        results.push({ title: titles[i], snippet: snippets[i], url: '' });
      }
    }
  } catch (e) {
    // fallback to nothing
  }

  if (results.length === 0) {
    return [{ title: '未找到相关结果', snippet: '请尝试更换搜索关键词', url: '' }];
  }

  return results;
}

// 格式化搜索结果给模型
function formatSearchResults(results, query) {
  return `【搜索结果：${query}】\n${results
    .map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet}${r.url ? `\n   链接: ${r.url}` : ''}`)
    .join('\n')}`;
}

// 调用 DeepSeek API
async function callDeepSeek(messages, apiKey) {
  const resp = await fetch(DEEPSEEK_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      tools: [
        {
          type: 'function',
          function: {
            name: 'web_search',
            description:
              '联网搜索最新信息。当需要查询就业率、薪资数据、院校排名、录取分数线、行业动态、专业前景等数据时必须使用。可以同时搜索多个关键词。',
            parameters: {
              type: 'object',
              properties: {
                queries: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '要搜索的关键词列表，每个关键词一个独立搜索',
                },
              },
              required: ['queries'],
            },
          },
        },
      ],
      temperature: 0.8,
      max_tokens: 4096,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`DeepSeek API 错误 (${resp.status}): ${err}`);
  }

  return resp.json();
}

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages, apiKey } = await req.json();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: '请先设置 DeepSeek API Key' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 构造完整消息列表（system prompt 由前端传入，此处只拼接）
    const conversationMessages = [...messages];

    // 最多 3 轮 tool calling
    let maxRounds = 3;
    let lastResponse;

    while (maxRounds > 0) {
      lastResponse = await callDeepSeek(conversationMessages, apiKey);
      maxRounds--;

      const choice = lastResponse.choices?.[0];
      if (!choice) break;

      const msg = choice.message;

      // 检查是否有 tool calls
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        // 添加 assistant 消息（含 tool calls）
        conversationMessages.push({
          role: 'assistant',
          content: msg.content || '',
          tool_calls: msg.tool_calls,
        });

        // 执行所有搜索
        for (const tc of msg.tool_calls) {
          if (tc.function.name === 'web_search') {
            const args = JSON.parse(tc.function.arguments);
            const queries = args.queries || [args.query || '就业数据'];
            let allResults = '';

            // 并行搜索所有关键词
            const searchPromises = queries.map((q) => webSearch(q));
            const searchResults = await Promise.all(searchPromises);

            for (let i = 0; i < queries.length; i++) {
              allResults += formatSearchResults(searchResults[i], queries[i]) + '\n\n';
            }

            conversationMessages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: allResults,
            });
          }
        }

        continue; // 继续下一轮
      }

      // 没有 tool calls，返回最终回复
      break;
    }

    const finalMessage = lastResponse?.choices?.[0]?.message;

    return new Response(
      JSON.stringify({
        content: finalMessage?.content || '抱歉，出了点问题，请重新问我一遍。',
        role: 'assistant',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err.message || '请求失败，请检查网络或 API Key',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
