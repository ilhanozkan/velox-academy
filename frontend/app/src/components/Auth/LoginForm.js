"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Anchor, Button, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import { useDispatch } from "react-redux";

import { login } from "@/lib/features/auth/authSlice";
import AuthCard from "./AuthCard";

const LoginForm = ({ next }) => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value.trim()) ? null : "Geçerli bir e-posta adresi girin"),
      password: (value) => (value ? null : "Parolanızı girin"),
    },
  });

  // On success GuestOnly redirects to ?next= (or the catalog). Previously the
  // page redirected after one second even when the login had failed.
  const handleSubmit = async (values) => {
    setError(null);
    setSubmitting(true);
    const result = await dispatch(login({ ...values, email: values.email.trim() }));
    setSubmitting(false);
    if (login.rejected.match(result)) setError(result.payload?.message);
  };

  const registerHref = next ? `/kayit-ol?next=${encodeURIComponent(next)}` : "/kayit-ol";

  return (
    <AuthCard
      title="Giriş Yap"
      subtitle="Uygulamalı yazılım eğitimlerine kaldığınız yerden devam edin"
      footer={
        <>
          Henüz bir hesabınız yok mu?{" "}
          <Anchor component={Link} href={registerHref} size="sm" fw={500}>
            Hesap oluşturun
          </Anchor>
        </>
      }
    >
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        {error ? (
          <Alert color="red" icon={<IconAlertCircle />} mb="md" role="alert">
            {error}
          </Alert>
        ) : null}

        <TextInput
          label="E-posta"
          placeholder="ornek@eposta.com"
          type="email"
          autoComplete="email"
          required
          {...form.getInputProps("email")}
        />
        <PasswordInput
          label="Parola"
          placeholder="Parolanızı girin"
          autoComplete="current-password"
          required
          mt="md"
          {...form.getInputProps("password")}
        />

        <Button type="submit" fullWidth mt="xl" radius="md" loading={submitting}>
          Giriş Yap
        </Button>
      </form>
    </AuthCard>
  );
};

export default LoginForm;
