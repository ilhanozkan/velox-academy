"use client";

import { Text, Card, SimpleGrid, Button, Box, Grid } from "@mantine/core";
import { AreaChart, BarChart } from "@mantine/charts";
import { IconGauge, IconUser, IconCookie } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

import classes from "./FeaturesCards.module.css";
import Calendar from "../Calendar/Calendar";

const announcements = [
  {
    title: "Extreme performance",
    createdAt: "2024-01-01T00:00:00.000Z",
    icon: IconGauge,
  },
  {
    title: "Privacy focused",
    createdAt: "2024-01-01T00:00:00.000Z",
    icon: IconUser,
  },
  {
    title: "No third parties",
    createdAt: "2024-01-01T00:00:00.000Z",
    icon: IconCookie,
  },
];

export const FeaturesCards = () => {
  const router = useRouter();

  const mockdata = [
    {
      title: "Ajanslar",
      description:
        "This dust is actually a powerful poison that will even make a pro wrestler sick, Regice cloaks itself with frigid air of -328 degrees Fahrenheit",
      icon: IconGauge,
      buttonLabel: "Ajans",
    },
    {
      title: "Programlar",
      description:
        "People say it can run at the same speed as lightning striking, Its icy body is so cold, it will not melt even if it is immersed in magma",
      icon: IconUser,
      buttonLabel: "Program",
      onClick: () => {
        router.push("/programlar/ekle");
      },
    },
    {
      title: "Dönemler",
      description:
        "They’re popular, but they’re rare. Trainers who show them off recklessly may be targeted by thieves",
      icon: IconCookie,
      buttonLabel: "Dönem",
    },
    {
      title: "Paydaş/Bölge/İl",
      description:
        "People say it can run at the same speed as lightning striking, Its icy body is so cold, it will not melt even if it is immersed in magma",
      icon: IconUser,
      hideButton: true,
    },
    {
      title: "Eğitimler",
      description:
        "They’re popular, but they’re rare. Trainers who show them off recklessly may be targeted by thieves",
      icon: IconCookie,
      hideButton: true,
    },
  ];

  const features = mockdata.map((feature) => (
    <Card key={feature.title} radius="md" className={classes.card} padding="sm">
      {/* <feature.icon
        style={{ width: rem(50), height: rem(50) }}
        stroke={2}
        color={theme.colors.blue[6]}
      /> */}

      <Text fz="lg" fw={500} className={classes.cardTitle}>
        {feature.title}
      </Text>

      <Text fz="sm" mt="sm" className={classes.cardDetails}>
        {feature.description}
      </Text>

      {feature.hideButton ? null : (
        <Button fullWidth mt="md" radius="md" onClick={feature.onClick}>
          {feature.buttonLabel} Ekle
        </Button>
      )}
    </Card>
  ));

  return (
    <>
      {/* <Group justify="center">
        <Badge variant="filled" size="lg">
          Best company ever
        </Badge>
      </Group>

      <Title order={2} className={classes.title} ta="center" mt="sm">
        Integrate effortlessly with any technology stack
      </Title>

      <Text c="dimmed" className={classes.description} ta="center" mt="md">
        Every once in a while, you’ll see a Golbat that’s missing some fangs.
        This happens when hunger drives it to try biting a Steel-type Pokémon.
      </Text> */}
      <Card className={classes.container} padding="lg">
        <Card radius="md" padding="sm" className={classes.card}>
          <Text fz="lg" fw={500} className={classes.cardTitle}>
            Duyurular
          </Text>

          {announcements?.map((announcement) => (
            <Box key={announcement.title} className={classes.announcementItem}>
              <Text fz="sm" c="dimmed">
                {announcement.title}
              </Text>

              {/* <Text fz="sm" fs="italic" c="dimmed" mt="sm">
                {showDatetime({ date: announcement.createdAt })}
              </Text> */}
            </Box>
          ))}
        </Card>

        <SimpleGrid cols={{ base: 1, md: 5 }} spacing="md" mt="1rem">
          {features}
        </SimpleGrid>

        <Grid mt="1rem">
          <Grid.Col span="auto">
            <Card>
              <Text fz="lg" fw={500} className={classes.cardTitle}>
                İstatistikler
              </Text>

              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <AreaChart
                    h={300}
                    data={[
                      {
                        date: "Mar 22",
                        Apples: 2890,
                        Oranges: 2338,
                        Tomatoes: 2452,
                      },
                      {
                        date: "Mar 23",
                        Apples: 2756,
                        Oranges: 2103,
                        Tomatoes: 2402,
                      },
                      {
                        date: "Mar 24",
                        Apples: 3322,
                        Oranges: 986,
                        Tomatoes: 1821,
                      },
                      {
                        date: "Mar 25",
                        Apples: 3470,
                        Oranges: 2108,
                        Tomatoes: 2809,
                      },
                      {
                        date: "Mar 26",
                        Apples: 3129,
                        Oranges: 1726,
                        Tomatoes: 2290,
                      },
                    ]}
                    dataKey="date"
                    series={[
                      { name: "Apples", color: "indigo.6" },
                      { name: "Oranges", color: "blue.6" },
                      { name: "Tomatoes", color: "teal.6" },
                    ]}
                    curveType="linear"
                    withGradient={false}
                    gridAxis="xy"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <BarChart
                    h={300}
                    data={[
                      {
                        month: "January",
                        Smartphones: 1200,
                        Laptops: 900,
                        Tablets: 200,
                      },
                      {
                        month: "February",
                        Smartphones: 1900,
                        Laptops: 1200,
                        Tablets: 400,
                      },
                      {
                        month: "March",
                        Smartphones: 400,
                        Laptops: 1000,
                        Tablets: 200,
                      },
                      {
                        month: "April",
                        Smartphones: 1000,
                        Laptops: 200,
                        Tablets: 800,
                      },
                      {
                        month: "May",
                        Smartphones: 800,
                        Laptops: 1400,
                        Tablets: 1200,
                      },
                      {
                        month: "June",
                        Smartphones: 750,
                        Laptops: 600,
                        Tablets: 1000,
                      },
                    ]}
                    dataKey="month"
                    type="stacked"
                    series={[
                      { name: "Smartphones", color: "violet.6" },
                      { name: "Laptops", color: "blue.6" },
                      { name: "Tablets", color: "teal.6" },
                    ]}
                  />
                </Grid.Col>
              </Grid>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card>
              <Text fz="lg" fw={500} className={classes.cardTitle}>
                Takvim
              </Text>

              <Calendar />
            </Card>
          </Grid.Col>
        </Grid>
      </Card>
    </>
  );
};
