"use client";

import Link from "next/link";
import { Button, Group, Loader, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconAlertTriangle, IconArrowLeft } from "@tabler/icons-react";

import classes from "./WorkspaceStatus.module.css";

export const WorkspaceLoading = ({ title, description }) => (
  <div className={classes.screen} role="status" aria-live="polite">
    <Stack align="center" gap="sm" maw={420} ta="center">
      <Loader size="lg" type="dots" color="white" />
      <Title order={2} c="white" fz="xl">
        {title}
      </Title>
      {description ? <Text c="gray.4">{description}</Text> : null}
    </Stack>
  </div>
);

export const WorkspaceError = ({ title = "Eğitim ortamı yüklenemedi", message, children }) => (
  <div className={classes.screen}>
    <Paper radius="md" p="xl" maw={480} w="100%" role="alert">
      <Stack gap="md">
        <Group gap="sm" wrap="nowrap" align="flex-start">
          <ThemeIcon color="red" variant="light" size="lg" radius="xl">
            <IconAlertTriangle size={20} />
          </ThemeIcon>
          <div>
            <Title order={2} fz="lg">
              {title}
            </Title>
            {message ? (
              <Text c="dimmed" size="sm" mt={4}>
                {message}
              </Text>
            ) : null}
          </div>
        </Group>
        <Group justify="flex-end" gap="sm">
          <Button component={Link} href="/egitimler" variant="default" leftSection={<IconArrowLeft size={16} />}>
            Eğitimlere dön
          </Button>
          {children}
        </Group>
      </Stack>
    </Paper>
  </div>
);
