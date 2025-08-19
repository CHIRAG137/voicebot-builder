import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";
import { WebsiteScraper } from "@/components/WebsiteScraper";

interface WebsiteSectionProps {
  botConfig: any;
  updateConfig: (field: string, value: any) => void;
}

export const WebsiteSection = ({ botConfig, updateConfig }: WebsiteSectionProps) => {
  return (
    <div className="space-y-6">
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
      
      <WebsiteScraper websiteUrl={botConfig.websiteUrl} />
    </div>
  );
};