"use client";

import { Group, Text, rem } from "@mantine/core";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";

export const ImageDropzone = ({ onDrop, description, accept, ...props }) => {
  return (
    <Dropzone onDrop={onDrop} maxSize={5 * 1024 ** 2} accept={accept ?? IMAGE_MIME_TYPE} {...props}>
      <Group justify="center" gap="lg" mih={110} style={{ pointerEvents: "none" }}>
        <Dropzone.Accept>
          <IconUpload style={{ width: rem(40), height: rem(40), color: "var(--mantine-color-primary-5)" }} stroke={1.5} />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX style={{ width: rem(40), height: rem(40), color: "var(--mantine-color-red-6)" }} stroke={1.5} />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto style={{ width: rem(40), height: rem(40), color: "var(--mantine-color-dimmed)" }} stroke={1.5} />
        </Dropzone.Idle>

        <div>
          <Text size="md" inline>
            Görseli buraya sürükleyin veya seçmek için tıklayın
          </Text>
          {description === "" ? null : (
            <Text size="sm" c="dimmed" inline mt={7} display="block">
              {description ?? "Yalnızca .jpg, .jpeg ve .png dosya türleri kabul edilir."}
            </Text>
          )}
        </div>
      </Group>
    </Dropzone>
  );
};
