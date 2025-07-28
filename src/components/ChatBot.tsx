import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, X, Mic, MicOff } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatBotProps {
  bot: {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    voiceEnabled: boolean;
    languages: string[];
    primaryPurpose: string;
    conversationalTone: string;
  };
  onClose: () => void;
}

export const ChatBot = ({ bot, onClose }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `Hello! I'm ${bot.name}. ${bot.description} How can I help you today?`,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bots/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage.content,
          botId: bot.id, // Make sure this is the MongoDB ObjectId of the bot
        }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.answer || data.message || "Sorry, I don't have an answer for that.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to fetch bot response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "Something went wrong. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    if (!bot.voiceEnabled) return;
    setIsListening(!isListening);
    // Voice input functionality would be implemented here
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col shadow-strong">
        <CardHeader className="flex-shrink-0 border-b bg-gradient-primary text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 bg-white/20">
                <AvatarFallback className="bg-white/20 text-white">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{bot.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white hover:bg-white/30">
                    {bot.primaryPurpose}
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white hover:bg-white/30">
                    {bot.conversationalTone}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4 overflow-y-auto max-h-[calc(600px-180px)]">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  {message.sender === "bot" && (
                    <Avatar className="h-8 w-8 bg-gradient-primary flex-shrink-0">
                      <AvatarFallback className="bg-gradient-primary text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${message.sender === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {message.sender === "user" && (
                    <Avatar className="h-8 w-8 bg-secondary flex-shrink-0">
                      <AvatarFallback className="bg-secondary">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 bg-gradient-primary flex-shrink-0">
                    <AvatarFallback className="bg-gradient-primary text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="border-t p-4 bg-background">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="pr-12"
                />
                {bot.voiceEnabled && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleVoiceInput}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 ${isListening ? "text-red-500" : "text-muted-foreground"
                      }`}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
                className="bg-gradient-primary hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>Supported languages:</span>
              {bot.languages.map((lang, index) => (
                <span key={lang}>
                  {lang}
                  {index < bot.languages.length - 1 && ", "}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};