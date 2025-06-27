"use client";

import { Button, Text, Stack, Alert } from "@mantine/core";
import { IconAlertCircle, IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

import classes from "./TrainingError.module.css";

const TrainingError = ({ errorMessage, onRetry }) => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleRetry = () => {
    if (onRetry) return onRetry();

    window.location.reload();
  };

  return (
    <div className={classes.container}>
      <Stack align="center" gap="xl" className={classes.content}>
        <Alert
          variant="light"
          color="red"
          radius="md"
          icon={<IconAlertCircle />}
          className={classes.alert}
        >
          <Text size="lg" fw={600} mb="sm">
            Eğitim ortamı yüklenemedi
          </Text>
          <Text size="md" c="dimmed">
            {typeof errorMessage === "string"
              ? errorMessage
              : errorMessage?.error ||
                errorMessage?.message ||
                JSON.stringify(errorMessage) ||
                "Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin."}
          </Text>
        </Alert>

        <Stack className={classes.buttons}>
          <Button
            variant="outline"
            size="md"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleGoBack}
            className={classes.backButton}
          >
            Geri Dön
          </Button>
          <Button
            variant="filled"
            color="blue.5"
            size="md"
            onClick={handleRetry}
            className={classes.retryButton}
          >
            Tekrar Dene
          </Button>
        </Stack>
      </Stack>
    </div>
  );
};

export default TrainingError;
