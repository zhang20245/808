import { useCallback, useEffect, useRef, useState } from 'react';
import './index.css';
import { Message, AVAILABLE_MODELS } from './types/chat';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Cat, Settings, Trash2 } from 'lucide-react';
import { SettingsModal } from './components/SettingsModal';

const DEFAULT_API_KEY = 'xai-PDby5aZny9HP02180FkgVPqMMSRVfIABmelIC8qj4Sx6krKynxEX0DYLEaXV6l5URSEZgmfd3fNfjrwU';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('xai_api_key') || DEFAULT_API_KEY);
  const [selectedModel, setSelectedModel] = useState('grok-beta');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
  };

  const handleSaveSettings = (newApiKey: string, newModel: string) => {
    setApiKey(newApiKey);
    setSelectedModel(newModel);
    localStorage.setItem('xai_api_key', newApiKey);
  };

  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel);

  const sendMessage = useCallback(async (content: string, image?: string) => {
    if (!apiKey) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '请先在设置中配置你的 x.ai API密钥才能开始对话哦！'
      }]);
      return;
    }

    const userMessage: Message = { 
      role: 'user', 
      content,
      image
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          messages: [
            { 
              role: 'system', 
              content: 'You are a friendly cat-themed AI assistant named MeowGPT. Respond in a helpful and playful manner.'
            },
            ...messages,
            userMessage
          ],
          model: selectedModel,
          stream: false,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('API请求失败，请检查你的API密钥是否正确');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '喵呜... 遇到了一些问题。请检查API密钥是否正确，或稍后再试！'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, apiKey, selectedModel]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cat className="w-8 h-8 text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-800">MeowChat AI</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm">设置</span>
            </button>
            <button
              onClick={clearChat}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-5 h-5" />
              <span className="text-sm">清空对话</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            <div className="text-center py-4">
              <h2 className="text-xl font-medium text-gray-700 mb-2">
                哈喽，很高兴认识你！
              </h2>
              <p className="text-gray-600">
                我叫喵哥，一个集成了x.ai模型的人工智能对话助手，快来和我聊天吧！
              </p>
              <p className="text-gray-500 text-sm mt-2">
                当前使用模型: {currentModel?.name}
                {currentModel?.supportsImages && ' (支持图片分析)'}
              </p>
            </div>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-2 items-center text-gray-500">
                <Cat className="w-5 h-5 animate-bounce" />
                <span>思考中...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput 
            onSend={sendMessage} 
            disabled={isLoading}
            modelSupportsImages={currentModel?.supportsImages}
          />
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentApiKey={apiKey}
        currentModel={selectedModel}
      />
    </div>
  );
}

export default App;