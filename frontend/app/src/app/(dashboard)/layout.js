"use client";

import { usePathname } from "next/navigation";
import { MantineProvider, AppShell, Container } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
// Mantine Styles
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dropzone/styles.css";

// Configs
import { theme } from "@/app/theme/theme";
// Components
import NavBar from "@/components/NavBar";

const Layout = ({ children }) => {
  const pathname = usePathname();
  const [opened, { toggle }] = useDisclosure();

  // Blank layout for login
  if (pathname === "/giris-yap" || pathname.startsWith("/egitimler/")) {
    return <MantineProvider theme={theme}>{children}</MantineProvider>;
  }

  return (
    <MantineProvider theme={theme}>
      <ModalsProvider labels={{ confirm: "Onayla", cancel: "İptal Et" }}>
        <AppShell
          navbar={{
            width: "20rem",
            breakpoint: "sm",
            collapsed: { mobile: !opened },
          }}
        >
          <AppShell.Navbar
            p="md"
            style={{ background: "transparent", borderInlineEnd: 0 }}
          >
            <NavBar />
          </AppShell.Navbar>
          <AppShell.Main p="0" px="150">
            <Container size="xl">{children}</Container>
          </AppShell.Main>
          <Notifications />
        </AppShell>
      </ModalsProvider>
    </MantineProvider>
  );
};

export default Layout;
