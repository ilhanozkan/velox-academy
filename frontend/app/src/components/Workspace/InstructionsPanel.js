"use client";

import { useMemo } from "react";
import { Badge, Button, Drawer, Group, NavLink, Progress, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCircle,
  IconCircleCheck,
  IconCircleCheckFilled,
  IconListDetails,
  IconRotate,
} from "@tabler/icons-react";

import Markdown from "@/components/Markdown/Markdown";
import { flattenInstructions } from "./curriculum";
import classes from "./InstructionsPanel.module.css";

const InstructionsPanel = ({ training, currentId, onSelect, onToggleComplete, completing }) => {
  const [tocOpened, toc] = useDisclosure(false);
  const steps = useMemo(() => flattenInstructions(training), [training]);
  const index = steps.findIndex((step) => step.id === currentId);
  const step = steps[index];

  if (!step)
    return (
      <Stack p="md">
        <Text c="dimmed">Bu eğitimde henüz yönerge bulunmuyor.</Text>
      </Stack>
    );

  const chapterNumber = training.chapters.findIndex((c) => c.id === step.chapter.id) + 1;
  const prev = steps[index - 1];
  const next = steps[index + 1];

  return (
    <div className={classes.panel}>
      <div className={classes.header}>
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Button
            variant="subtle"
            size="compact-sm"
            leftSection={<IconListDetails size={16} />}
            onClick={toc.open}
          >
            İçindekiler
          </Button>
          <Text size="xs" c="dimmed">
            %{training.progress.percent} tamamlandı
          </Text>
        </Group>
        <Progress value={training.progress.percent} size="sm" mt={6} aria-label="Eğitim ilerlemesi" />
      </div>

      {/* key: start each step at the top instead of the previous scroll position. */}
      <ScrollArea key={step.id} className={classes.content} type="auto">
        <div className={classes.inner}>
          <Group gap="xs" mb="sm">
            <Badge variant="light">
              Bölüm {chapterNumber}: {step.chapter.name}
            </Badge>
            <Badge variant="outline" color="gray">
              Adım {index + 1} / {steps.length}
            </Badge>
            {step.completed ? (
              <Badge color="teal" leftSection={<IconCircleCheck size={12} />}>
                Tamamlandı
              </Badge>
            ) : null}
          </Group>

          <Markdown>{step.content || `# ${step.name}\n\n${step.description || ""}`}</Markdown>
        </div>
      </ScrollArea>

      <Group className={classes.footer} justify="space-between" wrap="nowrap" gap="xs">
        <Button
          variant="default"
          leftSection={<IconArrowLeft size={16} />}
          disabled={!prev}
          onClick={() => prev && onSelect(prev.id)}
        >
          Önceki
        </Button>

        {step.completed ? (
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconRotate size={16} />}
            loading={completing}
            onClick={() => onToggleComplete(step, false)}
          >
            Geri al
          </Button>
        ) : (
          <Button
            color="teal"
            leftSection={<IconCircleCheck size={16} />}
            loading={completing}
            onClick={() => onToggleComplete(step, true)}
          >
            Tamamladım
          </Button>
        )}

        <Button
          variant="default"
          rightSection={<IconArrowRight size={16} />}
          disabled={!next}
          onClick={() => next && onSelect(next.id)}
        >
          Sonraki
        </Button>
      </Group>

      <Drawer opened={tocOpened} onClose={toc.close} title={training.name} position="right" size="sm">
        <Stack gap="md">
          {training.chapters.map((chapter, chapterIndex) => (
            <div key={chapter.id}>
              <Group justify="space-between" mb={4}>
                <Title order={3} fz="sm">
                  {chapterIndex + 1}. {chapter.name}
                </Title>
                <Text size="xs" c="dimmed">
                  {chapter.progress.completedInstructions}/{chapter.progress.totalInstructions}
                </Text>
              </Group>
              {chapter.instructions.map((instruction) => (
                <NavLink
                  key={instruction.id}
                  label={instruction.name}
                  active={instruction.id === currentId}
                  leftSection={
                    instruction.completed ? (
                      <IconCircleCheckFilled size={16} color="var(--mantine-color-teal-6)" />
                    ) : (
                      <IconCircle size={16} color="var(--mantine-color-gray-5)" />
                    )
                  }
                  onClick={() => {
                    onSelect(instruction.id);
                    toc.close();
                  }}
                />
              ))}
            </div>
          ))}
        </Stack>
      </Drawer>
    </div>
  );
};

export default InstructionsPanel;
