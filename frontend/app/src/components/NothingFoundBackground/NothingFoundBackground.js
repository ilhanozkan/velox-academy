"use client";
import { Container, Title, Text, Button, Group } from "@mantine/core";
import { useRouter } from "next/navigation";

import { Illustration } from "./Illustration";
import classes from "./NothingFoundBackground.module.css";

export const NothingFoundBackground = () => {
  const router = useRouter();

  return (
    <Container className={classes.root}>
      <div className={classes.inner}>
        <Illustration className={classes.image} />
        <div className={classes.content}>
          <Title className={classes.title}>Kaybolmuş Görünüyorsunuz</Title>
          <Text
            c="dimmed"
            size="lg"
            ta="center"
            className={classes.description}
          >
            Açmaya çalıştığınız sayfa mevcut değil. Adresi yanlış yazmış
            olabilirsiniz veya sayfa başka bir URL'ye taşınmış olabilir.
          </Text>
          <Group justify="center">
            <Button
              size="md"
              radius="md"
              onClick={() => {
                router.push("/");
              }}
            >
              Ana Sayfaya Geri Dön
            </Button>
          </Group>
        </div>
      </div>
    </Container>
  );
};
