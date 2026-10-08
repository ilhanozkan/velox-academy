"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Center, Loader, SimpleGrid, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import api, { errorMessage } from "@/lib/api";
import PageHeader from "@/components/PageHeader/PageHeader";
import ErrorState from "@/components/ErrorState/ErrorState";
import TrainingCard from "./TrainingCard";

const TrainingsPage = () => {
  const router = useRouter();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/trainings");
      setTrainings(data.trainings);
    } catch (err) {
      setError(errorMessage(err, "Eğitimler yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Enrollment returns immediately; the sandbox is prepared in the
  // background and the workspace shows its progress.
  const openTraining = async (training) => {
    if (!training.isEnrolled) {
      setEnrollingId(training.id);
      try {
        await api.post(`/trainings/${training.id}/enroll`);
      } catch (err) {
        if (err?.response?.status !== 409) {
          setEnrollingId(null);
          notifications.show({ color: "red", title: "Kayıt olunamadı", message: errorMessage(err) });
          return;
        }
      }
    }

    router.push(`/egitimler/${training.id}`);
  };

  return (
    <>
      <PageHeader
        title="Eğitimler"
        description="Bir eğitim seçin; sanal makineniz sizin için hazırlansın."
      />

      {error ? <ErrorState message={error} onRetry={load} /> : null}

      {loading ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : null}

      {!loading && !error && trainings.length === 0 ? (
        <Text c="dimmed">Henüz yayınlanmış bir eğitim yok.</Text>
      ) : null}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {trainings.map((training) => (
          <TrainingCard
            key={training.id}
            training={training}
            onOpen={openTraining}
            loading={enrollingId === training.id}
          />
        ))}
      </SimpleGrid>
    </>
  );
};

export default TrainingsPage;
