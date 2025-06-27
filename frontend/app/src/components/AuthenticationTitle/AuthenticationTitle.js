"use client";

import {
  TextInput,
  PasswordInput,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Button,
} from "@mantine/core";
import { Loader } from "@mantine/core";
import { useSelector } from "react-redux";

// Logo
import CyberHomelandLogo from "@/app/icons/logo-colored.svg";
// Styles
import classes from "./AuthenticationTitle.module.css";
// Store
import { getLoginLoading } from "@/lib/features/auth/authSlice";

export const AuthenticationTitle = ({ handleLogin, values, setValues }) => {
  const loading = useSelector(getLoginLoading);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") handleLogin();
  };

  return (
    <>
      <div className={classes.logoContainer}>
        <CyberHomelandLogo className={classes.logo} />
      </div>
      <Title ta="center" className={classes.title}>
        Yazılım Eğitim Platformu
      </Title>
      <Container size={420} pt={10} className={classes.container}>
        <Paper withBorder shadow="md" p={30} mt={10} radius="md">
          <TextInput
            label="E-posta"
            placeholder="E-posta adresinizi girin"
            required
            onChange={(event) => {
              setValues({ ...values, email: event.target.value });
            }}
            onKeyDown={handleKeyDown}
          />
          <PasswordInput
            label="Parola"
            placeholder="Parolanızı girin"
            required
            mt="md"
            onChange={(event) => {
              setValues({ ...values, password: event.target.value });
            }}
            onKeyDown={handleKeyDown}
          />
          {/* <Group justify="space-between" mt="lg">
          <Checkbox label="Beni hatırla" />
          <Anchor component="button" size="sm">
            Parolamı unuttum?
          </Anchor>
        </Group> */}
          <Button
            fullWidth
            mt="xl"
            onClick={handleLogin}
            disabled={loading}
            radius={"md"}
          >
            {loading ? (
              <Loader
                color="white"
                size={18}
                style={{ marginRight: "0.25rem" }}
              />
            ) : null}
            Giriş Yap
          </Button>
        </Paper>

        <Text c="dimmed" size="sm" ta="center" mt={20}>
          Henüz bir hesabınız yok mu?{" "}
          <Anchor size="sm" component="button" fw={500}>
            Hesap oluşturun
          </Anchor>
        </Text>
      </Container>
    </>
  );
};
