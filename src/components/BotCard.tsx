import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bot, Globe, Mic, MicOff, MoreHorizontal, Play, Share, Code, Trash2, Edit } from "lucide-react";

interface BotCardProps {
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
  onTest: (id: string) => void;
  onShare: (id: string) => void;
  onIntegrate: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const BotCard = ({ bot, onTest, onShare, onIntegrate, onEdit, onDelete }: BotCardProps) => {
  return (
    <Card className="relative group hover:shadow-strong transition-all duration-300 border-border/50 hover:border-primary/20">
      {/* Three dots menu */}
      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onShare(bot.id)} className="cursor-pointer">
              <Share className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onIntegrate(bot.id)} className="cursor-pointer">
              <Code className="mr-2 h-4 w-4" />
              Integrate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(bot.id)} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTest(bot.id)} className="cursor-pointer">
              <Play className="mr-2 h-4 w-4" />
              Test
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(bot.id)} 
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold mb-1 pr-8">{bot.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Globe className="w-3 h-3" />
              <span className="truncate">{bot.websiteUrl}</span>
            </div>
          </div>
        </div>
        <CardDescription className="text-sm line-clamp-2">
          {bot.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Features */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Voice</span>
            <div className="flex items-center gap-1">
              {bot.voiceEnabled ? (
                <>
                  <Mic className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">Enabled</span>
                </>
              ) : (
                <>
                  <MicOff className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Disabled</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Languages</span>
            <div className="flex flex-wrap gap-1">
              {bot.languages.map((language) => (
                <Badge key={language} variant="secondary" className="text-xs">
                  {language}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Purpose</span>
              <span className="text-sm text-muted-foreground">{bot.primaryPurpose}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Tone</span>
              <span className="text-sm text-muted-foreground">{bot.conversationalTone}</span>
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div className="pt-2">
          <Button 
            onClick={() => onTest(bot.id)}
            className="w-full bg-gradient-primary hover:opacity-90"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            Test Bot
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};