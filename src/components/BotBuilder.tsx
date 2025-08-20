import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Bot, Sparkles, User, Globe, Mic, Languages, Brain, MessageSquare } from "lucide-react";
import { BasicInfoSection } from "./BotBuilder/BasicInfoSection";
import { WebsiteSection } from "./BotBuilder/WebsiteSection";
import { VoiceSection } from "./BotBuilder/VoiceSection";
import { LanguageSection } from "./BotBuilder/LanguageSection";
import { PersonaSection } from "./BotBuilder/PersonaSection";
import { SlackSection } from "./BotBuilder/SlackSection";
import { useToast } from "@/hooks/use-toast";
import { BotCard } from "@/components/BotCard";
import { ChatBot } from "@/components/ChatBot";
import { IntegrationModal } from "@/components/IntegrationModal";
import { EditBotModal } from "@/components/EditBotModal";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders, isAuthenticated } from "@/utils/auth";
import { Navbar } from "@/components/Navbar";


interface BotConfig {
  name: string;
  websiteUrl: string;
  description: string;
  file: File | null;
  voiceEnabled: boolean;
  languages: string[];
  primaryPurpose: string;
  specializationArea: string;
  conversationalTone: string;
  responseStyle: string;
  targetAudience: string;
  keyTopics: string;
  keywords: string;
  customInstructions: string;
  isSlackEnabled: boolean;
  slackChannelId: string;
}

export const BotBuilder = () => {
  const navigate = useNavigate();

  const { toast } = useToast();
  const [savedBots, setSavedBots] = useState<any[]>([]);
  const [selectedBotForTest, setSelectedBotForTest] = useState<any | null>(null);
  const [visibleBotCount, setVisibleBotCount] = useState(3);
  const [selectedBotForIntegration, setSelectedBotForIntegration] = useState<any | null>(null);
  const [selectedBotForEdit, setSelectedBotForEdit] = useState<any | null>(null);

  const handleShowMore = () => {
    setVisibleBotCount(prev => Math.min(prev + 3, savedBots.length));
  };

  const handleShowLess = () => {
    setVisibleBotCount(3);
  };

  const [botConfig, setBotConfig] = useState<BotConfig>({
    name: "",
    websiteUrl: "",
    description: "",
    file: null,
    voiceEnabled: false,
    languages: ["English"],
    primaryPurpose: "",
    specializationArea: "",
    conversationalTone: "",
    responseStyle: "",
    targetAudience: "",
    keyTopics: "",
    keywords: "",
    customInstructions: "",
    isSlackEnabled: false,
    slackChannelId: "",
  });

  const fetchBots = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bots`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const bots = data.bots.map((bot: any) => ({
          id: bot._id,
          name: bot.name,
          description: bot.description,
          websiteUrl: bot.website_url,
          voiceEnabled: bot.is_voice_enabled,
          languages: Array.isArray(bot.supported_languages) ? bot.supported_languages : ["English"],
          primaryPurpose: bot.primary_purpose,
          conversationalTone: bot.conversation_tone,
        }));
        setSavedBots(bots);
      } else {
        const errorText = await res.text();
        console.error("Failed to load bots:", errorText);
      }
    } catch (err) {
      console.error("Error fetching bots:", err);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const updateConfig = (field: keyof BotConfig, value: any) => {
    setBotConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", botConfig.name);
      formData.append("website_url", botConfig.websiteUrl);
      formData.append("description", botConfig.description);
      formData.append("is_voice_enabled", botConfig.voiceEnabled.toString());
      formData.append("is_auto_translate", "false");
      formData.append("supported_languages", JSON.stringify(botConfig.languages));
      formData.append("primary_purpose", botConfig.primaryPurpose);
      formData.append("specialisation_area", botConfig.specializationArea);
      formData.append("conversation_tone", botConfig.conversationalTone);
      formData.append("response_style", botConfig.responseStyle);
      formData.append("target_audience", botConfig.targetAudience);
      formData.append("key_topics", botConfig.keyTopics);
      formData.append("keywords", botConfig.keywords);
      formData.append("custom_instructions", botConfig.customInstructions);
      formData.append("is_slack_enabled", botConfig.isSlackEnabled.toString());
      formData.append("slack_channel_id", botConfig.slackChannelId);

      if (botConfig.file) {
        formData.append("file", botConfig.file);
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bots/create`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create bot");
      }

      toast({
        title: "Bot Created Successfully!",
        description: result.message || `${botConfig.name} has been created successfully.`,
      });

      setBotConfig({
        name: "",
        websiteUrl: "",
        description: "",
        file: null,
        voiceEnabled: false,
        languages: ["English"],
        primaryPurpose: "",
        specializationArea: "",
        conversationalTone: "",
        responseStyle: "",
        targetAudience: "",
        keyTopics: "",
        keywords: "",
        customInstructions: "",
        isSlackEnabled: false,
        slackChannelId: "",
      });

      // Reload all bots after creating new one
      await fetchBots();
    } catch (error) {
      console.error("Error creating bot:", error);
      toast({
        title: "Error Creating Bot",
        description: error instanceof Error ? error.message : "Failed to create bot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTest = (id: string) => {
    const bot = savedBots.find(b => b.id === id);
    if (bot) setSelectedBotForTest(bot);
  };

  const handleShare = (botId: string) => {
    const shareUrl = `${window.location.origin}/bot/${botId}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`Shareable link copied:\n${shareUrl}`);
  };


  const handleIntegrate = (id: string) => {
    const bot = savedBots.find(b => b.id === id);
    if (bot) setSelectedBotForIntegration(bot);
  };

  const handleEdit = (id: string) => {
    const bot = savedBots.find(b => b.id === id);
    if (bot) setSelectedBotForEdit(bot);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bots/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete bot");
      }

      // Remove bot from UI list
      setSavedBots(prev => prev.filter(bot => bot.id !== id));

      toast({
        title: "Bot Deleted",
        description: data.message || "Bot and its data were deleted successfully.",
      });
    } catch (error) {
      console.error("Delete bot error:", error);
      toast({
        title: "Error Deleting Bot",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-medium mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              tasteAI Studio
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create intelligent, customized AI bots tailored to your specific needs.
              Configure everything from personality to capabilities with our intuitive builder.
            </p>
          </div>

          <Card className="shadow-strong border-0">
            <CardHeader className="space-y-1 pb-8">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Configure Your Bot
              </CardTitle>
              <CardDescription className="text-base">
                Fill in the details below to create your custom AI assistant
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <CollapsibleSection title="Basic Information" icon={<User className="w-5 h-5 text-primary" />} defaultOpen={true}>
                  <BasicInfoSection botConfig={botConfig} updateConfig={updateConfig} />
                </CollapsibleSection>
                <CollapsibleSection title="Website & Content" icon={<Globe className="w-5 h-5 text-primary" />}>
                  <WebsiteSection botConfig={botConfig} updateConfig={updateConfig} />
                </CollapsibleSection>
                <CollapsibleSection title="Voice Configuration" icon={<Mic className="w-5 h-5 text-primary" />}>
                  <VoiceSection botConfig={botConfig} updateConfig={updateConfig} />
                </CollapsibleSection>
                <CollapsibleSection title="Language Support" icon={<Languages className="w-5 h-5 text-primary" />}>
                  <LanguageSection botConfig={botConfig} updateConfig={updateConfig} />
                </CollapsibleSection>
                <CollapsibleSection title="Persona & Behavior" icon={<Brain className="w-5 h-5 text-primary" />}>
                  <PersonaSection botConfig={botConfig} updateConfig={updateConfig} />
                </CollapsibleSection>
                <CollapsibleSection title="Add Bot to Slack Channel" icon={<MessageSquare className="w-5 h-5 text-primary" />}>
                  <SlackSection botConfig={botConfig} updateConfig={updateConfig} />
                </CollapsibleSection>

                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-gradient-primary hover:opacity-90 shadow-medium px-8 py-3 text-lg font-semibold"
                  >
                    <Bot className="w-5 h-5 mr-2" />
                    Create Bot
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {savedBots.length > 0 && (
          <div className="w-full px-4 py-12">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Your Bots</h2>
                <p className="text-lg text-muted-foreground">
                  Manage and interact with your created AI assistants
                </p>
              </div>

              {/* Show only a limited number of bots */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedBots.slice(0, visibleBotCount).map(bot => (
                  <BotCard
                    key={bot.id}
                    bot={bot}
                    onTest={handleTest}
                    onShare={handleShare}
                    onIntegrate={handleIntegrate}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Show More / Show Less buttons */}
              <div className="flex justify-center gap-4 pt-6">
                {visibleBotCount < savedBots.length && (
                  <Button onClick={handleShowMore} variant="outline">
                    Show More
                  </Button>
                )}
                {visibleBotCount > 3 && (
                  <Button onClick={handleShowLess} variant="ghost">
                    Show Less
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedBotForTest && (
        <ChatBot bot={selectedBotForTest} onClose={() => setSelectedBotForTest(null)} />
      )}

      {selectedBotForIntegration && (
        <IntegrationModal
          isOpen={!!selectedBotForIntegration}
          onClose={() => setSelectedBotForIntegration(null)}
          botId={selectedBotForIntegration.id}
          botName={selectedBotForIntegration.name}
        />
      )}

      {selectedBotForEdit && (
        <EditBotModal
          isOpen={!!selectedBotForEdit}
          onClose={() => setSelectedBotForEdit(null)}
          bot={selectedBotForEdit}
          onBotUpdated={fetchBots}
        />
      )}
    </>
  );
};
