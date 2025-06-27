import { Title } from "@mantine/core";

import styles from "./PageTitle.module.css";

const PageTitle = ({ title, order, children }) => (
  <header className={styles.header}>
    <div className={styles.children}>{children}</div>
    <Title order={order ?? 2} className={styles.title}>
      {title}
    </Title>
    <div className={styles.empty}></div>
  </header>
);

export default PageTitle;
