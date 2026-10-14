"use client";

import { useCallback, useEffect, useState } from "react";

import api, { errorMessage } from "@/lib/api";

/** Training with its curriculum and the user's progress. */
const useTrainingDetail = (trainingId) => {
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/trainings/${trainingId}`);
      setTraining(data.training);
    } catch (err) {
      setError(
        err?.response?.status === 404 ? "Bu eğitim bulunamadı." : errorMessage(err, "Eğitim yüklenemedi.")
      );
    } finally {
      setLoading(false);
    }
  }, [trainingId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { training, setTraining, loading, error, reload };
};

export default useTrainingDetail;
