import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleSlackAuth = async () => {
    setIsConnecting(true);
    try {
      // Slack OAuth URL - replace with your actual Slack app client ID
      const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=YOUR_SLACK_CLIENT_ID&scope=chat:write,channels:read&redirect_uri=${encodeURIComponent(window.location.origin + '/slack-callback')}`;
      
      // Open Slack auth in new window
      window.open(slackAuthUrl, 'slack-auth', 'width=600,height=600');
      
      toast({
        title: "Redirecting to Slack",
        description: "Complete the authorization in the new window.",
      });
    } catch (error) {
      console.error("Slack auth error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to Slack. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>
            Manage your account settings and integrations
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">User Profile</h3>
              <p className="text-sm text-muted-foreground">
                Manage your tasteAI Studio account
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Integrations</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">
                      S
                    </div>
                    <div>
                      <p className="font-medium">Slack</p>
                      <p className="text-sm text-muted-foreground">
                        Connect your workspace
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSlackAuth}
                    disabled={isConnecting}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isConnecting ? (
                      "Connecting..."
                    ) : (
                      <>
                        Add to Slack
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};