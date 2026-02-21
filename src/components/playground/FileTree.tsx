import { File, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";

interface FileTreeProps {
  files: Array<{ file_path: string; content: string }>;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
  isFile: boolean;
}

function buildTree(files: Array<{ file_path: string }>): TreeNode[] {
  const root: TreeNode[] = [];
  for (const file of files) {
    const parts = file.file_path.replace(/^\//, "").split("/");
    let current = root;
    let currentPath = "";
    for (let i = 0; i < parts.length; i++) {
      currentPath += "/" + parts[i];
      const existing = current.find((n) => n.name === parts[i]);
      if (existing) {
        current = existing.children;
      } else {
        const node: TreeNode = {
          name: parts[i],
          path: currentPath,
          children: [],
          isFile: i === parts.length - 1,
        };
        current.push(node);
        current = node.children;
      }
    }
  }
  return root;
}

const TreeItem = ({ node, selectedFile, onSelectFile, depth = 0 }: {
  node: TreeNode;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  depth?: number;
}) => {
  const [open, setOpen] = useState(true);
  const isSelected = node.path === selectedFile;

  if (node.isFile) {
    return (
      <button
        onClick={() => onSelectFile(node.path)}
        className={`w-full flex items-center gap-2 px-2 py-1 text-xs rounded hover:bg-secondary/80 transition-colors ${
          isSelected ? "bg-secondary text-foreground" : "text-muted-foreground"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <File className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground rounded hover:bg-secondary/80 transition-colors"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {open ? <FolderOpen className="w-3.5 h-3.5 shrink-0" /> : <Folder className="w-3.5 h-3.5 shrink-0" />}
        <span className="truncate">{node.name}</span>
      </button>
      {open && node.children.map((child) => (
        <TreeItem key={child.path} node={child} selectedFile={selectedFile} onSelectFile={onSelectFile} depth={depth + 1} />
      ))}
    </div>
  );
};

export const FileTree = ({ files, selectedFile, onSelectFile }: FileTreeProps) => {
  const tree = buildTree(files);

  return (
    <div className="h-full overflow-y-auto py-2">
      <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Explorer
      </p>
      {tree.map((node) => (
        <TreeItem key={node.path} node={node} selectedFile={selectedFile} onSelectFile={onSelectFile} />
      ))}
    </div>
  );
};
