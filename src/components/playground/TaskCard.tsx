import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink } from "lucide-react";

interface TaskCardProps {
  files: string[];
  onFileClick: (filePath: string) => void;
}

export const TaskCard = ({ files, onFileClick }: TaskCardProps) => {
  if (!files.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mt-2 rounded-lg border border-border/40 bg-background/50 overflow-hidden"
    >
      <div className="px-3 py-2 flex items-center gap-2 border-b border-border/30">
      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">Files updated</span>
        <span className="text-[10px] bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium">
          {files.length}
        </span>
      </div>
      <div className="py-1">
        {files.map((file) => (
          <button
            key={file}
            onClick={() => onFileClick(file)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-secondary/60 transition-colors group text-left"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-muted-foreground group-hover:text-foreground truncate">
              {file}
            </span>
            <ExternalLink className="w-3 h-3 text-muted-foreground/50 group-hover:text-foreground ml-auto shrink-0" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};
