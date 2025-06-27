"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  MantineProvider,
  ColorSchemeScript,
  AppShell,
  Container,
  Burger,
  Drawer,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import { useDispatch } from "react-redux";
// Mantine Styles
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dropzone/styles.css";

import { setUserLogin } from "@/lib/features/auth/authSlice";
// Configs
import { theme } from "@/app/theme/theme";
// Styles
import styles from "@/app/styles/layout.module.css";
import "@/app/styles/globals.css";
// Components
import NavBar from "@/components/NavBar";
import StoreProvider from "@/app/store/StoreProvider";
import axiosCommon from "@/utils/axiosCommon";

const BlankLayout = ({ children }) => {
  return (
    <StoreProvider>
      <html lang="en">
        <head>
          <ColorSchemeScript />
          <link rel="shortcut icon" href="/favicon.ico" />
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
          />
        </head>
        <body>
          <MantineProvider theme={theme}>
            <main className={styles.mainContainer}>{children}</main>
            <Notifications position="top-right" />
          </MantineProvider>
        </body>
      </html>
    </StoreProvider>
  );
};

const useAuthSession = () => {
  const [auth, setAuth] = useState(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    axiosCommon({
      method: "GET",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/profile`,
    })
      .then((res) => {
        setAuth(res.data);
      })
      .catch(() => {
        setAuth(null);
      })
      .finally(() => {
        setFetched(true);
      });
  }, []);

  return [auth, fetched];
};

const UnAuthRedirection = ({ authenticated, fetched }) => {
  const router = useRouter();

  useEffect(() => {
    if (!authenticated && fetched) router.push("/giris-yap");
  }, [authenticated, fetched]);

  return (
    <html lang="en">
      <body></body>
    </html>
  );
};

const AuthenticatedLayout = ({
  children,
  authenticated,
  hideNavbar,
  alwaysShowHamburger,
  containerProps,
}) => {
  const [opened, { toggle }] = useDisclosure();
  const [drawer, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const dispatch = useDispatch();

  const user = authenticated?.user;

  useEffect(() => {
    dispatch(setUserLogin(user));
  }, [user]);

  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <ModalsProvider labels={{ confirm: "Onayla", cancel: "İptal Et" }}>
            <AppShell
              navbar={{
                width: hideNavbar ? "0" : "13.375rem",
                breakpoint: "sm",
                collapsed: { mobile: !opened },
              }}
            >
              {hideNavbar ? null : (
                <AppShell.Navbar
                  p="md"
                  style={{ background: "transparent", borderInlineEnd: 0 }}
                >
                  <NavBar />
                </AppShell.Navbar>
              )}
              <AppShell.Main>
                <Container size={"xl"} {...containerProps}>
                  <Burger
                    opened={drawer}
                    onClick={openDrawer}
                    hiddenFrom={alwaysShowHamburger ? null : "sm"}
                    size="sm"
                  />
                  {children}
                  <Drawer
                    opened={drawer}
                    onClose={closeDrawer}
                    size="xs"
                    classNames={{
                      content: styles.drawerContent,
                    }}
                  >
                    <NavBar drawer={drawer} closeDrawer={closeDrawer} />
                  </Drawer>
                </Container>
              </AppShell.Main>
              <Notifications position="top-right" />
            </AppShell>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
};

const RootLayout = ({ children }) => {
  const path = usePathname();
  const router = useRouter();
  const params = useParams();

  const [authenticated, fetched] = useAuthSession();

  if (path == "/giris-yap" && !authenticated && fetched)
    return <BlankLayout>{children}</BlankLayout>;

  if (path == "/giris-yap" && authenticated && fetched) return router.push("/");

  if (!authenticated)
    return (
      <UnAuthRedirection authenticated={authenticated} fetched={fetched} />
    );

  if (authenticated && fetched && path != "/giris-yap")
    return (
      <StoreProvider>
        <AuthenticatedLayout
          authenticated={authenticated}
          fetched={fetched}
          hideNavbar={path.includes("/egitimler") && params?.trainingId}
          // alwaysShowHamburger={
          //   path.includes("/egitimler") && params?.trainingId
          // }
          containerProps={
            path.includes("/egitimler") && params?.trainingId
              ? {
                  size: "100%",
                  style: {
                    paddingInline: 0,
                  },
                }
              : null
          }
        >
          {children}
        </AuthenticatedLayout>
      </StoreProvider>
    );
};

export default RootLayout;
