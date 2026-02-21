import { Share2, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";

export const PlaygroundActions = () => {
  const handleComingSoon = () => toast.info("Coming Soon!");

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComingSoon}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Coming Soon</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleComingSoon}
              className="w-8 h-8 rounded-lg border border-border/30 bg-secondary/80 hover:bg-secondary flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
            >
              <Github className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Coming Soon</TooltipContent>
        </Tooltip>

        <Button
          size="sm"
          onClick={handleComingSoon}
          className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground px-4"
        >
          Publish
        </Button>
      </div>
    </TooltipProvider>
  );
};
