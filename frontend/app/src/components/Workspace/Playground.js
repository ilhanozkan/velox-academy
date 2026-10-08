"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ActionIcon, Button, Center, Drawer, Kbd, Loader, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconAlertTriangle,
  IconCheck,
  IconFolders,
  IconPlayerPlay,
  IconPoint,
  IconX,
} from "@tabler/icons-react";

import { useSocket } from "@/contexts/SocketContext";
import useStoredState from "@/hooks/useStoredState";
import { modKeyLabel } from "@/lib/platform";
import { getFileMode, languageLabel } from "@/utils/getFileMode";
import CodeEditor from "./CodeEditor";
import FileTree, { flattenTree } from "./FileTree";
import Splitter from "./Splitter";
import classes from "./Playground.module.css";

const SAVE_DELAY_MS = 800;
const ACK_TIMEOUT_MS = 3000;

const TREE_WIDTH = { default: 200, min: 140, max: 420, step: 16 };
const clampTreeWidth = (width) => Math.min(TREE_WIDTH.max, Math.max(TREE_WIDTH.min, Math.round(width)));

const fileName = (path) => path.split("/").pop();

/** Sandbox HTTP helper that sends the access token. */
const useSandboxFetch = () => {
  const { url, token } = useSocket();
  return useCallback(
    async (path) => {
      const response = await fetch(`${url}${path}`, {
        headers: token ? { "x-sandbox-token": token } : {},
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || "İstek başarısız oldu");
      return body;
    },
    [url, token]
  );
};

const SaveStatus = ({ file }) => {
  if (!file || file.loading || file.error) return null;
  if (file.saveError)
    return (
      <span className={classes.statusItem} data-tone="error">
        <IconAlertTriangle size={13} aria-hidden /> Kaydedilemedi
      </span>
    );
  if (file.current !== file.saved)
    return (
      <span className={classes.statusItem}>
        <Loader size={10} color="gray" aria-hidden /> Kaydediliyor…
      </span>
    );
  return (
    <span className={classes.statusItem}>
      <IconCheck size={13} aria-hidden /> Kaydedildi
    </span>
  );
};

/**
 * File explorer, open-file tabs, editor with autosave, and the run button.
 * `onRun(path)` is called after the file has been saved on the sandbox.
 * Shortcuts: Ctrl/⌘+Enter saves and runs, Ctrl/⌘+S saves.
 */
const Playground = ({ onRun, running }) => {
  const { socket, isConnected } = useSocket();
  const sandboxFetch = useSandboxFetch();
  const rootRef = useRef(null);
  const [treeWidth, setTreeWidth] = useStoredState("velox.workspace.treeWidth", TREE_WIDTH.default);
  const [filesOpened, filesDrawer] = useDisclosure(false);
  const [mod] = useState(modKeyLabel);

  const [tree, setTree] = useState({});
  const [treeLoaded, setTreeLoaded] = useState(false);
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  // path -> { saved, current, loading, error, saveError }
  const [files, setFiles] = useState({});
  const saveTimers = useRef({});
  // path -> content waiting for its autosave
  const pendingSaves = useRef({});

  // Monaco keeps its models (one per path) for the whole page session. Prefix
  // them per workspace so another training, user or recreated sandbox never
  // gets the text of a file with the same name; they are disposed on unmount.
  const [modelScope] = useState(() => `ws-${Math.random().toString(36).slice(2, 10)}`);
  const monacoRef = useRef(null);

  const loadTree = useCallback(async () => {
    try {
      const { tree: next } = await sandboxFetch("/files");
      setTree(next || {});
      return next || {};
    } catch (error) {
      console.error("Dosya listesi alınamadı:", error);
      return null;
    } finally {
      setTreeLoaded(true);
    }
  }, [sandboxFetch]);

  const openFile = useCallback(
    async (path) => {
      setActiveFile(path);
      setOpenFiles((current) => (current.includes(path) ? current : [...current, path]));

      // Reload files whose previous load failed.
      if (files[path] && !files[path].error) return;
      setFiles((current) => ({ ...current, [path]: { saved: "", current: "", loading: true } }));
      try {
        const { content } = await sandboxFetch(`/files/content?path=${encodeURIComponent(path)}`);
        setFiles((current) => ({ ...current, [path]: { saved: content, current: content, loading: false } }));
      } catch (error) {
        setFiles((current) => ({
          ...current,
          [path]: { saved: "", current: "", loading: false, error: error.message },
        }));
      }
    },
    [files, sandboxFetch]
  );

  // Load the tree when connected and open the first file once.
  const openedInitialFile = useRef(false);
  useEffect(() => {
    if (!isConnected) return;
    loadTree().then((next) => {
      if (!next || openedInitialFile.current) return;
      openedInitialFile.current = true;
      const first = flattenTree(next)[0];
      if (first) openFile(first);
    });
    // openFile changes with `files`; only reload when the connection changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, loadTree]);

  // An open file changed on the sandbox (terminal, another tab): show the new
  // content unless it has unsaved edits, which win at the next save. A
  // deleted file shows an error instead of being recreated by autosave.
  const reloadFile = useCallback(
    async (path) => {
      let content = null;
      let error = null;
      try {
        ({ content } = await sandboxFetch(`/files/content?path=${encodeURIComponent(path)}`));
      } catch (err) {
        error = err.message;
      }
      setFiles((current) => {
        const file = current[path];
        if (!file || file.loading || file.current !== file.saved) return current;
        if (error) return { ...current, [path]: { ...file, error } };
        if (content === file.saved && !file.error) return current;
        return { ...current, [path]: { saved: content, current: content, loading: false } };
      });
    },
    [sandboxFetch]
  );

  const openPaths = useRef(openFiles);
  useEffect(() => {
    openPaths.current = openFiles;
  }, [openFiles]);

  // Files created or deleted from the terminal show up in the explorer.
  useEffect(() => {
    if (!socket) return;
    let timer;
    const changed = new Set();
    const onRefresh = (path) => {
      if (typeof path === "string") changed.add(path);
      clearTimeout(timer);
      timer = setTimeout(() => {
        loadTree();
        for (const changedPath of changed) if (openPaths.current.includes(changedPath)) reloadFile(changedPath);
        changed.clear();
      }, 300);
    };
    socket.on("file:refresh", onRefresh);
    return () => {
      clearTimeout(timer);
      socket.off("file:refresh", onRefresh);
    };
  }, [socket, loadTree, reloadFile]);

  const save = useCallback(
    (path, content) =>
      new Promise((resolve) => {
        const finish = (ok) => {
          setFiles((current) =>
            current[path]
              ? {
                  ...current,
                  [path]: { ...current[path], saveError: !ok, ...(ok && { saved: content }) },
                }
              : current
          );
          resolve(ok);
        };

        if (!socket) return finish(false);

        const timeout = setTimeout(() => finish(false), ACK_TIMEOUT_MS);
        socket.emit("file:change", { path, content }, (ack) => {
          clearTimeout(timeout);
          finish(Boolean(ack?.ok));
        });
      }),
    [socket]
  );

  const handleChange = (content) => {
    const path = activeFile;
    setFiles((current) => ({ ...current, [path]: { ...current[path], current: content } }));

    clearTimeout(saveTimers.current[path]);
    pendingSaves.current[path] = content;
    saveTimers.current[path] = setTimeout(() => {
      delete pendingSaves.current[path];
      save(path, content);
    }, SAVE_DELAY_MS);
  };

  // Leaving the workspace within the autosave delay used to drop the last
  // edits. Layout effect cleanups run before the socket provider disconnects.
  const socketRef = useRef(socket);
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);
  useLayoutEffect(
    () => () => {
      for (const [path, content] of Object.entries(pendingSaves.current)) {
        clearTimeout(saveTimers.current[path]);
        socketRef.current?.emit("file:change", { path, content });
      }
      pendingSaves.current = {};
    },
    []
  );

  // Warn before closing the tab while edits are not saved yet.
  const hasUnsaved = Object.values(files).some((file) => !file.loading && file.current !== file.saved);
  useEffect(() => {
    if (!hasUnsaved) return;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsaved]);

  // Drop this workspace's Monaco models when it closes.
  useEffect(
    () => () => {
      monacoRef.current?.editor
        .getModels()
        .filter((model) => model.uri.path.startsWith(`/${modelScope}/`) && !model.isAttachedToEditor())
        .forEach((model) => model.dispose());
    },
    [modelScope]
  );

  const saveNow = useCallback(async () => {
    if (!activeFile) return true;
    const file = files[activeFile];
    clearTimeout(saveTimers.current[activeFile]);
    delete pendingSaves.current[activeFile];
    if (file && !file.loading && (file.current !== file.saved || file.saveError))
      return save(activeFile, file.current);
    return true;
  }, [activeFile, files, save]);

  // Save first, then run; the old button could run the previous version of a
  // file edited less than a second ago. If the save fails, running would show
  // the output of the old version, so stop.
  const run = useCallback(async () => {
    if (!activeFile || !socket || !isConnected || running) return;
    if (!(await saveNow())) {
      notifications.show({
        color: "red",
        title: "Dosya kaydedilemedi",
        message: "Değişiklikleriniz sanal makineye kaydedilemediği için dosya çalıştırılmadı. Bağlantıyı kontrol edip tekrar deneyin.",
      });
      return;
    }
    onRun(activeFile);
  }, [activeFile, isConnected, onRun, running, saveNow, socket]);

  // Shortcuts read the latest callbacks through refs: Monaco commands are
  // registered once per editor.
  const runRef = useRef(run);
  const saveNowRef = useRef(saveNow);
  useEffect(() => {
    runRef.current = run;
    saveNowRef.current = saveNow;
  });

  const handleEditorMount = useCallback((editor, monaco) => {
    monacoRef.current = monaco;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => saveNowRef.current());
  }, []);

  // The same shortcuts outside the editor (instructions, results). The
  // terminal keeps Ctrl+S / Ctrl+Enter for the shell.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(".xterm, .monaco-editor")) return;

      if (event.key === "Enter") {
        event.preventDefault();
        runRef.current();
      } else if (event.key === "s" || event.key === "S") {
        event.preventDefault();
        saveNowRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const closeFile = (path) => {
    setOpenFiles((current) => {
      const next = current.filter((p) => p !== path);
      if (activeFile === path) setActiveFile(next[next.length - 1] || null);
      return next;
    });
  };

  const selectFromDrawer = (path) => {
    openFile(path);
    filesDrawer.close();
  };

  const resizeTree = (clientX) => {
    const left = rootRef.current?.getBoundingClientRect().left ?? 0;
    setTreeWidth(clampTreeWidth(clientX - left));
  };

  const active = activeFile ? files[activeFile] : null;
  const language = activeFile ? getFileMode({ selectedFile: activeFile }) : null;
  const canRun = Boolean(activeFile) && isConnected;

  const fileTree = (onSelect, showTitle) =>
    treeLoaded ? (
      <FileTree tree={tree} selected={activeFile} onSelect={onSelect} showTitle={showTitle} />
    ) : (
      <Center h={120}>
        <Loader size="sm" color="gray" />
      </Center>
    );

  return (
    <div className={classes.playground} ref={rootRef}>
      <div className={classes.sidebar} style={{ width: treeWidth }}>
        {fileTree(openFile, true)}
      </div>
      <Splitter
        className={classes.treeSplitter}
        label="Dosya listesinin genişliği"
        value={treeWidth}
        min={TREE_WIDTH.min}
        max={TREE_WIDTH.max}
        onDrag={resizeTree}
        onStep={(direction) => setTreeWidth((width) => clampTreeWidth(width + direction * TREE_WIDTH.step))}
        onReset={() => setTreeWidth(TREE_WIDTH.default)}
      />

      <div className={classes.editorArea}>
        <div className={classes.toolbar}>
          <ActionIcon
            hiddenFrom="sm"
            variant="subtle"
            color="gray"
            size="lg"
            radius={0}
            className={classes.filesButton}
            onClick={filesDrawer.open}
            aria-label="Dosyaları göster"
          >
            <IconFolders size={18} />
          </ActionIcon>

          {/* Plain buttons, not ARIA tabs: each entry also has a close button. */}
          <div className={classes.tabs} role="group" aria-label="Açık dosyalar">
            {openFiles.map((path) => {
              const file = files[path];
              const dirty = file && file.current !== file.saved;
              return (
                <div key={path} className={classes.tab} data-active={path === activeFile || undefined}>
                  <button
                    type="button"
                    aria-current={path === activeFile ? "true" : undefined}
                    className={classes.tabButton}
                    onClick={() => setActiveFile(path)}
                    title={path}
                  >
                    {fileName(path)}
                    {dirty ? <IconPoint size={14} aria-label="kaydedilmedi" /> : null}
                  </button>
                  <ActionIcon
                    size="xs"
                    variant="transparent"
                    color="gray"
                    onClick={() => closeFile(path)}
                    aria-label={`${fileName(path)} dosyasını kapat`}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                </div>
              );
            })}
          </div>

          <Tooltip
            label={
              <>
                Kaydet ve çalıştır <Kbd size="xs">{mod}</Kbd> + <Kbd size="xs">Enter</Kbd>
              </>
            }
            position="bottom-end"
          >
            <Button
              className={classes.runButton}
              size="xs"
              color="teal"
              leftSection={<IconPlayerPlay size={14} />}
              onClick={run}
              loading={running}
              disabled={!canRun}
            >
              Çalıştır
            </Button>
          </Tooltip>
        </div>

        <div className={classes.editor}>
          {active && !active.loading ? (
            active.error ? (
              <Center h="100%">
                <Text c="red.3">{active.error}</Text>
              </Center>
            ) : (
              <CodeEditor
                path={`/${modelScope}${activeFile}`}
                fileName={fileName(activeFile)}
                language={language}
                value={active.current}
                onChange={handleChange}
                onMount={handleEditorMount}
              />
            )
          ) : active?.loading ? (
            <Center h="100%">
              <Loader color="gray" size="sm" />
            </Center>
          ) : (
            <Center h="100%" px="md">
              <Text c="navy.2" ta="center">
                {treeLoaded && !flattenTree(tree).length
                  ? "Çalışma alanında henüz dosya yok. Terminalden bir dosya oluşturabilirsiniz."
                  : "Düzenlemek için listeden bir dosya açın."}
              </Text>
            </Center>
          )}
        </div>

        <div className={classes.statusBar}>
          {language ? <span className={classes.statusItem}>{languageLabel(language)}</span> : null}
          <SaveStatus file={active} />
          <span className={classes.shortcuts}>
            <Kbd size="xs">{mod}</Kbd>+<Kbd size="xs">Enter</Kbd> çalıştır · <Kbd size="xs">{mod}</Kbd>+
            <Kbd size="xs">S</Kbd> kaydet
          </span>
        </div>
      </div>

      <Drawer
        opened={filesOpened}
        onClose={filesDrawer.close}
        title="Dosyalar"
        position="left"
        size="80%"
        classNames={{ content: classes.drawerContent, header: classes.drawerHeader, body: classes.drawerBody }}
      >
        {fileTree(selectFromDrawer, false)}
      </Drawer>
    </div>
  );
};

export default Playground;
