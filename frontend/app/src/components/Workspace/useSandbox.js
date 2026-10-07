"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import api, { errorMessage } from "@/lib/api";

const POLL_INTERVAL_MS = 3000;

/**
 * The learner's sandbox for a training. Creates it when it does not exist and
 * polls while the VM is being provisioned.
 *
 * state: "loading" | "creating" | "running" | "error" | "unavailable"
 */
const useSandbox = (trainingId, { enabled }) => {
  const [sandbox, setSandbox] = useState(null);
  const [state, setState] = useState("loading");
  const [error, setError] = useState(null);
  const timer = useRef(null);

  const apply = useCallback((next) => {
    setSandbox(next);
    setError(next.errorMessage || null);

    if (next.vmStatus === "running") setState("running");
    else if (next.vmStatus === "creating") setState("creating");
    else if (next.vmStatus === "deleted") {
      setState("error");
      setError("Sanal makineniz silinmiş. Yeniden oluşturabilirsiniz.");
    } else setState("error");
  }, []);

  const create = useCallback(
    async ({ recreate = false } = {}) => {
      setState("creating");
      setError(null);
      try {
        const { data } = await api.post(`/trainings/${trainingId}/sandbox`, { recreate });
        apply(data.sandbox);
      } catch (err) {
        // 503: sandboxes are disabled on this server.
        setState(err?.response?.status === 503 ? "unavailable" : "error");
        setError(errorMessage(err, "Sanal makine oluşturulamadı."));
      }
    },
    [trainingId, apply]
  );

  const fetchSandbox = useCallback(async () => {
    try {
      const { data } = await api.get(`/trainings/${trainingId}/sandbox`);
      apply(data.sandbox);
    } catch (err) {
      if (err?.response?.status === 404) return create();
      setState("error");
      setError(errorMessage(err, "Sanal makine bilgileri alınamadı."));
    }
  }, [trainingId, apply, create]);

  useEffect(() => {
    if (enabled) fetchSandbox();
  }, [enabled, fetchSandbox]);

  // Poll while the VM is being created.
  useEffect(() => {
    if (state !== "creating") return;
    timer.current = setTimeout(fetchSandbox, POLL_INTERVAL_MS);
    return () => clearTimeout(timer.current);
  }, [state, sandbox, fetchSandbox]);

  return {
    sandbox,
    state,
    error,
    retry: () => create(),
    recreate: () => create({ recreate: true }),
  };
};

export default useSandbox;
