"use client";

// Mantine imports
import { ScrollArea } from "@mantine/core";
// Next.js imports
import { usePathname, useRouter } from "next/navigation";

// Styles
import styles from "./Navbar.module.css";
// Logo
import CyberHomelandLogo from "@/app/icons/logo-colored.svg";
// Icons
import HomeIcon from "@/app/icons/home.svg";
import TrainingsIcon from "@/app/icons/trainings.svg";
import StatisticsIcon from "@/app/icons/statistics.svg";
import SettingsIcon from "@/app/icons/settings.svg";
import NavbarSegmented from "@/components/NavbarSegmented/NavbarSegmented";
import { useAppStore } from "@/lib/hooks";

const data = [
  // {
  //   icon: HomeIcon,
  //   label: "Ana Sayfa",
  //   link: "/",
  // },
  {
    icon: TrainingsIcon,
    label: "Eğitimler",
    link: "/egitimler",
  },
  {
    icon: StatisticsIcon,
    label: "İstatistikler",
    link: "/istatistikler",
  },
  {
    icon: SettingsIcon,
    label: "Ayarlar",
    link: "/ayarlar",
  },
];

const NavBar = () => {
  const path = usePathname();
  const router = useRouter();

  const store = useAppStore();

  return (
    <>
      {/* <nav className={styles.navbar}> */}
      <a
        href="/"
        className={styles.logo}
        onClick={(e) => {
          e.preventDefault();
          router.push("/");
        }}
      >
        <CyberHomelandLogo style={{ marginBottom: "2.5rem" }} />
      </a>

      {/* <ScrollArea className={styles.links}> */}
      <NavbarSegmented data={data} active={`/${path.split("/")[1]}`} />
      {/* </ScrollArea> */}
      {/* </nav> */}
    </>
  );
};

export default NavBar;
