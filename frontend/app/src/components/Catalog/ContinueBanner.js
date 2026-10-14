import { Button, Group, Image, Progress, Stack, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";

import { imageUrl } from "@/lib/api";
import classes from "./ContinueBanner.module.css";

/** The training in progress, with a shortcut back into its workspace. */
const ContinueBanner = ({ training, onOpen, loading }) => {
  const { progress } = training;

  return (
    <section className={classes.banner} aria-labelledby="continue-title">
      <Image src={imageUrl(training.image_file_path)} alt="" className={classes.image} />

      <Stack gap={6} className={classes.body}>
        <Text size="xs" fw={700} tt="uppercase" className={classes.eyebrow}>
          Kaldığınız yerden devam edin
        </Text>
        <Text component="h2" id="continue-title" fz="xl" fw={700} c="white" lh={1.25}>
          {training.name}
        </Text>
        <Group gap="sm" wrap="nowrap" maw={420}>
          <Progress
            value={progress.percent}
            color="primary.3"
            className={classes.progress}
            aria-label={`${training.name} ilerlemesi`}
          />
          <Text size="sm" c="white" fw={600} style={{ whiteSpace: "nowrap" }}>
            %{progress.percent}
          </Text>
        </Group>
        <Text size="sm" className={classes.meta}>
          {progress.completedInstructions} / {progress.totalInstructions} adım tamamlandı
        </Text>
      </Stack>

      <Button
        variant="white"
        color="primary"
        size="md"
        rightSection={<IconArrowRight size={18} />}
        onClick={() => onOpen(training)}
        loading={loading}
        className={classes.action}
      >
        Devam et
      </Button>
    </section>
  );
};

export default ContinueBanner;
