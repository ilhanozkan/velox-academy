"use client";

import { useEffect, useRef } from "react";
import { Terminal as XTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

import { useSocket } from "@/contexts/SocketContext";
import classes from "./Terminal.module.css";

/**
 * Shell of the sandbox VM. The terminal follows the size of its panel (it was
 * fixed at 20 rows) and is disposed when the panel unmounts.
 */
const Terminal = ({ active }) => {
  const { socket } = useSocket();
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const fitRef = useRef(null);

  useEffect(() => {
    if (!socket || !containerRef.current) return;

    const term = new XTerminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "Menlo, 'DejaVu Sans Mono', monospace",
      // navy.8 / navy.0 from the theme, like the editor.
      theme: {
        background: "#121738",
        foreground: "#e6e8f4",
        cursor: "#95a1de",
        selectionBackground: "#34408f",
      },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(containerRef.current);
    termRef.current = term;
    fitRef.current = fit;

    const onData = (data) => term.write(data);
    socket.on("terminal:data", onData);
    const input = term.onData((data) => socket.emit("terminal:write", data));

    const resize = () => {
      // A hidden panel has no size; fitting it would collapse the terminal.
      if (!containerRef.current?.offsetWidth) return;
      fit.fit();
      socket.emit("terminal:resize", { cols: term.cols, rows: term.rows });
    };
    const observer = new ResizeObserver(resize);
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      socket.off("terminal:data", onData);
      input.dispose();
      term.dispose();
      termRef.current = null;
    };
  }, [socket]);

  useEffect(() => {
    if (active) termRef.current?.focus();
  }, [active]);

  return <div ref={containerRef} className={classes.terminal} aria-label="Terminal" />;
};

export default Terminal;
