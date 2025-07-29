import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { EmbedCustomization } from "@/components/EmbedCustomizer";

interface Message {
  from: "user" | "bot";
  text: string;
  timestamp: Date;
}

export default function EmbedChat() {
  const [searchParams] = useSearchParams();
  const botId = searchParams.get("botId");
  const isPreview = searchParams.get("preview") === "true";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customization, setCustomization] = useState<EmbedCustomization | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for real-time customization updates from parent window
  useEffect(() => {
    if (isPreview) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'CUSTOMIZATION_UPDATE') {
          setCustomization(event.data.customization);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [isPreview]);

  useEffect(() => {
    if (botId) {
      // Only fetch from API if not in preview mode
      if (!isPreview) {
        const fetchCustomization = async () => {
          try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customizations/${botId}`);
            if (response.data.customization) {
              setCustomization(response.data.customization);
            }
          } catch (error) {
            console.error('Error loading customization:', error);
          }
        };

        fetchCustomization();
      }

      // Set initial message with default
      setMessages([{
        from: "bot",
        text: "Hello! I'm here to help. What would you like to know?",
        timestamp: new Date()
      }]);
    }
  }, [botId, isPreview]);

  // Update welcome message when customization changes
  useEffect(() => {
    if (customization && messages.length === 1 && messages[0].from === "bot") {
      setMessages([{
        from: "bot",
        text: customization.welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [customization?.welcomeMessage]);

  const sendMessage = async () => {
    if (!input.trim() || !botId || isLoading) return;

    const userMessage: Message = { 
      from: "user", 
      text: input, 
      timestamp: new Date() 
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const currentInput = input;
    setInput("");

    // In preview mode, just show a demo response
    if (isPreview) {
      setTimeout(() => {
        const botMessage: Message = { 
          from: "bot", 
          text: "This is a preview response. Your actual bot will respond based on your training data.", 
          timestamp: new Date() 
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000);
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/bots/ask`, {
        botId,
        question: currentInput,
      });
      const botMessage: Message = { 
        from: "bot", 
        text: res.data.answer, 
        timestamp: new Date() 
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [...prev, { 
        from: "bot", 
        text: "Sorry, I'm having trouble connecting right now. Please try again.", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!botId) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="p-6 text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No bot ID provided</p>
        </Card>
      </div>
    );
  }

  // Apply custom styles with CSS variables for easier updates
  const customStyles = customization ? {
    '--custom-primary': customization.primaryColor,
    '--custom-bg': customization.backgroundColor,
    '--custom-header-bg': customization.headerBackground,
    '--custom-user-msg': customization.userMessageColor,
    '--custom-bot-msg': customization.botMessageColor,
    '--custom-text': customization.textColor,
    '--custom-radius': `${customization.borderRadius}px`,
    fontFamily: customization.fontFamily
  } as React.CSSProperties : {};

  return (
    <div 
      className="flex flex-col h-full border border-border/20 transition-all duration-200"
      style={{
        backgroundColor: customization?.backgroundColor || undefined,
        color: customization?.textColor || undefined,
        ...customStyles
      }}
    >
      {/* Chat Header */}
      <div 
        className="flex items-center gap-3 p-4 border-b transition-all duration-200"
        style={{
          backgroundColor: customization?.headerBackground || undefined,
          borderRadius: customization ? `${customization.borderRadius}px ${customization.borderRadius}px 0 0` : undefined
        }}
      >
        <div 
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200"
          style={{
            backgroundColor: customization?.primaryColor ? `${customization.primaryColor}20` : undefined,
            borderRadius: customization?.borderRadius ? `${customization.borderRadius}px` : undefined
          }}
        >
          <Bot 
            className="h-4 w-4 transition-colors duration-200"
            style={{ color: customization?.primaryColor || undefined }}
          />
        </div>
        <div>
          <h3 className="font-semibold text-sm transition-all duration-200">
            {customization?.headerTitle || "Chat Assistant"}
          </h3>
          <p className="text-xs opacity-70 transition-all duration-200">
            {customization?.headerSubtitle || "Online"}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              {msg.from === "bot" && (
                <div 
                  className="flex items-center justify-center w-6 h-6 rounded-full mt-auto transition-all duration-200"
                  style={{
                    backgroundColor: customization?.primaryColor ? `${customization.primaryColor}20` : undefined,
                    borderRadius: customization?.borderRadius ? `${customization.borderRadius}px` : undefined
                  }}
                >
                  <Bot 
                    className="h-3 w-3 transition-colors duration-200"
                    style={{ color: customization?.primaryColor || undefined }}
                  />
                </div>
              )}
              <div className={`max-w-[80%] ${msg.from === "user" ? "order-first" : ""}`}>
                <div 
                  className="p-3 ml-auto transition-all duration-200"
                  style={{
                    backgroundColor: msg.from === "user" 
                      ? customization?.userMessageColor || undefined
                      : customization?.botMessageColor || undefined,
                    color: msg.from === "user" && customization?.userMessageColor 
                      ? '#ffffff' 
                      : customization?.textColor || undefined,
                    borderRadius: customization?.borderRadius ? `${customization.borderRadius}px` : '8px'
                  }}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                <p className="text-xs opacity-70 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {msg.from === "user" && (
                <div 
                  className="flex items-center justify-center w-6 h-6 rounded-full mt-auto transition-all duration-200"
                  style={{
                    backgroundColor: customization?.primaryColor ? `${customization.primaryColor}20` : undefined,
                    borderRadius: customization?.borderRadius ? `${customization.borderRadius}px` : undefined
                  }}
                >
                  <User 
                    className="h-3 w-3 transition-colors duration-200"
                    style={{ color: customization?.primaryColor || undefined }}
                  />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div 
                className="flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: customization?.primaryColor ? `${customization.primaryColor}20` : undefined,
                  borderRadius: customization?.borderRadius ? `${customization.borderRadius}px` : undefined
                }}
              >
                <Bot 
                  className="h-3 w-3 transition-colors duration-200"
                  style={{ color: customization?.primaryColor || undefined }}
                />
              </div>
              <div 
                className="p-3 transition-all duration-200"
                style={{
                  backgroundColor: customization?.botMessageColor || undefined,
                  borderRadius: customization?.borderRadius ? `${customization.borderRadius}px` : '8px'
                }}
              >
                <div className="flex space-x-1">
                  <div 
                    className="w-2 h-2 opacity-50 rounded-full animate-bounce"
                    style={{ backgroundColor: customization?.textColor || undefined }}
                  ></div>
                  <div 
                    className="w-2 h-2 opacity-50 rounded-full animate-bounce" 
                    style={{ 
                      animationDelay: "0.1s",
                      backgroundColor: customization?.textColor || undefined 
                    }}
                  ></div>
                  <div 
                    className="w-2 h-2 opacity-50 rounded-full animate-bounce" 
                    style={{ 
                      animationDelay: "0.2s",
                      backgroundColor: customization?.textColor || undefined 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input Area */}
      <div 
        className="p-4 border-t transition-all duration-200"
        style={{
          backgroundColor: customization?.headerBackground || undefined,
          borderRadius: customization ? `0 0 ${customization.borderRadius}px ${customization.borderRadius}px` : undefined
        }}
      >
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={customization?.placeholder || "Type your message..."}
            disabled={isLoading}
            className="flex-1 transition-all duration-200"
            style={{
              borderRadius: customization?.borderRadius ? `${customization.borderRadius}px` : undefined,
              backgroundColor: customization?.backgroundColor || undefined,
              color: customization?.textColor || undefined
            }}
          />
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0 transition-all duration-200"
            style={{
              backgroundColor: customization?.primaryColor || undefined,
              borderRadius: customization?.borderRadius ? `${customization.borderRadius}px` : undefined
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}