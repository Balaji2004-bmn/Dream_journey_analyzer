import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DreamCard, DreamCardContent, DreamCardHeader, DreamCardTitle } from '@/components/ui/dream-card';
import { MessageCircle, Send, Trash2, X, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://dream-journey-backend.onrender.com';

export default function ProjectAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI assistant for Dream Journey Analyzer. I can help you with platform features, dream analysis, subscriptions, and more. I can also answer general questions on any topic. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage,
          conversationId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from assistant');
      }

      const data = await response.json();

      // Update conversation ID if new
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      // Add assistant response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.assistantMessage }]);

    } catch (error) {
      console.error('Assistant error:', error);
      
      // Simple, friendly error message (no troubleshooting details)
      let errorMessage = "I apologize for the inconvenience. I'm having trouble responding right now. Please try again in a moment.";
      
      toast.error('Unable to get response');
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = async () => {
    if (conversationId) {
      try {
        await fetch(`${API_BASE}/api/assistant/${conversationId}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Failed to clear conversation:', error);
      }
    }

    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm your AI assistant. I can help with platform questions or general topics. What would you like to know?"
      }
    ]);
    setConversationId(null);
    toast.success('Conversation cleared');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="font-medium">Need Help?</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <DreamCard className="shadow-2xl">
        <DreamCardHeader className="flex flex-row items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <DreamCardTitle className="!text-lg">Project Assistant</DreamCardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="h-8 w-8 p-0"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </DreamCardHeader>

        <DreamCardContent className="p-0">
          {/* Messages area */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-green-500 text-white'
                  }`}
                >
                  <div className="text-xs font-semibold mb-1 opacity-70">
                    {msg.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-green-500 text-white max-w-[80%] rounded-lg px-4 py-2">
                  <div className="text-xs font-semibold mb-1 opacity-70">Assistant</div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75" />
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about the platform..."
                disabled={loading}
                className="flex-1 px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                size="sm"
                className="px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Powered by Gemini AI & OpenAI
            </p>
          </div>
        </DreamCardContent>
      </DreamCard>
    </div>
  );
}
