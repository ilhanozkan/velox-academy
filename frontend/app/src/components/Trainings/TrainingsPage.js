"use client";

import { SimpleGrid, Title, LoadingOverlay } from "@mantine/core";
import { useEffect, useState } from "react";
import axios from "axios";

import BadgeCard from "@/components/BadgeCard/BadgeCard";

async function fetchTrainings() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5001";

    const response = await axios({
      method: "GET",
      url: `${apiUrl}/trainings`,
      withCredentials: true,
    });

    if (response.status !== 200) throw new Error("Failed to fetch trainings");

    const data = response.data;

    // Transform API response to match BadgeCard expected format
    const transformedTrainings = data.trainings.map((training) => ({
      id: training.id,
      image: `${process.env.NEXT_PUBLIC_IMAGE_SERVER}/${training.image_file_path}`,
      title: training.name,
      slug: training.slug,
      description: training.description,
      isEnrolled: training.isEnrolled,
    }));

    return transformedTrainings;
  } catch (error) {
    console.error("Error fetching trainings:", error);
    return [];
  }
}

const TrainingsPage = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrainings = async () => {
      setLoading(true);
      try {
        const data = await fetchTrainings();
        setTrainings(data);
      } catch (error) {
        console.error("Error loading trainings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTrainings();
  }, []);

  return (
    <>
      <Title order={1} mb={"sm"} mt="md">
        Eğitimler
      </Title>
      <div style={{ position: "relative" }}>
        <LoadingOverlay visible={loading} />
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {trainings?.map((training, i) => (
            <BadgeCard key={i} data={training} />
          ))}
        </SimpleGrid>
      </div>
    </>
  );
};

export default TrainingsPage;
