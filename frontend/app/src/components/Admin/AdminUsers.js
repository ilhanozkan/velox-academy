"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  ActionIcon,
  Avatar,
  Badge,
  Card,
  Center,
  Group,
  Loader,
  Select,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconLock, IconLockOpen, IconSearch, IconTrash } from "@tabler/icons-react";

import api, { errorMessage, imageUrl } from "@/lib/api";
import { selectUser } from "@/lib/features/auth/authSlice";
import { formatDate, timeAgo } from "@/lib/format";
import { initials } from "@/components/UserMenu/UserMenu";
import PageHeader from "@/components/PageHeader/PageHeader";
import ErrorState from "@/components/ErrorState/ErrorState";
import AdminNav from "./AdminNav";

const ROLE_OPTIONS = [
  { value: "user", label: "Öğrenci" },
  { value: "admin", label: "Yönetici" },
];

const AdminUsers = () => {
  const me = useSelector(selectUser);
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.users);
    } catch (err) {
      setError(errorMessage(err, "Kullanıcılar yüklenemedi."));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (updated) =>
    setUsers((current) => current.map((user) => (user.id === updated.id ? { ...user, ...updated } : user)));

  const run = async (request, success) => {
    try {
      const { data } = await request();
      notifications.show({ color: "green", message: success });
      return data;
    } catch (err) {
      notifications.show({ color: "red", title: "İşlem başarısız", message: errorMessage(err) });
      return null;
    }
  };

  const setRole = async (user, role) => {
    const data = await run(() => api.put(`/admin/users/${user.id}/role`, { role }), "Rol güncellendi.");
    if (data) update(data.user);
  };

  const toggleBlock = async (user) => {
    const blocking = user.status !== "blocked";
    const data = await run(
      () => api.post(`/admin/users/${user.id}/${blocking ? "block" : "unblock"}`),
      blocking ? `${user.username} engellendi.` : `${user.username} engeli kaldırıldı.`
    );
    if (data) update((data.block || data.unblock).user);
  };

  const remove = (user) =>
    modals.openConfirmModal({
      title: `${user.username} silinsin mi?`,
      centered: true,
      children: <Text size="sm">Kullanıcının ilerlemesi, başarıları ve sanal makineleri kalıcı olarak silinecek.</Text>,
      labels: { confirm: "Sil", cancel: "Vazgeç" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        const data = await run(() => api.delete(`/users/${user.id}`), "Kullanıcı silindi.");
        if (data) setUsers((current) => current.filter((u) => u.id !== user.id));
      },
    });

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!users || !q) return users;
    return users.filter((user) =>
      [user.username, user.email, user.full_name].some((v) => v?.toLocaleLowerCase("tr-TR").includes(q))
    );
  }, [users, query]);

  return (
    <>
      <PageHeader title="Yönetim" description="Kullanıcıları ve yetkilerini yönetin" />
      <AdminNav />

      {error ? <ErrorState message={error} onRetry={load} /> : null}

      <Card withBorder radius="md" p="md">
        <TextInput
          placeholder="Ad, kullanıcı adı veya e-posta ile ara"
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          mb="md"
          aria-label="Kullanıcı ara"
        />

        {!users && !error ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : null}

        {filtered ? (
          <Table.ScrollContainer minWidth={820}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Kullanıcı</Table.Th>
                  <Table.Th>Rol</Table.Th>
                  <Table.Th>Durum</Table.Th>
                  <Table.Th ta="right">Kayıt</Table.Th>
                  <Table.Th ta="right">Başarı</Table.Th>
                  <Table.Th>Son giriş</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((user) => {
                  const isMe = user.id === me.id;
                  return (
                    <Table.Tr key={user.id}>
                      <Table.Td>
                        <Group gap="sm" wrap="nowrap">
                          <Avatar src={imageUrl(user.profile_image)} radius="xl" size="md" color="primary">
                            {initials(user)}
                          </Avatar>
                          <div>
                            <Text size="sm" fw={500}>
                              {user.full_name || user.username}
                              {isMe ? (
                                <Text span size="xs" c="dimmed">
                                  {" "}
                                  (siz)
                                </Text>
                              ) : null}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {user.email} · {formatDate(user.created_at)}
                            </Text>
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Select
                          data={ROLE_OPTIONS}
                          value={user.role}
                          onChange={(role) => role && role !== user.role && setRole(user, role)}
                          disabled={isMe}
                          allowDeselect={false}
                          size="xs"
                          w={120}
                          aria-label={`${user.username} rolü`}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Badge color={user.status === "blocked" ? "red" : "teal"} variant="light">
                          {user.status === "blocked" ? "Engelli" : "Aktif"}
                        </Badge>
                      </Table.Td>
                      <Table.Td ta="right">
                        {user.completedTrainingCount}/{user.enrollmentCount}
                      </Table.Td>
                      <Table.Td ta="right">{user.achievementCount}</Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {user.last_login_at ? timeAgo(user.last_login_at) : "Hiç"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} justify="flex-end" wrap="nowrap">
                          <Tooltip label={user.status === "blocked" ? "Engeli kaldır" : "Engelle"}>
                            <ActionIcon
                              variant="subtle"
                              color={user.status === "blocked" ? "teal" : "orange"}
                              onClick={() => toggleBlock(user)}
                              disabled={isMe}
                              aria-label={`${user.username} ${user.status === "blocked" ? "engelini kaldır" : "engelle"}`}
                            >
                              {user.status === "blocked" ? <IconLockOpen size={18} /> : <IconLock size={18} />}
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Sil">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => remove(user)}
                              disabled={isMe}
                              aria-label={`${user.username} sil`}
                            >
                              <IconTrash size={18} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        ) : null}

        {filtered && !filtered.length ? (
          <Text c="dimmed" ta="center" py="md">
            Aramanızla eşleşen kullanıcı yok.
          </Text>
        ) : null}
      </Card>
    </>
  );
};

export default AdminUsers;
