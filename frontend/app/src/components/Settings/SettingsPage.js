"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Button,
  Card,
  FileButton,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconTrash, IconUpload } from "@tabler/icons-react";

import api, { errorMessage, fieldErrors, imageUrl } from "@/lib/api";
import { logout, selectUser, setUser } from "@/lib/features/auth/authSlice";
import { initials } from "@/components/UserMenu/UserMenu";
import { USERNAME_PATTERN } from "@/components/Auth/RegisterForm";
import PageHeader from "@/components/PageHeader/PageHeader";

const Section = ({ title, description, children }) => (
  <Card withBorder radius="md" p="lg">
    <Title order={2} fz="lg">
      {title}
    </Title>
    {description ? (
      <Text c="dimmed" size="sm" mt={4}>
        {description}
      </Text>
    ) : null}
    <Stack mt="md">{children}</Stack>
  </Card>
);

const ProfileSection = ({ user }) => {
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const form = useForm({
    initialValues: {
      full_name: user.full_name || "",
      username: user.username,
      email: user.email,
    },
    validate: {
      username: (value) =>
        USERNAME_PATTERN.test(value.trim()) ? null : "3-30 karakter; harf, rakam, nokta, tire veya alt çizgi kullanın",
      email: (value) => (/^\S+@\S+\.\S+$/.test(value.trim()) ? null : "Geçerli bir e-posta adresi girin"),
    },
  });

  const save = async (values) => {
    setSaving(true);
    try {
      const { data } = await api.patch("/auth/profile", values);
      dispatch(setUser(data.user));
      form.resetDirty({ full_name: data.user.full_name || "", username: data.user.username, email: data.user.email });
      notifications.show({ color: "green", message: "Profiliniz güncellendi." });
    } catch (error) {
      form.setErrors(fieldErrors(error));
      notifications.show({ color: "red", title: "Profil güncellenemedi", message: errorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const { data } = await api.post(`/users/${user.id}/profile-image`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(setUser(data.upload.user));
      notifications.show({ color: "green", message: "Profil fotoğrafınız güncellendi." });
    } catch (error) {
      notifications.show({ color: "red", title: "Fotoğraf yüklenemedi", message: errorMessage(error) });
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      const { data } = await api.delete(`/users/${user.id}/profile-image`);
      dispatch(setUser(data.user));
    } catch (error) {
      notifications.show({ color: "red", message: errorMessage(error) });
    }
  };

  return (
    <Section title="Profil" description="Diğer kullanıcıların ve eğitmenlerin göreceği bilgiler">
      <Group>
        <Avatar src={imageUrl(user.profile_image)} size={72} radius="xl" color="primary">
          {initials(user)}
        </Avatar>
        <Stack gap={6}>
          <Group gap="xs">
            <FileButton onChange={uploadAvatar} accept="image/png,image/jpeg,image/gif,image/webp">
              {(props) => (
                <Button {...props} size="xs" variant="light" leftSection={<IconUpload size={14} />} loading={uploading}>
                  Fotoğraf yükle
                </Button>
              )}
            </FileButton>
            {user.profile_image ? (
              <Button size="xs" variant="subtle" color="red" onClick={removeAvatar}>
                Kaldır
              </Button>
            ) : null}
          </Group>
          <Text size="xs" c="dimmed">
            JPG, PNG, GIF veya WEBP · en fazla 5 MB
          </Text>
        </Stack>
      </Group>

      <form onSubmit={form.onSubmit(save)} noValidate>
        <Stack>
          <TextInput label="Ad soyad" autoComplete="name" {...form.getInputProps("full_name")} />
          <TextInput label="Kullanıcı adı" autoComplete="username" required {...form.getInputProps("username")} />
          <TextInput label="E-posta" type="email" autoComplete="email" required {...form.getInputProps("email")} />
          <Group justify="flex-end">
            <Button type="submit" loading={saving} disabled={!form.isDirty()}>
              Kaydet
            </Button>
          </Group>
        </Stack>
      </form>
    </Section>
  );
};

const PasswordSection = () => {
  const [saving, setSaving] = useState(false);

  const form = useForm({
    initialValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    validate: {
      currentPassword: (value) => (value ? null : "Mevcut parolanızı girin"),
      newPassword: (value) => (value.length >= 6 ? null : "Yeni parola en az 6 karakter olmalıdır"),
      confirmPassword: (value, values) => (value === values.newPassword ? null : "Parolalar eşleşmiyor"),
    },
  });

  const save = async ({ currentPassword, newPassword }) => {
    setSaving(true);
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      form.reset();
      notifications.show({ color: "green", message: "Parolanız güncellendi." });
    } catch (error) {
      if (error?.response?.status === 401) form.setFieldError("currentPassword", errorMessage(error));
      else notifications.show({ color: "red", title: "Parola güncellenemedi", message: errorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="Parola" description="Güçlü ve başka hiçbir yerde kullanmadığınız bir parola seçin">
      <form onSubmit={form.onSubmit(save)} noValidate>
        <Stack>
          <PasswordInput label="Mevcut parola" autoComplete="current-password" {...form.getInputProps("currentPassword")} />
          <PasswordInput label="Yeni parola" autoComplete="new-password" {...form.getInputProps("newPassword")} />
          <PasswordInput label="Yeni parola (tekrar)" autoComplete="new-password" {...form.getInputProps("confirmPassword")} />
          <Group justify="flex-end">
            <Button type="submit" loading={saving}>
              Parolayı değiştir
            </Button>
          </Group>
        </Stack>
      </form>
    </Section>
  );
};

const DangerSection = ({ user }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const confirmDelete = () =>
    modals.openConfirmModal({
      title: "Hesabınızı silmek istediğinize emin misiniz?",
      centered: true,
      children: (
        <Text size="sm">
          Tüm ilerlemeniz, başarılarınız ve sanal makineleriniz kalıcı olarak silinecek. Bu işlem geri alınamaz.
        </Text>
      ),
      labels: { confirm: "Hesabımı sil", cancel: "Vazgeç" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await api.delete(`/users/${user.id}`);
          await dispatch(logout());
          router.replace("/giris-yap");
        } catch (error) {
          notifications.show({ color: "red", title: "Hesap silinemedi", message: errorMessage(error) });
        }
      },
    });

  if (user.role === "admin") return null;

  return (
    <Section title="Hesabı sil" description="Hesabınızı ve tüm verilerinizi kalıcı olarak silin">
      <Group>
        <Button color="red" variant="light" leftSection={<IconTrash size={16} />} onClick={confirmDelete}>
          Hesabımı sil
        </Button>
      </Group>
    </Section>
  );
};

const SettingsPage = () => {
  const user = useSelector(selectUser);

  return (
    <>
      <PageHeader title="Ayarlar" description="Hesap bilgilerinizi ve parolanızı yönetin" />
      <Stack maw={720}>
        <ProfileSection user={user} />
        <PasswordSection />
        <DangerSection user={user} />
      </Stack>
    </>
  );
};

export default SettingsPage;
