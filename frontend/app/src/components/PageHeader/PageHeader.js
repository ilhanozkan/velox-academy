import { Group, Stack, Text, Title } from "@mantine/core";

const PageHeader = ({ title, description, actions }) => (
  <Group justify="space-between" align="flex-end" mb="lg" mt="xs" wrap="wrap" gap="sm">
    <Stack gap={4}>
      <Title order={1} fz={{ base: "1.6rem", sm: "2rem" }}>
        {title}
      </Title>
      {description ? <Text c="dimmed">{description}</Text> : null}
    </Stack>
    {actions ? <Group gap="sm">{actions}</Group> : null}
  </Group>
);

export default PageHeader;
