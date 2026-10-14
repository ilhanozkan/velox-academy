import { Container, Paper, Text, Title } from "@mantine/core";

import VeloxLogo from "@/app/icons/logo-colored.svg";
import classes from "./AuthCard.module.css";

const AuthCard = ({ title, subtitle, children, footer }) => (
  <main className={classes.page}>
    <Container size={440} w="100%">
      <div className={classes.logoContainer}>
        <VeloxLogo className={classes.logo} aria-label="Velox Academy" />
      </div>
      <Title ta="center" order={1} className={classes.title}>
        {title}
      </Title>
      {subtitle ? (
        <Text c="dimmed" ta="center" mt={6}>
          {subtitle}
        </Text>
      ) : null}

      <Paper withBorder shadow="md" p={{ base: 20, sm: 30 }} mt="lg" radius="md">
        {children}
      </Paper>

      {footer ? (
        <Text c="dimmed" size="sm" ta="center" mt="lg">
          {footer}
        </Text>
      ) : null}
    </Container>
  </main>
);

export default AuthCard;
