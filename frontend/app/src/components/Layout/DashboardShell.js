"use client";

import { AppShell, Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import NavBar from "@/components/NavBar/NavBar";
import VeloxLogo from "@/app/icons/logo-colored.svg";

// Sidebar on desktop; a header with a burger that opens the same sidebar on
// mobile. (Two AppShells used to be nested here, each with its own navbar.)
const DashboardShell = ({ children }) => {
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <AppShell
      header={{ height: { base: 56, sm: 0 } }}
      navbar={{ width: 240, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header hiddenFrom="sm" px="md">
        <Group h="100%" justify="space-between">
          <VeloxLogo style={{ height: 28, width: "auto" }} aria-label="Velox Academy" />
          <Burger opened={opened} onClick={toggle} size="sm" aria-label="Menüyü aç/kapat" />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavBar onNavigate={close} />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default DashboardShell;
