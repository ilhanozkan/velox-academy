"use client";

import { useState } from "react";
import { IconChevronDown, IconChevronRight, IconFile, IconFolder } from "@tabler/icons-react";

import classes from "./FileTree.module.css";

const sortEntries = (nodes) =>
  Object.keys(nodes || {}).sort((a, b) => {
    const aDir = nodes[a] !== null;
    const bDir = nodes[b] !== null;
    if (aDir !== bDir) return aDir ? -1 : 1;
    return a.localeCompare(b, "tr");
  });

const Node = ({ name, nodes, path, depth, selected, onSelect }) => {
  const isDir = nodes !== null;
  const [open, setOpen] = useState(true);
  const indent = { paddingLeft: `calc(${depth} * 0.85rem + 0.5rem)` };

  if (!isDir) {
    return (
      <li>
        <button
          type="button"
          className={classes.item}
          data-active={selected === path || undefined}
          aria-current={selected === path ? "true" : undefined}
          style={indent}
          onClick={() => onSelect(path)}
          title={path}
        >
          <IconFile size={15} aria-hidden />
          <span className={classes.name}>{name}</span>
        </button>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        className={classes.item}
        style={indent}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <IconChevronDown size={14} aria-hidden /> : <IconChevronRight size={14} aria-hidden />}
        <IconFolder size={15} aria-hidden />
        <span className={classes.name}>{name}</span>
      </button>
      {open ? (
        <ul className={classes.list}>
          {sortEntries(nodes).map((child) => (
            <Node
              key={child}
              name={child}
              nodes={nodes[child]}
              path={`${path}/${child}`}
              depth={depth + 1}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
};

/**
 * Sandbox file explorer. Paths are absolute within the workspace ("/a/b.sql");
 * nested paths used to be joined without a separator ("dirfile.sql").
 */
const FileTree = ({ tree, selected, onSelect }) => (
  <nav className={classes.tree} aria-label="Dosyalar">
    <div className={classes.title}>Dosyalar</div>
    <ul className={classes.list}>
      {sortEntries(tree).map((name) => (
        <Node
          key={name}
          name={name}
          nodes={tree[name]}
          path={`/${name}`}
          depth={0}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
    </ul>
  </nav>
);

/** All file paths of a tree, in display order. */
export const flattenTree = (tree, prefix = "") =>
  sortEntries(tree).flatMap((name) =>
    tree[name] === null ? [`${prefix}/${name}`] : flattenTree(tree[name], `${prefix}/${name}`)
  );

export default FileTree;
