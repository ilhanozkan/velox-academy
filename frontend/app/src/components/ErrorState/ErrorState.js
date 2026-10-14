import { Alert, Button, Group, Text } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

const ErrorState = ({ title = "Bir şeyler ters gitti", message, onRetry }) => (
  <Alert color="red" variant="light" icon={<IconAlertCircle />} title={title} role="alert">
    <Text size="sm">{message}</Text>
    {onRetry ? (
      <Group mt="sm">
        <Button size="xs" variant="white" color="red" leftSection={<IconRefresh size={14} />} onClick={onRetry}>
          Tekrar dene
        </Button>
      </Group>
    ) : null}
  </Alert>
);

export default ErrorState;
