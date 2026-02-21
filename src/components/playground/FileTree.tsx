import { File, Folder, FolderOpen, CircleDot } from "lucide-react";
import { useState } from "react";

interface FileTreeProps {
  files: Array<{ file_path: string; content: string }>;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  changedFiles?: string[];
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

/** Check if a folder contains any changed file */
function hasChangedChild(node: TreeNode, changedSet: Set<string>): boolean {
  if (node.isFile) return changedSet.has(node.path);
  return node.children.some((c) => hasChangedChild(c, changedSet));
}

const TreeItem = ({ node, selectedFile, onSelectFile, changedSet, depth = 0 }: {
  node: TreeNode;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  changedSet: Set<string>;
  depth?: number;
}) => {
  const [open, setOpen] = useState(true);
  const isSelected = node.path === selectedFile;
  const isChanged = node.isFile && changedSet.has(node.path);
  const folderHasChanges = !node.isFile && hasChangedChild(node, changedSet);

  if (node.isFile) {
    return (
      <button
        onClick={() => onSelectFile(node.path)}
        className={`w-full flex items-center gap-2 px-2 py-1 text-xs rounded hover:bg-secondary/80 transition-colors ${
          isSelected ? "bg-secondary text-foreground" : "text-muted-foreground"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <File className={`w-3.5 h-3.5 shrink-0 ${isChanged ? "text-green-400" : ""}`} />
        <span className={`truncate ${isChanged ? "text-green-400 font-medium" : ""}`}>{node.name}</span>
        {isChanged && (
          <CircleDot className="w-3 h-3 shrink-0 text-green-400 ml-auto" />
        )}
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
        {open ? <FolderOpen className={`w-3.5 h-3.5 shrink-0 ${folderHasChanges ? "text-green-400" : ""}`} /> : <Folder className={`w-3.5 h-3.5 shrink-0 ${folderHasChanges ? "text-green-400" : ""}`} />}
        <span className={`truncate ${folderHasChanges ? "text-green-400" : ""}`}>{node.name}</span>
      </button>
      {open && node.children.map((child) => (
        <TreeItem key={child.path} node={child} selectedFile={selectedFile} onSelectFile={onSelectFile} changedSet={changedSet} depth={depth + 1} />
      ))}
    </div>
  );
};

export const FileTree = ({ files, selectedFile, onSelectFile, changedFiles = [] }: FileTreeProps) => {
  const tree = buildTree(files);
  // Normalize paths to match tree format (leading slash)
  const changedSet = new Set(changedFiles.map((f) => f.startsWith("/") ? f : `/${f}`));

  return (
    <div className="h-full overflow-y-auto py-2">
      <div className="px-3 py-1 flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Explorer
        </p>
        {changedFiles.length > 0 && (
          <span className="text-[10px] font-medium text-green-400 bg-green-400/10 rounded px-1.5 py-0.5">
            {changedFiles.length} changed
          </span>
        )}
      </div>
      {tree.map((node) => (
        <TreeItem key={node.path} node={node} selectedFile={selectedFile} onSelectFile={onSelectFile} changedSet={changedSet} />
      ))}
    </div>
  );
};
