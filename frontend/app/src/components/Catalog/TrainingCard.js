"use client";

import { Badge, Button, Card, Group, Image, Progress, Stack, Text } from "@mantine/core";
import { IconBook2, IconClock } from "@tabler/icons-react";

import { imageUrl } from "@/lib/api";
import { formatMinutes, LEVEL_LABELS } from "@/lib/format";
import classes from "./TrainingCard.module.css";

const STATUS = {
  completed: { label: "Tamamlandı", color: "teal", action: "Tekrar gözden geçir" },
  enrolled: { label: "Devam ediyor", color: "blue", action: "Devam et" },
  new: { label: "Başlamadı", color: "gray", action: "Eğitime başla" },
};

export const trainingStatus = (training) =>
  training.isCompleted ? "completed" : training.isEnrolled ? "enrolled" : "new";

const TrainingCard = ({ training, onOpen, loading }) => {
  const status = STATUS[trainingStatus(training)];
  const { progress } = training;

  return (
    <Card withBorder radius="md" p="md" className={classes.card}>
      <Card.Section className={classes.imgSection}>
        <Badge size="sm" color={status.color} variant="filled" className={classes.statusBadge}>
          {status.label}
        </Badge>
        <Image src={imageUrl(training.image_file_path)} alt="" className={classes.cardImage} />
      </Card.Section>

      <Stack gap={6} mt="md" className={classes.body}>
        <Group gap={6}>
          {training.category ? (
            <Badge variant="light" size="sm">
              {training.category.name}
            </Badge>
          ) : null}
          {training.level ? (
            <Badge variant="outline" size="sm" color="gray">
              {LEVEL_LABELS[training.level] || training.level}
            </Badge>
          ) : null}
        </Group>

        <Text fz="lg" fw={600} component="h2">
          {training.name}
        </Text>
        <Text fz="sm" c="dimmed" lineClamp={3}>
          {training.description}
        </Text>

        <Group gap="md" mt={4} c="dimmed" fz="xs">
          <Group gap={4}>
            <IconBook2 size={14} aria-hidden />
            <span>
              {training.chapterCount} bölüm · {training.instructionCount} adım
            </span>
          </Group>
          {training.estimated_minutes ? (
            <Group gap={4}>
              <IconClock size={14} aria-hidden />
              <span>{formatMinutes(training.estimated_minutes)}</span>
            </Group>
          ) : null}
        </Group>

        {training.isEnrolled ? (
          <Stack gap={4} mt={4}>
            <Group justify="space-between" fz="xs">
              <Text size="xs" c="dimmed">
                İlerleme
              </Text>
              <Text size="xs" fw={600}>
                %{progress.percent}
              </Text>
            </Group>
            <Progress
              value={progress.percent}
              color={training.isCompleted ? "teal" : "blue"}
              aria-label={`${training.name} ilerlemesi`}
            />
          </Stack>
        ) : null}
      </Stack>

      <Button radius="md" mt="md" fullWidth onClick={() => onOpen(training)} loading={loading}>
        {status.action}
      </Button>
    </Card>
  );
};

export default TrainingCard;
