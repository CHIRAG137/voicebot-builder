import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface BotConfig {
  name: string;
  websiteUrl: string;
  description: string;
  file: File | null;
  voiceEnabled: boolean;
  languages: string[];
  isRecommendationEngine: boolean;
  primaryPurpose: string;
  specializationArea: string;
  conversationalTone: string;
  responseStyle: string;
  targetAudience: string;
  keyTopics: string;
  keywords: string;
  customInstructions: string;
}

interface RecommendationSectionProps {
  botConfig: BotConfig;
  updateConfig: (field: keyof BotConfig, value: any) => void;
}

export const RecommendationSection = ({ botConfig, updateConfig }: RecommendationSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="recommendation-engine" className="text-base font-medium">
            Recommendation Engine
          </Label>
          <p className="text-sm text-muted-foreground">
            Enable your bot to work as a recommendation engine to suggest personalized content or products
          </p>
        </div>
        <Switch
          id="recommendation-engine"
          checked={botConfig.isRecommendationEngine}
          onCheckedChange={(checked) => updateConfig("isRecommendationEngine", checked)}
        />
      </div>
    </div>
  );
};