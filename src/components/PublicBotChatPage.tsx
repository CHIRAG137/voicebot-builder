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

interface FlowNode {
  id: string;
  type: 'message' | 'question' | 'confirmation' | 'branch' | 'redirection';
  data: {
    message?: string;
    variable?: string;
    options?: string[];
    redirectUrl?: string;
  };
}

interface ConversationFlow {
  nodes: FlowNode[];
  edges: { source: string; target: string; id: string }[];
}

export const PublicBotChatPage = () => {
  const { botId } = useParams<{ botId: string }>();
  const { toast } = useToast();
  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [flowCompleted, setFlowCompleted] = useState(false);
  const [collectedVariables, setCollectedVariables] = useState<Record<string, string>>({});
  const [awaitingResponse, setAwaitingResponse] = useState(false);
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

  const processNode = (node: FlowNode) => {
    if (!node) return;

    switch (node.type) {
      case 'message':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: node.data.message || '',
          sender: 'bot',
          timestamp: new Date()
        }]);
        
        setTimeout(() => {
          const nextEdge = bot?.conversationFlow?.edges.find((e: any) => e.source === node.id);
          if (nextEdge) {
            const nextNode = bot?.conversationFlow?.nodes.find((n: any) => n.id === nextEdge.target);
            if (nextNode) {
              setCurrentNodeId(nextNode.id);
              processNode(nextNode);
            }
          } else {
            setFlowCompleted(true);
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              content: "Now feel free to ask me any questions!",
              sender: 'bot',
              timestamp: new Date()
            }]);
          }
        }, 1000);
        break;

      case 'question':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: node.data.message || '',
          sender: 'bot',
          timestamp: new Date()
        }]);
        setAwaitingResponse(true);
        break;

      case 'confirmation':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: `${node.data.message || ''}\n\nPlease respond with Yes or No.`,
          sender: 'bot',
          timestamp: new Date()
        }]);
        setAwaitingResponse(true);
        break;

      case 'branch':
        const optionsText = node.data.options?.join('\n') || '';
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: `${node.data.message || ''}\n\nOptions:\n${optionsText}`,
          sender: 'bot',
          timestamp: new Date()
        }]);
        setAwaitingResponse(true);
        break;

      case 'redirection':
        if (node.data.redirectUrl) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            content: `Redirecting to: ${node.data.redirectUrl}`,
            sender: 'bot',
            timestamp: new Date()
          }]);
          setTimeout(() => {
            window.open(node.data.redirectUrl, '_blank');
            const nextEdge = bot?.conversationFlow?.edges.find((e: any) => e.source === node.id);
            if (nextEdge) {
              const nextNode = bot?.conversationFlow?.nodes.find((n: any) => n.id === nextEdge.target);
              if (nextNode) {
                setCurrentNodeId(nextNode.id);
                processNode(nextNode);
              }
            } else {
              setFlowCompleted(true);
            }
          }, 2000);
        }
        break;
    }
  };

  const handleFlowResponse = (userInput: string) => {
    const currentNode = bot?.conversationFlow?.nodes.find((n: any) => n.id === currentNodeId);
    if (!currentNode) return;

    // Store variable if defined
    if (currentNode.data.variable) {
      setCollectedVariables(prev => ({
        ...prev,
        [currentNode.data.variable]: userInput
      }));
    }

    let nextEdge;
    
    // Handle branching based on node type
    if (currentNode.type === 'confirmation') {
      // For confirmation nodes, check yes/no response
      const isYes = userInput.toLowerCase().includes('yes') || 
                    userInput.toLowerCase() === 'y' ||
                    userInput.toLowerCase() === 'ok' ||
                    userInput.toLowerCase().includes('sure') ||
                    userInput.toLowerCase().includes('okay');
      
      const sourceHandle = isYes ? 'yes' : 'no';
      nextEdge = bot?.conversationFlow?.edges.find((e: any) => 
        e.source === currentNodeId && e.sourceHandle === sourceHandle
      );
      
      // If no edge for this handle, check if there's only a single edge (fallback)
      if (!nextEdge) {
        const allEdgesFromNode = bot?.conversationFlow?.edges.filter((e: any) => e.source === currentNodeId);
        if (allEdgesFromNode?.length === 1) {
          nextEdge = allEdgesFromNode[0];
        }
      }
    } else if (currentNode.type === 'branch') {
      // For branch nodes, match user input with options
      const selectedOption = currentNode.data.options?.find((option: string) =>
        userInput.toLowerCase().includes(option.toLowerCase())
      );
      
      if (selectedOption) {
        // Find edge with matching sourceHandle (option index or option text)
        const optionIndex = currentNode.data.options.indexOf(selectedOption);
        nextEdge = bot?.conversationFlow?.edges.find((e: any) => 
          e.source === currentNodeId && 
          (e.sourceHandle === selectedOption || e.sourceHandle === `option${optionIndex}`)
        );
      }
      
      // Fallback to any edge if no match
      if (!nextEdge) {
        nextEdge = bot?.conversationFlow?.edges.find((e: any) => 
          e.source === currentNodeId
        );
      }
    } else {
      // For other node types, just find the next edge
      nextEdge = bot?.conversationFlow?.edges.find((e: any) => 
        e.source === currentNodeId
      );
    }

    if (nextEdge) {
      const nextNode = bot?.conversationFlow?.nodes.find((n: any) => n.id === nextEdge.target);
      if (nextNode) {
        setCurrentNodeId(nextNode.id);
        setAwaitingResponse(false);
        setTimeout(() => processNode(nextNode), 500);
      }
    } else {
      // Flow completed - no more edges
      setFlowCompleted(true);
      setAwaitingResponse(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: "Thank you! Now feel free to ask me any questions.",
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  };

  useEffect(() => {
    const fetchBot = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bots/${botId}`);
        const data = await res.json();
        setBot(data);

        // Check if bot has conversation flow
        if (data.conversationFlow && data.conversationFlow.nodes && data.conversationFlow.nodes.length > 0) {
          // Find the first node (node without incoming edges)
          const firstNode = data.conversationFlow.nodes.find((n: any) => 
            !data.conversationFlow.edges.some((e: any) => e.target === n.id)
          );
          
          if (firstNode) {
            setCurrentNodeId(firstNode.id);
            processNode(firstNode);
          } else {
            // No valid starting node, use default greeting
            setFlowCompleted(true);
            setMessages([{
              id: "init",
              content: `Hello! I'm ${data.name}. ${data.description} How can I help you today?`,
              sender: "bot",
              timestamp: new Date(),
            }]);
          }
        } else {
          // No conversation flow, use default greeting
          setFlowCompleted(true);
          setMessages([{
            id: "init",
            content: `Hello! I'm ${data.name}. ${data.description} How can I help you today?`,
            sender: "bot",
            timestamp: new Date(),
          }]);
        }
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

    // Check if we're in conversation flow mode
    if (!flowCompleted && awaitingResponse) {
      // Handle flow response
      handleFlowResponse(userMessage.content);
      return;
    }

    // Otherwise, use the askBot API
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
    if (!bot?.is_voice_enabled) return;
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
                {bot.is_voice_enabled && (
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
