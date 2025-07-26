import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Mic, MicOff } from "lucide-react";

interface VoiceSectionProps {
  botConfig: any;
  updateConfig: (field: string, value: any) => void;
}

export const VoiceSection = ({ botConfig, updateConfig }: VoiceSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Mic className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold">Voice Configuration</h3>
      </div>
      
      <Card className="p-6 border border-border/50 bg-card/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium flex items-center gap-2">
              {botConfig.voiceEnabled ? (
                <Mic className="w-4 h-4 text-success" />
              ) : (
                <MicOff className="w-4 h-4 text-muted-foreground" />
              )}
              Voice Interaction
            </Label>
            <p className="text-sm text-muted-foreground">
              Enable voice capabilities for your bot to speak and listen
            </p>
          </div>
          <Switch
            checked={botConfig.voiceEnabled}
            onCheckedChange={(checked) => updateConfig("voiceEnabled", checked)}
          />
        </div>
        
        {botConfig.voiceEnabled && (
          <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm text-accent-foreground">
              🎉 Voice features enabled! Your bot will be able to:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Convert text responses to speech</li>
              <li>• Accept voice input from users</li>
              <li>• Provide natural conversation experience</li>
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
};