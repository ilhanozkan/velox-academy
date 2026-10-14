import { Stack, Text, ThemeIcon, Title } from "@mantine/core";

/** Centered message for lists without items, with an optional action. */
const EmptyState = ({ icon: Icon, title, description, children }) => (
  <Stack align="center" gap="xs" py={48} px="md" ta="center">
    {Icon ? (
      <ThemeIcon size={56} radius="xl" variant="light" aria-hidden>
        <Icon size={28} stroke={1.5} />
      </ThemeIcon>
    ) : null}
    <Title order={2} fz="lg" mt="xs">
      {title}
    </Title>
    {description ? (
      <Text c="dimmed" maw={420}>
        {description}
      </Text>
    ) : null}
    {children ? <div style={{ marginTop: "var(--mantine-spacing-sm)" }}>{children}</div> : null}
  </Stack>
);

export default EmptyState;
