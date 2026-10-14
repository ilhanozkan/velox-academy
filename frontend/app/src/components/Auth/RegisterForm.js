"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Anchor, Button, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { useDispatch } from "react-redux";

import { register } from "@/lib/features/auth/authSlice";
import AuthCard from "./AuthCard";

// Mirrors the server-side rules in models/User.js.
export const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{3,30}$/;

const RegisterForm = ({ next }) => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    initialValues: { full_name: "", username: "", email: "", password: "", confirmPassword: "" },
    validate: {
      username: (value) =>
        USERNAME_PATTERN.test(value.trim())
          ? null
          : "3-30 karakter; harf, rakam, nokta, tire veya alt çizgi kullanın",
      email: (value) => (/^\S+@\S+\.\S+$/.test(value.trim()) ? null : "Geçerli bir e-posta adresi girin"),
      password: (value) => (value.length >= 6 ? null : "Parola en az 6 karakter olmalıdır"),
      confirmPassword: (value, values) => (value === values.password ? null : "Parolalar eşleşmiyor"),
    },
  });

  const handleSubmit = async ({ confirmPassword, ...values }) => {
    setError(null);
    setSubmitting(true);
    const result = await dispatch(
      register({ ...values, username: values.username.trim(), email: values.email.trim() })
    );
    setSubmitting(false);

    if (register.rejected.match(result)) {
      form.setErrors(result.payload?.fields || {});
      setError(result.payload?.message);
      return;
    }

    notifications.show({
      color: "green",
      title: "Hoş geldiniz!",
      message: "Hesabınız oluşturuldu. İlk eğitiminizi seçebilirsiniz.",
    });
  };

  const loginHref = next ? `/giris-yap?next=${encodeURIComponent(next)}` : "/giris-yap";

  return (
    <AuthCard
      title="Hesap Oluştur"
      subtitle="Ücretsiz hesabınızla gerçek sanal makinelerde pratik yapın"
      footer={
        <>
          Zaten bir hesabınız var mı?{" "}
          <Anchor component={Link} href={loginHref} size="sm" fw={500}>
            Giriş yapın
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

        <TextInput label="Ad soyad" placeholder="Ada Lovelace" autoComplete="name" {...form.getInputProps("full_name")} />
        <TextInput
          label="Kullanıcı adı"
          placeholder="ada.lovelace"
          autoComplete="username"
          required
          mt="md"
          {...form.getInputProps("username")}
        />
        <TextInput
          label="E-posta"
          placeholder="ornek@eposta.com"
          type="email"
          autoComplete="email"
          required
          mt="md"
          {...form.getInputProps("email")}
        />
        <PasswordInput
          label="Parola"
          description="En az 6 karakter"
          autoComplete="new-password"
          required
          mt="md"
          {...form.getInputProps("password")}
        />
        <PasswordInput
          label="Parola (tekrar)"
          autoComplete="new-password"
          required
          mt="md"
          {...form.getInputProps("confirmPassword")}
        />

        <Button type="submit" fullWidth mt="xl" radius="md" loading={submitting}>
          Hesap Oluştur
        </Button>
      </form>
    </AuthCard>
  );
};

export default RegisterForm;
