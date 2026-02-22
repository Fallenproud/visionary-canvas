import { motion, AnimatePresence } from "framer-motion";
import { Loader2, FileCode, Check } from "lucide-react";
import type { AgentStatus } from "@/types/chat";

interface FileActivityIndicatorProps {
  status: AgentStatus;
  activeFiles?: string[];
}

export const FileActivityIndicator = ({ status, activeFiles = [] }: FileActivityIndicatorProps) => {
  const isActive = status.state === "writing" || status.state === "applying";

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mx-3 mb-2"
        >
          <div className="rounded-lg bg-accent/10 border border-accent/20 px-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-3 h-3 text-accent" />
              </motion.div>
              <span className="text-[11px] font-medium text-accent">
                {status.state === "writing" ? "AIKO is generating code..." : "Saving files..."}
              </span>
            </div>
            {activeFiles.length > 0 && (
              <div className="space-y-0.5 mt-1.5">
                {activeFiles.slice(0, 5).map((file, i) => (
                  <motion.div
                    key={file}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
                  >
                    <FileCode className="w-3 h-3 text-accent/60" />
                    <span className="truncate">{file}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Small inline indicator for individual file entries showing live write activity */
export const FilePulse = ({ isWriting }: { isWriting: boolean }) => (
  <AnimatePresence>
    {isWriting && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="ml-auto shrink-0"
      >
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-accent shadow-sm shadow-accent/40"
        />
      </motion.div>
    )}
  </AnimatePresence>
);

/** Toast-like notification shown when files are changed */
export const FileChangeNotification = ({ files, onDismiss, onFileClick }: { files: string[]; onDismiss: () => void; onFileClick?: (file: string) => void }) => (
  <AnimatePresence>
    {files.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -5, scale: 0.95 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="mx-3 mb-2"
      >
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-green-400" />
              <span className="text-[11px] font-medium text-green-400">
                {files.length} file{files.length > 1 ? "s" : ""} updated
              </span>
            </div>
            <button
              onClick={onDismiss}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              dismiss
            </button>
          </div>
          <div className="space-y-0.5 mt-1">
            {files.slice(0, 4).map((file, i) => (
              <motion.button
                key={file}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-accent transition-colors w-full text-left"
                onClick={() => onFileClick?.(file)}
                title="Click to view diff"
              >
                <FileCode className="w-3 h-3 text-green-400/60" />
                <span className="truncate">{file}</span>
              </motion.button>
            ))}
            {files.length > 4 && (
              <span className="text-[10px] text-muted-foreground/60 pl-4">
                +{files.length - 4} more
              </span>
            )}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
