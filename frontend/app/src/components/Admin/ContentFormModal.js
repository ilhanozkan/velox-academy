"use client";

import { useEffect, useState } from "react";
import { Button, Group, Modal, Stack, Tabs, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import api, { errorMessage, fieldErrors } from "@/lib/api";
import { contentId } from "@/lib/slugify";
import Markdown from "@/components/Markdown/Markdown";

/**
 * Create or edit a chapter (kind "chapter") or an instruction ("instruction").
 * `parentId` is the training id for chapters and the chapter id for
 * instructions; new ids are derived from it and the name.
 */
const ContentFormModal = ({ opened, onClose, kind, item, parentId, onSaved }) => {
  const isInstruction = kind === "instruction";
  const editing = Boolean(item);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    initialValues: { name: "", description: "", content: "" },
    validate: { name: (value) => (value.trim() ? null : "Ad zorunludur") },
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues({
      name: item?.name || "",
      description: item?.description || "",
      content: item?.content || "",
    });
    form.clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, item]);

  const save = async (values) => {
    setSaving(true);
    const resource = isInstruction ? "instructions" : "chapters";
    const payload = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      ...(isInstruction && { content: values.content }),
    };

    try {
      if (editing) {
        await api.put(`/admin/${resource}/${item.id}`, payload);
      } else {
        const id = contentId(parentId, values.name, isInstruction ? "adim" : "bolum");
        await api.post(`/admin/${resource}`, {
          ...payload,
          id,
          ...(isInstruction ? { chapter_id: parentId } : { training_id: parentId }),
        });
      }
      notifications.show({ color: "green", message: editing ? "Kaydedildi." : "Eklendi." });
      onSaved();
      onClose();
    } catch (error) {
      form.setErrors(fieldErrors(error));
      notifications.show({ color: "red", title: "Kaydedilemedi", message: errorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const title = `${isInstruction ? "Yönerge" : "Bölüm"} ${editing ? "düzenle" : "ekle"}`;

  return (
    <Modal opened={opened} onClose={onClose} title={title} size={isInstruction ? "xl" : "md"} centered>
      <form onSubmit={form.onSubmit(save)} noValidate>
        <Stack>
          <TextInput label="Ad" required data-autofocus {...form.getInputProps("name")} />
          <Textarea
            label="Kısa açıklama"
            autosize
            minRows={1}
            maxRows={3}
            {...form.getInputProps("description")}
          />

          {isInstruction ? (
            <Tabs defaultValue="write">
              <Tabs.List>
                <Tabs.Tab value="write">İçerik (Markdown)</Tabs.Tab>
                <Tabs.Tab value="preview">Önizleme</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="write" pt="xs">
                <Textarea
                  autosize
                  minRows={12}
                  maxRows={20}
                  styles={{ input: { fontFamily: "var(--mantine-font-family-monospace)", fontSize: 13 } }}
                  placeholder={"# Başlık\n\nAçıklama...\n\n```sql\nSELECT * FROM customers;\n```"}
                  aria-label="İçerik"
                  {...form.getInputProps("content")}
                />
              </Tabs.Panel>
              <Tabs.Panel value="preview" pt="xs" mih={240}>
                <Markdown>{form.values.content || "_Önizlenecek içerik yok._"}</Markdown>
              </Tabs.Panel>
            </Tabs>
          ) : null}

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

export default ContentFormModal;
