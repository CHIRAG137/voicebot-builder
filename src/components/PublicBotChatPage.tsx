import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Send, Mic, MicOff } from "lucide-react";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export const PublicBotChatPage = () => {
  const { botId } = useParams<{ botId: string }>();
  const { toast } = useToast();
  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isListening, toggleListening } = useSpeechToText({
    onResult: (text) => {
      setInputMessage(prev => prev + (prev ? ' ' : '') + text);
    },
    onError: (error) => {
      toast({
        title: "Speech Recognition Error",
        description: error,
        variant: "destructive"
      });
    },
    language: 'en-US'
  });

  useEffect(() => {
    const fetchBot = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bots/${botId}`);
        const data = await res.json();
        setBot(data);
        console.log("Bot data:", data); // Debug log

        setMessages([
          {
            id: "init",
            content: `Hello! I'm ${data.name}. ${data.description} How can I help you today?`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } catch (err) {
        console.error("Failed to fetch bot:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBot();
  }, [botId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !bot) return;

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
          botId: botId,
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
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          content: "Something went wrong. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
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

  const handleVoiceInput = () => {
    if (!bot?.voiceEnabled) return;
    toggleListening();
  };

  if (loading) return <p className="text-center mt-10">Loading bot...</p>;
  if (!bot) return <p className="text-center mt-10 text-red-500">Bot not found</p>;

  return (
    <div className="min-h-screen bg-background p-4 flex justify-center">
      <Card className="w-full max-w-2xl flex flex-col shadow-md border">
        <CardHeader className="border-b bg-gradient-primary text-white">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-white/20">
              <AvatarFallback className="bg-white/20 text-white">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{bot.name}</CardTitle>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                  {bot.primary_purpose}
                </Badge>
                <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                  {bot.conversation_tone}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "bot" && (
                    <Avatar className="h-8 w-8 bg-gradient-primary flex-shrink-0">
                      <AvatarFallback className="text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                      msg.sender === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
                    }`}
                  >
                    {msg.content}
                    <div className="text-xs opacity-60 mt-1 text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  {msg.sender === "user" && (
                    <Avatar className="h-8 w-8 bg-secondary flex-shrink-0">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 bg-gradient-primary flex-shrink-0">
                    <AvatarFallback className="text-white">
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
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
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
                    onClick={handleVoiceInput}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 ${
                      isListening ? "text-red-500 animate-pulse" : "text-muted-foreground hover:text-primary"
                    }`}
                    title={isListening ? "Stop recording" : "Start voice input"}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
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
            <div className="text-xs mt-2 text-muted-foreground">
              <span>Supported languages:</span>{" "}
              {bot.supported_languages}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
