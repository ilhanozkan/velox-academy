"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Card, Center, Grid, Group, Loader, RingProgress, SimpleGrid, Table, Text, Title } from "@mantine/core";

import api, { errorMessage } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import PageHeader from "@/components/PageHeader/PageHeader";
import ErrorState from "@/components/ErrorState/ErrorState";
import AdminNav from "./AdminNav";

const Stat = ({ label, value, hint }) => (
  <Card withBorder radius="md" p="md">
    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
      {label}
    </Text>
    <Text fz={28} fw={700} lh={1.2}>
      {value}
    </Text>
    {hint ? (
      <Text size="xs" c="dimmed">
        {hint}
      </Text>
    ) : null}
  </Card>
);

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.get("/admin/dashboard/stats");
      setStats(data.stats);
    } catch (err) {
      setError(errorMessage(err, "İstatistikler yüklenemedi."));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader title="Yönetim" description="Platformun genel durumu" />
      <AdminNav />

      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {!stats && !error ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : null}

      {stats ? (
        <>
          <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} mb="lg">
            <Stat label="Kullanıcı" value={stats.totalUsers} hint={`${stats.blockedUsers} engelli · ${stats.adminUsers} yönetici`} />
            <Stat label="Eğitim" value={stats.totalTrainings} hint={`${stats.totalChapters} bölüm · ${stats.totalInstructions} adım`} />
            <Stat label="Kayıt" value={stats.totalEnrollments} hint={`${stats.completedEnrollments} tamamlandı`} />
            <Stat label="Çalışan sanal makine" value={stats.runningSandboxes} hint={`${stats.achievementsEarned} başarı kazanıldı`} />
          </SimpleGrid>

          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder radius="md" p="md" h="100%">
                <Title order={2} fz="lg" mb="sm">
                  Tamamlama oranı
                </Title>
                <Center>
                  <RingProgress
                    size={170}
                    thickness={16}
                    roundCaps
                    sections={[{ value: stats.enrollmentCompletionRate, color: "teal" }]}
                    label={
                      <Text ta="center" fw={700} fz="xl">
                        %{Math.round(stats.enrollmentCompletionRate)}
                      </Text>
                    }
                  />
                </Center>
                <Text size="sm" c="dimmed" ta="center">
                  {stats.completedInstructions} adım tamamlandı
                </Text>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card withBorder radius="md" p="md" mb="lg">
                <Title order={2} fz="lg" mb="sm">
                  Popüler eğitimler
                </Title>
                <Table.ScrollContainer minWidth={360}>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Eğitim</Table.Th>
                        <Table.Th ta="right">Kayıt</Table.Th>
                        <Table.Th ta="right">Tamamlayan</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {stats.popularTrainings.map((training) => (
                        <Table.Tr key={training.id}>
                          <Table.Td>{training.name}</Table.Td>
                          <Table.Td ta="right">{training.enrollments}</Table.Td>
                          <Table.Td ta="right">{training.completed}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Card>

              <Card withBorder radius="md" p="md">
                <Title order={2} fz="lg" mb="sm">
                  Son kayıtlar
                </Title>
                {stats.recentEnrollments.length ? (
                  stats.recentEnrollments.map((enrollment) => (
                    <Group key={enrollment.id} justify="space-between" py={6} wrap="nowrap">
                      <Text size="sm" truncate>
                        <b>{enrollment.user?.username}</b> → {enrollment.training?.name}
                      </Text>
                      <Group gap="xs" wrap="nowrap">
                        {enrollment.completed ? <Badge color="teal" size="sm">Tamamlandı</Badge> : null}
                        <Text size="xs" c="dimmed">
                          {timeAgo(enrollment.created_at)}
                        </Text>
                      </Group>
                    </Group>
                  ))
                ) : (
                  <Text c="dimmed" size="sm">
                    Henüz kayıt yok.
                  </Text>
                )}
              </Card>
            </Grid.Col>
          </Grid>
        </>
      ) : null}
    </>
  );
};

export default AdminOverview;
