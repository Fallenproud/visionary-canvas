import { Monitor, FolderTree } from "lucide-react";
import { motion } from "framer-motion";

type RightPaneView = "preview" | "explorer";

interface RightPaneToggleProps {
  value: RightPaneView;
  onChange: (value: RightPaneView) => void;
}

export const RightPaneToggle = ({ value, onChange }: RightPaneToggleProps) => {
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center rounded-full bg-card/80 backdrop-blur-md border border-border/30 shadow-lg shadow-black/10 p-0.5 text-xs font-medium">
        {(["preview", "explorer"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-colors z-10 ${
              value === tab
                ? "text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {value === tab && (
              <motion.div
                layoutId="right-pane-tab"
                className="absolute inset-0 bg-accent rounded-full shadow-sm shadow-accent/20"
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab === "preview" ? <Monitor className="w-3 h-3" /> : <FolderTree className="w-3 h-3" />}
              {tab === "preview" ? "Preview" : "Explorer"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
