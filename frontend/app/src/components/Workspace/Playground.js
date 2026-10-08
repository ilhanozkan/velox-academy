"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ActionIcon, Button, Center, Text, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlayerPlay, IconPoint, IconX } from "@tabler/icons-react";

import { useSocket } from "@/contexts/SocketContext";
import { getFileMode } from "@/utils/getFileMode";
import CodeEditor from "./CodeEditor";
import FileTree, { flattenTree } from "./FileTree";
import classes from "./Playground.module.css";

const SAVE_DELAY_MS = 800;
const ACK_TIMEOUT_MS = 3000;

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

/**
 * File explorer, open-file tabs, editor with autosave, and the run button.
 * `onRun(path)` is called after the file has been saved on the sandbox.
 */
const Playground = ({ onRun, running }) => {
  const { socket, isConnected } = useSocket();
  const sandboxFetch = useSandboxFetch();

  const [tree, setTree] = useState({});
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  // path -> { saved, current, loading, error }
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
        if (!socket) return resolve(false);

        const timeout = setTimeout(() => resolve(false), ACK_TIMEOUT_MS);
        socket.emit("file:change", { path, content }, (ack) => {
          clearTimeout(timeout);
          if (ack?.ok)
            setFiles((current) =>
              current[path] ? { ...current, [path]: { ...current[path], saved: content } } : current
            );
          resolve(Boolean(ack?.ok));
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

  const handleEditorMount = useCallback((editor, monaco) => {
    monacoRef.current = monaco;
  }, []);

  // Save first, then run; the old button could run the previous version of a
  // file edited less than a second ago. If the save fails, running would show
  // the output of the old version, so stop.
  const run = useCallback(async () => {
    if (!activeFile || !socket) return;
    const file = files[activeFile];

    clearTimeout(saveTimers.current[activeFile]);
    delete pendingSaves.current[activeFile];
    if (file && file.current !== file.saved && !(await save(activeFile, file.current))) {
      notifications.show({
        color: "red",
        title: "Dosya kaydedilemedi",
        message: "Değişiklikleriniz sanal makineye kaydedilemediği için dosya çalıştırılmadı. Bağlantıyı kontrol edip tekrar deneyin.",
      });
      return;
    }
    onRun(activeFile);
  }, [activeFile, files, onRun, save, socket]);

  const closeFile = (path) => {
    setOpenFiles((current) => {
      const next = current.filter((p) => p !== path);
      if (activeFile === path) setActiveFile(next[next.length - 1] || null);
      return next;
    });
  };

  const active = activeFile ? files[activeFile] : null;

  return (
    <div className={classes.playground}>
      <div className={classes.sidebar}>
        <FileTree tree={tree} selected={activeFile} onSelect={openFile} />
      </div>

      <div className={classes.editorArea}>
        <div className={classes.tabs} role="tablist" aria-label="Açık dosyalar">
          {openFiles.map((path) => {
            const file = files[path];
            const dirty = file && file.current !== file.saved;
            return (
              <div key={path} className={classes.tab} data-active={path === activeFile || undefined}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={path === activeFile}
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

        <div className={classes.editor}>
          {active && !active.loading ? (
            active.error ? (
              <Center h="100%">
                <Text c="red.3">{active.error}</Text>
              </Center>
            ) : (
              <CodeEditor
                path={`/${modelScope}${activeFile}`}
                language={getFileMode({ selectedFile: activeFile })}
                value={active.current}
                onChange={handleChange}
                onMount={handleEditorMount}
              />
            )
          ) : (
            <Center h="100%">
              <Text c="dimmed">Soldaki listeden bir dosya açın.</Text>
            </Center>
          )}

          <Tooltip label="Dosyayı kaydet ve çalıştır" withArrow position="left">
            <Button
              className={classes.runButton}
              leftSection={<IconPlayerPlay size={18} />}
              onClick={run}
              loading={running}
              disabled={!activeFile || !isConnected}
              size="md"
            >
              Çalıştır
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default Playground;
