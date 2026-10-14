"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ActionIcon, Badge, Button, Card, Center, Group, Image, Loader, Table, Text, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconListDetails, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";

import api, { errorMessage, imageUrl } from "@/lib/api";
import { formatMinutes, LEVEL_LABELS } from "@/lib/format";
import PageHeader from "@/components/PageHeader/PageHeader";
import ErrorState from "@/components/ErrorState/ErrorState";
import AdminNav from "./AdminNav";
import TrainingFormModal from "./TrainingFormModal";

const AdminTrainings = () => {
  const [trainings, setTrainings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(undefined); // undefined: closed, null: new

  const load = useCallback(async () => {
    setError(null);
    try {
      const [{ data: t }, { data: c }] = await Promise.all([api.get("/trainings"), api.get("/categories")]);
      setTrainings(t.trainings);
      setCategories(c.categories);
    } catch (err) {
      setError(errorMessage(err, "Eğitimler yüklenemedi."));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = (training) =>
    modals.openConfirmModal({
      title: `"${training.name}" silinsin mi?`,
      centered: true,
      children: (
        <Text size="sm">
          Eğitimin bölümleri, yönergeleri, öğrenci kayıtları, ilerlemeleri ve sanal makineleri kalıcı olarak silinecek.
        </Text>
      ),
      labels: { confirm: "Eğitimi sil", cancel: "Vazgeç" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await api.delete(`/admin/trainings/${training.id}`);
          setTrainings((current) => current.filter((t) => t.id !== training.id));
          notifications.show({ color: "green", message: "Eğitim silindi." });
        } catch (err) {
          notifications.show({ color: "red", title: "Silinemedi", message: errorMessage(err) });
        }
      },
    });

  return (
    <>
      <PageHeader
        title="Yönetim"
        description="Eğitimleri ve içeriklerini yönetin"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={() => setEditing(null)}>
            Yeni eğitim
          </Button>
        }
      />
      <AdminNav />

      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {!trainings && !error ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : null}

      {trainings ? (
        <Card withBorder radius="md" p={0}>
          <Table.ScrollContainer minWidth={760}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Eğitim</Table.Th>
                  <Table.Th>Kategori</Table.Th>
                  <Table.Th>Seviye</Table.Th>
                  <Table.Th ta="right">İçerik</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {trainings.map((training) => (
                  <Table.Tr key={training.id}>
                    <Table.Td>
                      <Group gap="sm" wrap="nowrap">
                        <Image src={imageUrl(training.image_file_path)} alt="" w={64} h={36} radius="sm" fit="cover" />
                        <div>
                          <Text size="sm" fw={600}>
                            {training.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {training.id}
                            {training.estimated_minutes ? ` · ${formatMinutes(training.estimated_minutes)}` : ""}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>{training.category?.name || <Text c="dimmed">—</Text>}</Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="gray">
                        {LEVEL_LABELS[training.level] || training.level}
                      </Badge>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm">
                        {training.chapterCount} bölüm · {training.instructionCount} adım
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} justify="flex-end" wrap="nowrap">
                        <Button
                          component={Link}
                          href={`/yonetim/egitimler/${training.id}`}
                          size="xs"
                          variant="light"
                          leftSection={<IconListDetails size={14} />}
                        >
                          İçerik
                        </Button>
                        <Tooltip label="Düzenle">
                          <ActionIcon variant="subtle" onClick={() => setEditing(training)} aria-label={`${training.name} düzenle`}>
                            <IconPencil size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Sil">
                          <ActionIcon variant="subtle" color="red" onClick={() => remove(training)} aria-label={`${training.name} sil`}>
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
      ) : null}

      <TrainingFormModal
        opened={editing !== undefined}
        training={editing}
        categories={categories}
        onClose={() => setEditing(undefined)}
        onSaved={load}
      />
    </>
  );
};

export default AdminTrainings;
