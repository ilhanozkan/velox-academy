"use client";

import { useEffect, useState } from "react";
import { Button, Group, Image, Modal, NumberInput, Select, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import api, { errorMessage, fieldErrors, imageUrl } from "@/lib/api";
import { LEVEL_LABELS } from "@/lib/format";
import { slugify } from "@/lib/slugify";
import { ImageDropzone } from "@/components/ImageDropzone/ImageDropzone";

const LEVEL_OPTIONS = Object.entries(LEVEL_LABELS).map(([value, label]) => ({ value, label }));

const emptyValues = {
  id: "",
  name: "",
  description: "",
  category_id: null,
  level: "beginner",
  estimated_minutes: "",
  image_file_path: "",
};

/** Create (training = null) or edit a training. */
const TrainingFormModal = ({ opened, onClose, training, categories, onSaved }) => {
  const editing = Boolean(training);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  // The id follows the name until it is edited by hand.
  const [idEdited, setIdEdited] = useState(false);

  const form = useForm({
    initialValues: emptyValues,
    validate: {
      name: (value) => (value.trim() ? null : "Eğitim adı zorunludur"),
      id: (value) => (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value) ? null : "Küçük harf, rakam ve tire kullanın"),
      image_file_path: (value) => (value ? null : "Bir kapak görseli yükleyin"),
    },
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues(
      training
        ? {
            id: training.id,
            name: training.name,
            description: training.description || "",
            category_id: training.category_id ? String(training.category_id) : null,
            level: training.level || "beginner",
            estimated_minutes: training.estimated_minutes ?? "",
            image_file_path: training.image_file_path,
          }
        : emptyValues
    );
    form.resetDirty();
    form.clearErrors();
    setIdEdited(false);
    // Reset only when the modal opens for another training.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, training]);

  const upload = async (files) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const { data } = await api.post("/static-images/upload", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      form.setFieldValue("image_file_path", data.path);
    } catch (error) {
      notifications.show({ color: "red", title: "Görsel yüklenemedi", message: errorMessage(error) });
    } finally {
      setUploading(false);
    }
  };

  const save = async (values) => {
    setSaving(true);
    const payload = {
      ...values,
      slug: values.id,
      name: values.name.trim(),
      category_id: values.category_id ? Number(values.category_id) : null,
      estimated_minutes: values.estimated_minutes === "" ? null : Number(values.estimated_minutes),
    };
    if (editing) {
      delete payload.id;
      delete payload.slug;
    }

    try {
      const { data } = editing
        ? await api.put(`/admin/trainings/${training.id}`, payload)
        : await api.post("/admin/trainings", payload);
      notifications.show({ color: "green", message: editing ? "Eğitim güncellendi." : "Eğitim oluşturuldu." });
      onSaved(data.training);
      onClose();
    } catch (error) {
      form.setErrors(fieldErrors(error));
      notifications.show({ color: "red", title: "Kaydedilemedi", message: errorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={editing ? "Eğitimi düzenle" : "Yeni eğitim"} size="lg" centered>
      <form onSubmit={form.onSubmit(save)} noValidate>
        <Stack>
          <TextInput
            label="Eğitim adı"
            required
            {...form.getInputProps("name")}
            onChange={(event) => {
              const name = event.currentTarget.value;
              form.setFieldValue("name", name);
              if (!editing && !idEdited) form.setFieldValue("id", slugify(name));
            }}
          />
          <TextInput
            label="Kimlik (URL)"
            description="Eğitimin adresinde kullanılır, sonradan değiştirilemez"
            required
            disabled={editing}
            {...form.getInputProps("id")}
            onChange={(event) => {
              setIdEdited(true);
              form.setFieldValue("id", event.currentTarget.value);
            }}
          />
          <Textarea label="Açıklama" autosize minRows={2} maxRows={6} {...form.getInputProps("description")} />
          <Group grow align="flex-start">
            <Select
              label="Kategori"
              data={categories.map((c) => ({ value: String(c.id), label: c.name }))}
              clearable
              {...form.getInputProps("category_id")}
            />
            <Select label="Seviye" data={LEVEL_OPTIONS} allowDeselect={false} {...form.getInputProps("level")} />
            <NumberInput label="Süre (dakika)" min={0} step={15} {...form.getInputProps("estimated_minutes")} />
          </Group>

          <div>
            <Text size="sm" fw={500} mb={4}>
              Kapak görseli
            </Text>
            {form.values.image_file_path ? (
              <Image
                src={imageUrl(form.values.image_file_path)}
                alt="Kapak görseli önizlemesi"
                radius="md"
                mah={180}
                fit="cover"
                mb="xs"
              />
            ) : null}
            <ImageDropzone onDrop={upload} loading={uploading} multiple={false} description="JPG, PNG veya WEBP · en fazla 5 MB" />
            {form.errors.image_file_path ? (
              <Text c="red" size="xs" mt={4}>
                {form.errors.image_file_path}
              </Text>
            ) : null}
          </div>

          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Vazgeç
            </Button>
            <Button type="submit" loading={saving}>
              Kaydet
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default TrainingFormModal;
