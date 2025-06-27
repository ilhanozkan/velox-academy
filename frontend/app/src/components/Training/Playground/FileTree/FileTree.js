"use client";
import styles from "./FileTree.module.css";

const FileTreeNode = ({ fileName, nodes, onSelect, path }) => {
  const isDir = !!nodes;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (isDir) return;
        onSelect(path);
      }}
      className={styles.filesContainer}
    >
      <p className={isDir ? "" : styles.fileNode}>
        {isDir ? "📁" : "🗎"} {fileName}
      </p>
      {nodes && fileName !== "node_modules" && (
        <ul>
          {Object.keys(nodes).map((child) => (
            <li key={child}>
              <FileTreeNode
                onSelect={onSelect}
                path={path + child}
                fileName={child}
                nodes={nodes[child]}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const FileTree = ({ tree, onSelect }) => {
  return <FileTreeNode onSelect={onSelect} fileName="/" path="" nodes={tree} />;
};
export default FileTree;
