import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isLoading = message.loading;
  const isError = message.error;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* 头像 */}
      <div
        className={`
          w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold
          ${isUser ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'}
        `}
      >
        {isUser ? '我' : '峰'}
      </div>

      {/* 消息内容 */}
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-md'
              : isError
              ? 'bg-red-900/50 text-red-200 border border-red-800'
              : 'bg-gray-800 text-gray-100 rounded-tl-md'
          }
        `}
      >
        {isLoading ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <div className="message-content prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
