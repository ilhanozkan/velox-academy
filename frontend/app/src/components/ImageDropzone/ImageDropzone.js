"use client";

import { Grid, Group, Text, rem } from "@mantine/core";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";

import styles from "./ImageDropzone.module.css";

export const ImageDropzone = ({
  onDrop,
  files = [],
  setFiles,
  description,
  accept,
  ...props
}) => {
  return (
    <Dropzone
      onDrop={onDrop}
      onReject={(files) => console.log("rejected files", files)}
      maxSize={5 * 1024 ** 2}
      accept={accept ?? IMAGE_MIME_TYPE}
      {...props}
    >
      <Group
        justify="center"
        gap="xl"
        mih={220}
        style={{ pointerEvents: "none" }}
      >
        <Dropzone.Accept>
          <IconUpload
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-blue-6)",
            }}
            stroke={1.5}
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-red-6)",
            }}
            stroke={1.5}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-dimmed)",
            }}
            stroke={1.5}
          />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            Görsel / Görselleri buraya sürükleyin
          </Text>

          {description === "" ? null : (
            <Text size="sm" c="dimmed" inline mt={7}>
              {description ??
                "Yalnızca .jpg, .jpeg ve .png dosya türleri kabul edilir."}
            </Text>
          )}
        </div>
      </Group>

      {files.length > 0 || 1 ? (
        <Grid justify="center">
          {files.map((file) => (
            <Grid.Col key={file} span={{ base: 6, sm: 4, lg: 4 }}>
              <img
                key={file.fileName}
                src={file.url}
                alt={file.fileName}
                className={styles.previewImage}
              />
            </Grid.Col>
          ))}
        </Grid>
      ) : null}
    </Dropzone>
  );
};
