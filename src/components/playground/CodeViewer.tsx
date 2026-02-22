import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeViewerProps {
  filePath: string | null;
  content: string;
  isEditing?: boolean;
  onSave?: (content: string) => void;
}

function getLanguage(filePath: string): string {
  if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) return "tsx";
  if (filePath.endsWith(".jsx") || filePath.endsWith(".js")) return "jsx";
  if (filePath.endsWith(".json")) return "json";
  if (filePath.endsWith(".css")) return "css";
  if (filePath.endsWith(".html")) return "html";
  if (filePath.endsWith(".md")) return "markdown";
  return "typescript";
}

export const CodeViewer = ({ filePath, content, isEditing = false, onSave }: CodeViewerProps) => {
  const [editContent, setEditContent] = useState(content);

  useEffect(() => {
    setEditContent(content);
  }, [content, filePath]);

  if (!filePath) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        Select a file to view its code
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b border-border/50 text-xs text-muted-foreground bg-secondary/30 flex items-center justify-between">
        <span>{filePath}</span>
        {isEditing && onSave && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSave(editContent)}
            className="h-6 px-2 text-xs gap-1"
          >
            <Save className="w-3 h-3" />
            Save
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-full bg-transparent text-foreground font-mono text-[13px] leading-[1.5] p-4 resize-none outline-none"
            spellCheck={false}
          />
        ) : (
          <SyntaxHighlighter
            language={getLanguage(filePath)}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: "16px",
              background: "transparent",
              fontSize: "13px",
              lineHeight: "1.5",
            }}
            showLineNumbers
          >
            {content}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
};
