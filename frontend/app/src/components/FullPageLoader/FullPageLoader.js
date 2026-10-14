import { Center, Loader, Stack, Text } from "@mantine/core";

const FullPageLoader = ({ label }) => (
  <Center mih="100vh" role="status" aria-live="polite">
    <Stack align="center" gap="sm">
      <Loader />
      {label ? <Text c="dimmed">{label}</Text> : null}
    </Stack>
  </Center>
);

export default FullPageLoader;
