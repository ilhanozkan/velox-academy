import { Terminal as XTerminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";

import "@xterm/xterm/css/xterm.css";
import { useSocket } from "@/contexts/SocketContext";

const Terminal = () => {
  const terminalRef = useRef();
  const isRendered = useRef(false);
  const params = useParams();
  const trainingId = params.trainingId;

  // Get sandbox details from Redux store
  const { sandboxDetails } = useSelector((state) => state.trainings);
  const sandboxData = sandboxDetails[trainingId];

  // Get shared socket connection
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (isRendered.current || !socket) return;
    isRendered.current = true;

    const term = new XTerminal({
      rows: 20,
    });

    term.open(terminalRef.current);

    term.onData((data) => {
      socket.emit("terminal:write", data);
    });

    function onTerminalData(data) {
      term.write(data);
    }

    socket.on("terminal:data", onTerminalData);

    return () => {
      socket.off("terminal:data", onTerminalData);
    };
  }, [socket]);

  return <div ref={terminalRef} id="terminal" />;
};

export default Terminal;
