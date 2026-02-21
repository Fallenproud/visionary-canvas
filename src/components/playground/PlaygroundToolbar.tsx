import { Cloud, TrendingUp, Code2, Palette, MoreHorizontal } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface PlaygroundToolbarProps {
  onWorkflowsClick: () => void;
}

const toolbarItems: Array<{ icon: typeof Cloud; label: string; comingSoon: boolean; action?: string }> = [
  { icon: Cloud, label: "Cloud", comingSoon: true },
  { icon: TrendingUp, label: "Analytics", comingSoon: false, action: "workflows" },
  { icon: Code2, label: "Code", comingSoon: true },
  { icon: Palette, label: "Design", comingSoon: true },
  { icon: MoreHorizontal, label: "More", comingSoon: true },
];

export const PlaygroundToolbar = ({ onWorkflowsClick }: PlaygroundToolbarProps) => {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1">
        {toolbarItems.map((item) => (
          <Tooltip key={item.label}>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  if (item.comingSoon) {
                    toast.info("Coming Soon!");
                  } else if (item.action === "workflows") {
                    onWorkflowsClick();
                  }
                }}
                className="w-8 h-8 rounded-lg bg-secondary/80 hover:bg-secondary border border-border/30 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
              >
                <item.icon className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {item.comingSoon ? `${item.label} — Coming Soon` : item.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};
