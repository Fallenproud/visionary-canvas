import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeViewerProps {
  filePath: string | null;
  content: string;
}

function getLanguage(filePath: string): string {
  if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) return "tsx";
  if (filePath.endsWith(".jsx") || filePath.endsWith(".js")) return "jsx";
  if (filePath.endsWith(".json")) return "json";
  if (filePath.endsWith(".css")) return "css";
  if (filePath.endsWith(".html")) return "html";
  return "typescript";
}

export const CodeViewer = ({ filePath, content }: CodeViewerProps) => {
  if (!filePath) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        Select a file to view its code
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b border-border/50 text-xs text-muted-foreground bg-secondary/30">
        {filePath}
      </div>
      <div className="flex-1 overflow-auto">
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
      </div>
    </div>
  );
};
