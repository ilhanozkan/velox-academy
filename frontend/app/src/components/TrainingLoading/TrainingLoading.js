"use client";
import { Loader, Text, Stack } from "@mantine/core";

import classes from "./TrainingLoading.module.css";

const TrainingLoading = () => {
  return (
    <div className={classes.container}>
      <Stack align="center" gap="0">
        <Loader size="xl" type="dots" />
        <Text size="lg" fw={500} className={classes.animatedText}>
          Eğitim ortamınız hazırlanıyor.
        </Text>
      </Stack>
    </div>
  );
};

export default TrainingLoading;
