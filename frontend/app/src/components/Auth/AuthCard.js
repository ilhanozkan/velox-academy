import { Text, ThemeIcon, Title } from "@mantine/core";
import { IconCode, IconServer2, IconTrophy } from "@tabler/icons-react";

import VeloxLogo from "@/app/icons/logo-colored.svg";
import classes from "./AuthCard.module.css";

const FEATURES = [
  {
    icon: IconServer2,
    title: "Size özel sanal makine",
    description: "Her eğitim için hazır veritabanı ve araçlarla kurulu bir ortam.",
  },
  {
    icon: IconCode,
    title: "Tarayıcıda editör ve terminal",
    description: "Kurulum yapmadan kod yazın, çalıştırın ve sonucunu görün.",
  },
  {
    icon: IconTrophy,
    title: "Adım adım ilerleyin",
    description: "Yönergeleri tamamladıkça başarılar kazanın, ilerlemenizi takip edin.",
  },
];

/** Sign-in and registration layout: brand panel and the form side by side. */
const AuthCard = ({ title, subtitle, children, footer }) => (
  <div className={classes.page}>
    <aside className={classes.brand}>
      <VeloxLogo className={classes.brandLogo} aria-label="Velox Academy" />

      <div className={classes.brandBody}>
        <Title order={2} className={classes.brandTitle}>
          Gerçek sanal makinelerde uygulamalı yazılım eğitimi
        </Title>

        <ul className={classes.features}>
          {FEATURES.map(({ icon: Icon, title: featureTitle, description }) => (
            <li key={featureTitle} className={classes.feature}>
              <ThemeIcon size={40} radius="md" className={classes.featureIcon} aria-hidden>
                <Icon size={22} stroke={1.6} />
              </ThemeIcon>
              <div>
                <Text fw={600} c="white">
                  {featureTitle}
                </Text>
                <Text size="sm" className={classes.featureText}>
                  {description}
                </Text>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Text size="xs" className={classes.featureText}>
        © {new Date().getFullYear()} Velox Academy
      </Text>
    </aside>

    <main className={classes.formSide}>
      <div className={classes.formContainer}>
        <VeloxLogo className={classes.mobileLogo} aria-label="Velox Academy" />

        <Title order={1} className={classes.title}>
          {title}
        </Title>
        {subtitle ? (
          <Text c="dimmed" mt={6} className={classes.subtitle}>
            {subtitle}
          </Text>
        ) : null}

        <div className={classes.form}>{children}</div>

        {footer ? (
          <Text c="dimmed" size="sm" ta="center" mt="xl">
            {footer}
          </Text>
        ) : null}
      </div>
    </main>
  </div>
);

export default AuthCard;
