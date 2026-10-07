"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Accordion, ActionIcon, Anchor, Badge, Button, Card, Center, Group, Loader, Stack, Text, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconArrowDown, IconArrowLeft, IconArrowUp, IconPencil, IconPlus, IconTrash, IconTrophy } from "@tabler/icons-react";

import api, { errorMessage } from "@/lib/api";
import PageHeader from "@/components/PageHeader/PageHeader";
import ErrorState from "@/components/ErrorState/ErrorState";
import ContentFormModal from "./ContentFormModal";

const MoveButtons = ({ index, count, onMove, label }) => (
  <>
    <Tooltip label="Yukarı taşı">
      <ActionIcon variant="subtle" color="gray" disabled={index === 0} onClick={() => onMove(-1)} aria-label={`${label} yukarı taşı`}>
        <IconArrowUp size={16} />
      </ActionIcon>
    </Tooltip>
    <Tooltip label="Aşağı taşı">
      <ActionIcon
        variant="subtle"
        color="gray"
        disabled={index === count - 1}
        onClick={() => onMove(1)}
        aria-label={`${label} aşağı taşı`}
      >
        <IconArrowDown size={16} />
      </ActionIcon>
    </Tooltip>
  </>
);

const AdminTrainingEditor = () => {
  const { trainingId } = useParams();
  const [training, setTraining] = useState(null);
  const [error, setError] = useState(null);
  // { kind, item, parentId } of the open form, or null
  const [form, setForm] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.get(`/trainings/${trainingId}`);
      setTraining(data.training);
    } catch (err) {
      setError(errorMessage(err, "Eğitim yüklenemedi."));
    }
  }, [trainingId]);

  useEffect(() => {
    load();
  }, [load]);

  // Swaps positions with the neighbour; positions are renumbered 1..n so
  // that rows with equal positions (e.g. imported data) also move.
  const move = async (resource, list, index, direction) => {
    const reordered = [...list];
    const [item] = reordered.splice(index, 1);
    reordered.splice(index + direction, 0, item);

    try {
      await Promise.all(
        reordered.map((entry, position) =>
          entry.position === position + 1
            ? null
            : api.put(`/admin/${resource}/${entry.id}`, { position: position + 1 })
        )
      );
      await load();
    } catch (err) {
      notifications.show({ color: "red", title: "Sıralama kaydedilemedi", message: errorMessage(err) });
    }
  };

  const remove = (resource, item, description) =>
    modals.openConfirmModal({
      title: `"${item.name}" silinsin mi?`,
      centered: true,
      children: <Text size="sm">{description}</Text>,
      labels: { confirm: "Sil", cancel: "Vazgeç" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await api.delete(`/admin/${resource}/${item.id}`);
          notifications.show({ color: "green", message: "Silindi." });
          load();
        } catch (err) {
          notifications.show({ color: "red", title: "Silinemedi", message: errorMessage(err) });
        }
      },
    });

  if (error)
    return (
      <>
        <PageHeader title="İçerik düzenleyici" />
        <ErrorState message={error} onRetry={load} />
      </>
    );

  if (!training)
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );

  return (
    <>
      <Anchor component={Link} href="/yonetim/egitimler" size="sm">
        <Group gap={4}>
          <IconArrowLeft size={14} /> Eğitimler
        </Group>
      </Anchor>
      <PageHeader
        title={training.name}
        description={`${training.chapters.length} bölüm · ${training.progress.totalInstructions} yönerge`}
        actions={
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setForm({ kind: "chapter", item: null, parentId: training.id })}
          >
            Bölüm ekle
          </Button>
        }
      />

      {training.chapters.length ? (
        <Accordion variant="separated" multiple defaultValue={[training.chapters[0].id]}>
          {training.chapters.map((chapter, chapterIndex) => (
            <Accordion.Item key={chapter.id} value={chapter.id}>
              <Group wrap="nowrap" gap={4} pr="sm">
                <Accordion.Control>
                  <Text fw={600}>
                    {chapterIndex + 1}. {chapter.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {chapter.instructions.length} yönerge
                    {chapter.description ? ` · ${chapter.description}` : ""}
                  </Text>
                </Accordion.Control>
                <MoveButtons
                  index={chapterIndex}
                  count={training.chapters.length}
                  label={chapter.name}
                  onMove={(direction) => move("chapters", training.chapters, chapterIndex, direction)}
                />
                <Tooltip label="Düzenle">
                  <ActionIcon
                    variant="subtle"
                    onClick={() => setForm({ kind: "chapter", item: chapter, parentId: training.id })}
                    aria-label={`${chapter.name} düzenle`}
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Sil">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() =>
                      remove("chapters", chapter, "Bölümdeki tüm yönergeler ve öğrenci ilerlemeleri de silinecek.")
                    }
                    aria-label={`${chapter.name} sil`}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>

              <Accordion.Panel>
                <Stack gap={6}>
                  {chapter.instructions.map((instruction, index) => (
                    <Card key={instruction.id} withBorder radius="sm" p="xs">
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                          <Badge variant="light" color="gray" circle>
                            {index + 1}
                          </Badge>
                          <div style={{ minWidth: 0 }}>
                            <Text size="sm" fw={500} truncate>
                              {instruction.name}
                            </Text>
                            {instruction.description ? (
                              <Text size="xs" c="dimmed" truncate>
                                {instruction.description}
                              </Text>
                            ) : null}
                          </div>
                          {instruction.achievements?.length ? (
                            <Tooltip label={`Başarı: ${instruction.achievements.map((a) => a.name).join(", ")}`}>
                              <IconTrophy size={16} color="var(--mantine-color-yellow-6)" aria-label="Başarı veriyor" />
                            </Tooltip>
                          ) : null}
                        </Group>
                        <Group gap={2} wrap="nowrap">
                          <MoveButtons
                            index={index}
                            count={chapter.instructions.length}
                            label={instruction.name}
                            onMove={(direction) => move("instructions", chapter.instructions, index, direction)}
                          />
                          <Tooltip label="Düzenle">
                            <ActionIcon
                              variant="subtle"
                              onClick={() => setForm({ kind: "instruction", item: instruction, parentId: chapter.id })}
                              aria-label={`${instruction.name} düzenle`}
                            >
                              <IconPencil size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Sil">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() =>
                                remove("instructions", instruction, "Öğrencilerin bu yönergedeki ilerlemesi de silinecek.")
                              }
                              aria-label={`${instruction.name} sil`}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Group>
                    </Card>
                  ))}
                  <Group>
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={<IconPlus size={14} />}
                      onClick={() => setForm({ kind: "instruction", item: null, parentId: chapter.id })}
                    >
                      Yönerge ekle
                    </Button>
                  </Group>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : (
        <Text c="dimmed">Bu eğitimde henüz bölüm yok. İlk bölümü ekleyerek başlayın.</Text>
      )}

      <ContentFormModal
        opened={Boolean(form)}
        kind={form?.kind}
        item={form?.item}
        parentId={form?.parentId}
        onClose={() => setForm(null)}
        onSaved={load}
      />
    </>
  );
};

export default AdminTrainingEditor;
