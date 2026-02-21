import { Monitor, FolderTree } from "lucide-react";

type RightPaneView = "preview" | "explorer";

interface RightPaneToggleProps {
  value: RightPaneView;
  onChange: (value: RightPaneView) => void;
}

export const RightPaneToggle = ({ value, onChange }: RightPaneToggleProps) => {
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center rounded-full bg-background border border-border shadow-sm p-0.5 text-xs font-medium">
        <button
          onClick={() => onChange("preview")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            value === "preview"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Monitor className="w-3 h-3" />
          Preview
        </button>
        <button
          onClick={() => onChange("explorer")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            value === "explorer"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FolderTree className="w-3 h-3" />
          Explorer
        </button>
      </div>
    </div>
  );
};
