"use client";

import { useEffect, useState } from "react";
import { Button, Group, Modal, NumberInput, Select, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";

import api, { errorMessage, fieldErrors } from "@/lib/api";
import { ACHIEVEMENT_ICON_NAMES, achievementIcon } from "@/lib/achievementIcons";
import { contentId } from "@/lib/slugify";

const iconOptions = ACHIEVEMENT_ICON_NAMES.map((name) => ({ value: name, label: name }));

const renderIconOption = ({ option }) => {
  const Icon = achievementIcon(option.value);
  return (
    <Group gap="xs" wrap="nowrap">
      <Icon size={16} aria-hidden />
      <span>{option.label}</span>
    </Group>
  );
};

/**
 * Create, edit or delete the achievement awarded for completing an
 * instruction. `achievement` is null when creating.
 */
const AchievementFormModal = ({ opened, onClose, achievement, instruction, trainingId, onSaved }) => {
  const editing = Boolean(achievement);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    initialValues: { name: "", description: "", icon: "trophy", points: 10 },
    validate: {
      name: (value) => (value.trim() ? null : "Ad zorunludur"),
      points: (value) => (Number.isInteger(value) && value >= 0 ? null : "0 veya daha büyük bir tam sayı girin"),
    },
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues({
      name: achievement?.name || "",
      description: achievement?.description || "",
      icon: achievement?.icon || "trophy",
      points: achievement?.points ?? 10,
    });
    form.clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, achievement]);

  const save = async (values) => {
    setSaving(true);
    const payload = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      icon: values.icon,
      points: values.points,
    };

    try {
      if (editing) await api.put(`/admin/achievements/${achievement.id}`, payload);
      else
        await api.post("/admin/achievements", {
          ...payload,
          id: contentId(trainingId, values.name, "basari"),
          instruction_id: instruction.id,
        });
      notifications.show({ color: "green", message: editing ? "Başarı kaydedildi." : "Başarı eklendi." });
      onSaved();
      onClose();
    } catch (error) {
      form.setErrors(fieldErrors(error));
      notifications.show({ color: "red", title: "Kaydedilemedi", message: errorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const remove = () =>
    modals.openConfirmModal({
      title: `"${achievement.name}" silinsin mi?`,
      centered: true,
      children: <Text size="sm">Öğrencilerin kazandığı bu başarı da profillerinden kaldırılacak.</Text>,
      labels: { confirm: "Sil", cancel: "Vazgeç" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await api.delete(`/admin/achievements/${achievement.id}`);
          notifications.show({ color: "green", message: "Başarı silindi." });
          onSaved();
          onClose();
        } catch (error) {
          notifications.show({ color: "red", title: "Silinemedi", message: errorMessage(error) });
        }
      },
    });

  const SelectedIcon = achievementIcon(form.values.icon);

  return (
    <Modal opened={opened} onClose={onClose} title={editing ? "Başarıyı düzenle" : "Başarı ekle"} centered>
      <form onSubmit={form.onSubmit(save)} noValidate>
        <Stack>
          <Text size="sm" c="dimmed">
            Öğrenciler <b>{instruction?.name}</b> yönergesini tamamladığında kazanır.
          </Text>
          <TextInput label="Ad" required data-autofocus {...form.getInputProps("name")} />
          <Textarea label="Açıklama" autosize minRows={2} maxRows={4} {...form.getInputProps("description")} />
          <Group grow align="flex-start">
            <Select
              label="Simge"
              data={iconOptions}
              allowDeselect={false}
              leftSection={<SelectedIcon size={16} aria-hidden />}
              renderOption={renderIconOption}
              {...form.getInputProps("icon")}
            />
            <NumberInput label="Puan" min={0} step={5} allowDecimal={false} {...form.getInputProps("points")} />
          </Group>

          <Group justify="space-between" mt="sm">
            {editing ? (
              <Button variant="subtle" color="red" onClick={remove}>
                Sil
              </Button>
            ) : (
              <span />
            )}
            <Group gap="sm">
              <Button variant="default" onClick={onClose}>
                Vazgeç
              </Button>
              <Button type="submit" loading={saving}>
                Kaydet
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default AchievementFormModal;
