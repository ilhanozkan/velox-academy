"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Anchor,
  Badge,
  Button,
  Card,
  Center,
  Grid,
  Group,
  Loader,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
  Title,
  Tooltip,
} from "@mantine/core";
import { BarChart } from "@mantine/charts";
import { IconBook2, IconCertificate, IconCircleCheck, IconStar, IconTrophy } from "@tabler/icons-react";

import api, { errorMessage } from "@/lib/api";
import { selectUser } from "@/lib/features/auth/authSlice";
import { achievementIcon } from "@/lib/achievementIcons";
import { formatDate, timeAgo } from "@/lib/format";
import PageHeader from "@/components/PageHeader/PageHeader";
import ErrorState from "@/components/ErrorState/ErrorState";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Card withBorder radius="md" p="md">
    <Group justify="space-between" wrap="nowrap">
      <div>
        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
          {label}
        </Text>
        <Text fz={28} fw={700} lh={1.2}>
          {value}
        </Text>
      </div>
      <ThemeIcon color={color} variant="light" size={44} radius="md">
        <Icon size={24} />
      </ThemeIcon>
    </Group>
  </Card>
);

const dayLabel = (day) =>
  new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(day));

const StatisticsPage = () => {
  const user = useSelector(selectUser);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.get(`/users/${user.id}/stats`);
      setStats(data.stats);
    } catch (err) {
      setError(errorMessage(err, "İstatistikler yüklenemedi."));
    }
  }, [user.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error)
    return (
      <>
        <PageHeader title="İstatistikler" />
        <ErrorState message={error} onRetry={load} />
      </>
    );

  if (!stats)
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );

  const { totals, trainings, achievements, recentActivity, activity } = stats;

  if (!trainings.length)
    return (
      <>
        <PageHeader title="İstatistikler" />
        <Card withBorder radius="md" p="xl">
          <Stack align="center" gap="sm">
            <ThemeIcon size={56} radius="xl" variant="light">
              <IconBook2 size={30} />
            </ThemeIcon>
            <Title order={2} fz="lg">
              Henüz bir eğitime başlamadınız
            </Title>
            <Text c="dimmed" ta="center">
              Bir eğitime başladığınızda ilerlemeniz, kazandığınız başarılar ve çalışma geçmişiniz burada görünecek.
            </Text>
            <Button component={Link} href="/egitimler">
              Eğitimlere göz at
            </Button>
          </Stack>
        </Card>
      </>
    );

  return (
    <>
      <PageHeader title="İstatistikler" description="Öğrenme yolculuğunuzun özeti" />

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} mb="lg">
        <StatCard icon={IconBook2} label="Kayıtlı eğitim" value={totals.enrolledTrainings} color="blue" />
        <StatCard icon={IconCertificate} label="Tamamlanan eğitim" value={totals.completedTrainings} color="teal" />
        <StatCard icon={IconCircleCheck} label="Tamamlanan adım" value={totals.completedInstructions} color="violet" />
        <StatCard icon={IconStar} label="Puan" value={totals.points} color="yellow" />
      </SimpleGrid>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Card withBorder radius="md" p="md" mb="lg">
            <Title order={2} fz="lg" mb="md">
              Son 14 gün
            </Title>
            <BarChart
              h={220}
              data={activity.map((d) => ({ gün: dayLabel(d.day), Adım: d.count }))}
              dataKey="gün"
              series={[{ name: "Adım", color: "blue.6" }]}
              tickLine="none"
              gridAxis="y"
              withTooltip
            />
          </Card>

          <Card withBorder radius="md" p="md">
            <Title order={2} fz="lg" mb="md">
              Eğitimlerim
            </Title>
            <Stack gap="md">
              {trainings.map((training) => (
                <div key={training.trainingId}>
                  <Group justify="space-between" mb={4} wrap="nowrap">
                    <Anchor component={Link} href={`/egitimler/${training.trainingId}`} fw={600}>
                      {training.name}
                    </Anchor>
                    {training.completed ? (
                      <Badge color="teal">Tamamlandı · {formatDate(training.completedAt)}</Badge>
                    ) : (
                      <Text size="sm" c="dimmed">
                        {training.progress.completedInstructions}/{training.progress.totalInstructions} adım
                      </Text>
                    )}
                  </Group>
                  <Progress
                    value={training.progress.percent}
                    color={training.completed ? "teal" : "blue"}
                    aria-label={`${training.name} ilerlemesi`}
                  />
                </div>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Card withBorder radius="md" p="md" mb="lg">
            <Group justify="space-between" mb="md">
              <Title order={2} fz="lg">
                Başarılar
              </Title>
              <Badge variant="light" color="yellow" leftSection={<IconTrophy size={12} />}>
                {totals.achievements}
              </Badge>
            </Group>
            {achievements.length ? (
              <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
                {achievements.map((achievement) => {
                  const Icon = achievementIcon(achievement.icon);
                  return (
                    <Tooltip key={achievement.id} label={achievement.description} multiline w={220} withArrow>
                      <Stack align="center" gap={4} ta="center">
                        <ThemeIcon size={48} radius="xl" color="yellow" variant="light">
                          <Icon size={26} />
                        </ThemeIcon>
                        <Text size="sm" fw={600} lh={1.2}>
                          {achievement.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {achievement.points} puan
                        </Text>
                      </Stack>
                    </Tooltip>
                  );
                })}
              </SimpleGrid>
            ) : (
              <Text c="dimmed" size="sm">
                Adımları tamamladıkça başarılar kazanacaksınız.
              </Text>
            )}
          </Card>

          <Card withBorder radius="md" p="md">
            <Title order={2} fz="lg" mb="md">
              Son etkinlikler
            </Title>
            {recentActivity.length ? (
              <Timeline bulletSize={20} lineWidth={2} active={recentActivity.length}>
                {recentActivity.map((item) => (
                  <Timeline.Item
                    key={`${item.instructionId}-${item.completedAt}`}
                    bullet={<IconCircleCheck size={12} />}
                    title={item.instructionName}
                  >
                    <Text size="xs" c="dimmed">
                      {item.trainingName} · {item.chapterName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {timeAgo(item.completedAt)}
                    </Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Text c="dimmed" size="sm">
                Henüz tamamlanan bir adım yok.
              </Text>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </>
  );
};

export default StatisticsPage;
