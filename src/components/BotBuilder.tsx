import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Bot, Sparkles, User, Mic, Languages, Brain } from "lucide-react";
import { BasicInfoSection } from "./BotBuilder/BasicInfoSection";
import { VoiceSection } from "./BotBuilder/VoiceSection";
import { LanguageSection } from "./BotBuilder/LanguageSection";
import { PersonaSection } from "./BotBuilder/PersonaSection";
import { useToast } from "@/hooks/use-toast";

interface BotConfig {
  name: string;
  websiteUrl: string;
  description: string;
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
}

export const BotBuilder = () => {
  const { toast } = useToast();
  const [botConfig, setBotConfig] = useState<BotConfig>({
    name: "",
    websiteUrl: "",
    description: "",
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
  });

  const updateConfig = (field: keyof BotConfig, value: any) => {
    setBotConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Bot Configuration Saved!",
      description: `${botConfig.name} has been created successfully.`,
    });
    console.log("Bot Configuration:", botConfig);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-medium mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            AI Bot Builder
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create intelligent, customized AI bots tailored to your specific needs. 
            Configure everything from personality to capabilities with our intuitive builder.
          </p>
        </div>

        {/* Main Form */}
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
              {/* Basic Information */}
              <CollapsibleSection
                title="Basic Information"
                icon={<User className="w-5 h-5 text-primary" />}
                defaultOpen={true}
              >
                <BasicInfoSection botConfig={botConfig} updateConfig={updateConfig} />
              </CollapsibleSection>
              
              {/* Voice Configuration */}
              <CollapsibleSection
                title="Voice Configuration"
                icon={<Mic className="w-5 h-5 text-primary" />}
              >
                <VoiceSection botConfig={botConfig} updateConfig={updateConfig} />
              </CollapsibleSection>
              
              {/* Language Configuration */}
              <CollapsibleSection
                title="Language Support"
                icon={<Languages className="w-5 h-5 text-primary" />}
              >
                <LanguageSection botConfig={botConfig} updateConfig={updateConfig} />
              </CollapsibleSection>
              
              {/* Persona Configuration */}
              <CollapsibleSection
                title="Persona & Behavior"
                icon={<Brain className="w-5 h-5 text-primary" />}
              >
                <PersonaSection botConfig={botConfig} updateConfig={updateConfig} />
              </CollapsibleSection>
              
              {/* Submit Button */}
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
    </div>
  );
};