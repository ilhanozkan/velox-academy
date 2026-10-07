"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ActionIcon, Button, Center, Text, Tooltip } from "@mantine/core";
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
  // path -> { saved, current, loading }
  const [files, setFiles] = useState({});
  const saveTimers = useRef({});

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

      if (files[path]) return;
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

  // Files created or deleted from the terminal show up in the explorer.
  useEffect(() => {
    if (!socket) return;
    let timer;
    const onRefresh = () => {
      clearTimeout(timer);
      timer = setTimeout(loadTree, 300);
    };
    socket.on("file:refresh", onRefresh);
    return () => {
      clearTimeout(timer);
      socket.off("file:refresh", onRefresh);
    };
  }, [socket, loadTree]);

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
    saveTimers.current[path] = setTimeout(() => save(path, content), SAVE_DELAY_MS);
  };

  // Save first, then run; the old button could run the previous version of a
  // file edited less than a second ago.
  const run = useCallback(async () => {
    if (!activeFile || !socket) return;
    const file = files[activeFile];

    clearTimeout(saveTimers.current[activeFile]);
    if (file && file.current !== file.saved) await save(activeFile, file.current);
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
                path={activeFile}
                language={getFileMode({ selectedFile: activeFile })}
                value={active.current}
                onChange={handleChange}
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
