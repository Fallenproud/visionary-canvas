import { Monitor, FolderTree, GitBranch } from "lucide-react";
import { motion } from "framer-motion";

export type RightPaneView = "preview" | "explorer" | "workflows";

interface RightPaneToggleProps {
  value: RightPaneView;
  onChange: (value: RightPaneView) => void;
}

const tabConfig: Array<{ key: RightPaneView; icon: typeof Monitor; label: string }> = [
  { key: "preview", icon: Monitor, label: "Preview" },
  { key: "explorer", icon: FolderTree, label: "Explorer" },
  { key: "workflows", icon: GitBranch, label: "Workflows" },
];

export const RightPaneToggle = ({ value, onChange }: RightPaneToggleProps) => {
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center rounded-full bg-card/80 backdrop-blur-md border border-border/30 shadow-lg shadow-black/10 p-0.5 text-xs font-medium">
        {tabConfig.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-colors z-10 ${
              value === tab.key
                ? "text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {value === tab.key && (
              <motion.div
                layoutId="right-pane-tab"
                className="absolute inset-0 bg-accent rounded-full shadow-sm shadow-accent/20"
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
