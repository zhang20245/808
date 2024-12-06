export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: string; // Base64 encoded image
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  supportsImages?: boolean;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'grok-beta',
    name: 'Grok Beta',
    description: 'x.ai 官方对话模型'
  },
  {
    id: 'grok-vision-beta',
    name: 'Grok Vision Beta',
    description: 'x.ai 官方多模态对话模型，支持图片分析',
    supportsImages: true
  }
];