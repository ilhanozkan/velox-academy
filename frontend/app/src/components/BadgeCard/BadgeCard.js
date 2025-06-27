"use client";

import { Card, Image, Text, Group, Badge, Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  getSandboxDetails,
  enrollInTraining,
} from "../../lib/features/trainings/trainingsSlice";

import classes from "./BadgeCard.module.css";

const BadgeCard = ({ data }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { id, image, title, description, badges, isEnrolled } = data;

  const handleButtonClick = async () => {
    if (isEnrolled) {
      // Get sandbox details
      try {
        dispatch(getSandboxDetails(id)).unwrap();
        router.push(`/egitimler/${id}`);
      } catch (error) {
        console.error("Failed to get sandbox details:", error);
      }
    } else {
      // Enroll in training first
      try {
        dispatch(enrollInTraining(id)).unwrap();
        router.push(`/egitimler/${id}`);
      } catch (error) {
        console.error("Failed to enroll in training:", error);
      }
    }
  };

  const features = badges?.map((badge) => (
    <Badge
      variant="light"
      key={badge.label}
      leftSection={badge.emoji}
      bg={badge.color}
      className={classes.badge}
    >
      {badge.label}
    </Badge>
  ));

  return (
    <Card withBorder radius="md" p="md" className={classes.card}>
      <Card.Section className={classes.imgSection}>
        <Badge
          size="sm"
          color={isEnrolled ? "#4caf50" : "#2196f3"}
          className={classes.statusBadge}
        >
          {isEnrolled ? "Devam Ediyor" : "Başlamadı"}
        </Badge>

        <Image src={image} alt={title} className={classes.cardImage} />
      </Card.Section>

      <Card.Section className={classes.section} mt="md">
        <Group justify="apart">
          <Text fz="lg" fw={500}>
            {title}
          </Text>
        </Group>
        <Text fz="sm" mt="xs">
          {description}
        </Text>
      </Card.Section>

      {features?.length > 0 && (
        <Card.Section className={classes.section}>
          <Group gap={7} mt={5}>
            {features}
          </Group>
        </Card.Section>
      )}

      <Group mt="xs">
        <Button radius="md" style={{ flex: 1 }} onClick={handleButtonClick}>
          {isEnrolled ? "Eğitime git" : "Eğitime başla"}
        </Button>
        {/* <ActionIcon variant="default" radius="md" size={36}>
          <IconHeart className={classes.like} stroke={1.5} />
        </ActionIcon> */}
      </Group>
    </Card>
  );
};

export default BadgeCard;
