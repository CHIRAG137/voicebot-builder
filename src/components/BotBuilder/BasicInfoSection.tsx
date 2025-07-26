import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Globe, FileText } from "lucide-react";

interface BasicInfoSectionProps {
  botConfig: any;
  updateConfig: (field: string, value: any) => void;
}

export const BasicInfoSection = ({ botConfig, updateConfig }: BasicInfoSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="botName" className="text-sm font-medium">
            Bot Name *
          </Label>
          <Input
            id="botName"
            placeholder="Enter your bot's name"
            value={botConfig.name}
            onChange={(e) => updateConfig("name", e.target.value)}
            className="h-11"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="websiteUrl" className="text-sm font-medium flex items-center gap-1">
            <Globe className="w-4 h-4" />
            Website URL
          </Label>
          <Input
            id="websiteUrl"
            placeholder="https://your-website.com"
            value={botConfig.websiteUrl}
            onChange={(e) => updateConfig("websiteUrl", e.target.value)}
            className="h-11"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium flex items-center gap-1">
          <FileText className="w-4 h-4" />
          Bot Description *
        </Label>
        <Textarea
          id="description"
          placeholder="Describe what your bot does and its main capabilities..."
          value={botConfig.description}
          onChange={(e) => updateConfig("description", e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </div>
    </div>
  );
};