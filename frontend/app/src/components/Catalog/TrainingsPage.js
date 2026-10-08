"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Group, SegmentedControl, Select, SimpleGrid, Text, TextInput, VisuallyHidden } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBooks, IconSearch, IconX } from "@tabler/icons-react";

import api, { errorMessage } from "@/lib/api";
import { matchesSearch } from "@/lib/search";
import PageHeader from "@/components/PageHeader/PageHeader";
import ErrorState from "@/components/ErrorState/ErrorState";
import EmptyState from "@/components/EmptyState/EmptyState";
import TrainingCard, { TrainingCardSkeleton, trainingStatus } from "./TrainingCard";
import ContinueBanner from "./ContinueBanner";
import classes from "./TrainingsPage.module.css";

const STATUS_FILTERS = [
  { value: "all", label: "Tümü" },
  { value: "enrolled", label: "Devam eden" },
  { value: "completed", label: "Tamamlanan" },
  { value: "new", label: "Başlanmamış" },
];

const TrainingsPage = () => {
  const router = useRouter();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState(null);

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

  const categories = useMemo(() => {
    const names = new Map();
    for (const training of trainings)
      if (training.category) names.set(String(training.category.id), training.category.name);
    return [...names].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, "tr"));
  }, [trainings]);

  // Search and category first; the status counts describe that list.
  const matching = useMemo(
    () =>
      trainings.filter(
        (training) =>
          (!category || String(training.category?.id) === category) &&
          matchesSearch(query, [training.name, training.description, training.category?.name])
      ),
    [trainings, category, query]
  );

  const counts = useMemo(() => {
    const result = { all: matching.length, enrolled: 0, completed: 0, new: 0 };
    for (const training of matching) result[trainingStatus(training)] += 1;
    return result;
  }, [matching]);

  const visible = useMemo(
    () => (status === "all" ? matching : matching.filter((training) => trainingStatus(training) === status)),
    [matching, status]
  );

  // The training in progress the learner is furthest along in.
  const current = useMemo(
    () =>
      trainings
        .filter((training) => trainingStatus(training) === "enrolled")
        .sort((a, b) => b.progress.percent - a.progress.percent)[0],
    [trainings]
  );

  const statusOptions = STATUS_FILTERS.map(({ value, label }) => ({
    value,
    label: loading ? label : `${label} (${counts[value]})`,
  }));

  const filtered = query || status !== "all" || category;
  const clearFilters = () => {
    setQuery("");
    setStatus("all");
    setCategory(null);
  };

  return (
    <>
      <PageHeader
        title="Eğitimler"
        description="Bir eğitim seçin; sanal makineniz sizin için hazırlansın."
      />

      {error ? <ErrorState message={error} onRetry={load} /> : null}

      {!loading && !error && current ? (
        <ContinueBanner training={current} onOpen={openTraining} loading={enrollingId === current.id} />
      ) : null}

      {!error && (loading || trainings.length > 0) ? (
        <div className={classes.filters} role="search">
          <TextInput
            className={classes.search}
            placeholder="Eğitim ara…"
            aria-label="Eğitim ara"
            leftSection={<IconSearch size={16} aria-hidden />}
            // Mantine ignores clicks on the right section by default.
            rightSectionPointerEvents="all"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            rightSection={
              query ? (
                <button type="button" className={classes.clear} onClick={() => setQuery("")} aria-label="Aramayı temizle">
                  <IconX size={14} />
                </button>
              ) : null
            }
            disabled={loading}
          />
          <Select
            className={classes.category}
            placeholder="Tüm kategoriler"
            aria-label="Kategori"
            data={categories}
            value={category}
            onChange={setCategory}
            clearable
            disabled={loading}
            comboboxProps={{ withinPortal: true }}
          />
          <SegmentedControl
            visibleFrom="sm"
            className={classes.status}
            value={status}
            onChange={setStatus}
            disabled={loading}
            aria-label="Duruma göre filtrele"
            data={statusOptions}
          />
          <Select
            hiddenFrom="sm"
            className={classes.statusSelect}
            aria-label="Duruma göre filtrele"
            data={statusOptions}
            value={status}
            onChange={(value) => setStatus(value || "all")}
            allowDeselect={false}
            disabled={loading}
          />
        </div>
      ) : null}

      {!loading && !error ? (
        <VisuallyHidden role="status" aria-live="polite">
          {visible.length} eğitim gösteriliyor
        </VisuallyHidden>
      ) : null}

      {loading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" aria-busy="true" aria-label="Eğitimler yükleniyor">
          {[0, 1, 2].map((key) => (
            <TrainingCardSkeleton key={key} />
          ))}
        </SimpleGrid>
      ) : null}

      {!loading && !error && trainings.length === 0 ? (
        <EmptyState
          icon={IconBooks}
          title="Henüz yayınlanmış bir eğitim yok"
          description="Yeni eğitimler eklendiğinde burada görünecek."
        />
      ) : null}

      {!loading && trainings.length > 0 && visible.length === 0 ? (
        <EmptyState
          icon={IconSearch}
          title="Eşleşen eğitim bulunamadı"
          description="Aramanızı veya filtreleri değiştirerek tekrar deneyin."
        >
          <Button variant="light" onClick={clearFilters}>
            Filtreleri temizle
          </Button>
        </EmptyState>
      ) : null}

      {!loading && visible.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {visible.map((training) => (
            <TrainingCard
              key={training.id}
              training={training}
              onOpen={openTraining}
              loading={enrollingId === training.id}
            />
          ))}
        </SimpleGrid>
      ) : null}

      {!loading && filtered && visible.length > 0 ? (
        <Group justify="center" mt="lg">
          <Text size="sm" c="dimmed">
            {trainings.length} eğitimden {visible.length} tanesi gösteriliyor.
          </Text>
          <Button variant="subtle" size="compact-sm" onClick={clearFilters}>
            Filtreleri temizle
          </Button>
        </Group>
      ) : null}
    </>
  );
};

export default TrainingsPage;
