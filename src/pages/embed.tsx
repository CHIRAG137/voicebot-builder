import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface Message {
  from: "user" | "bot";
  text: string;
  timestamp: Date;
}

export default function EmbedChat() {
  const [searchParams] = useSearchParams();
  const botId = searchParams.get("botId");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (botId) {
      setMessages([{
        from: "bot",
        text: "Hello! I'm here to help. What would you like to know?",
        timestamp: new Date()
      }]);
    }
  }, [botId]);

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

    try {
      const res = await axios.post("http://localhost:5000/api/bots/ask", {
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

  return (
    <div className="flex flex-col h-full bg-background border border-border/20">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Chat Assistant</h3>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              {msg.from === "bot" && (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 mt-auto">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] ${msg.from === "user" ? "order-first" : ""}`}>
                <div className={`p-3 rounded-lg ${
                  msg.from === "user" 
                    ? "bg-primary text-primary-foreground ml-auto" 
                    : "bg-muted"
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {msg.from === "user" && (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 mt-auto">
                  <User className="h-3 w-3 text-primary" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                <Bot className="h-3 w-3 text-primary" />
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}