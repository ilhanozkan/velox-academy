"use client";

import { useEffect, useRef } from "react";

import classes from "./Splitter.module.css";

/**
 * Vertical drag handle between two panes. `onDrag(clientX)` is called while
 * dragging, `onStep(-1 | 1)` for the arrow keys and `onReset` on double click
 * or Home. It is a focusable ARIA separator, so panes can be resized from the
 * keyboard too.
 */
const Splitter = ({ label, value, min, max, onDrag, onStep, onReset, className }) => {
  const dragging = useRef(false);

  // Unmounted mid-drag (e.g. the workspace switched to a loading screen):
  // do not leave the whole page in "resizing" mode.
  useEffect(
    () => () => {
      if (dragging.current) delete document.body.dataset.resizing;
    },
    []
  );

  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    document.body.dataset.resizing = "true";
  };

  const onPointerMove = (event) => {
    if (dragging.current) onDrag(event.clientX);
  };

  const stop = (event) => {
    if (!dragging.current) return;
    dragging.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    delete document.body.dataset.resizing;
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowLeft") onStep(-1);
    else if (event.key === "ArrowRight") onStep(1);
    else if (event.key === "Home") onReset?.();
    else return;
    event.preventDefault();
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      className={[classes.splitter, className].filter(Boolean).join(" ")}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onDoubleClick={onReset}
      onKeyDown={onKeyDown}
    />
  );
};

export default Splitter;
