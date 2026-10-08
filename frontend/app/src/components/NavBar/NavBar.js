"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeIcon, rem } from "@mantine/core";
import { IconShieldCog } from "@tabler/icons-react";
import { useSelector } from "react-redux";

import { selectIsAdmin } from "@/lib/features/auth/authSlice";
import UserMenu from "@/components/UserMenu/UserMenu";
import VeloxLogo from "@/app/icons/logo-colored.svg";
import TrainingsIcon from "@/app/icons/trainings.svg";
import StatisticsIcon from "@/app/icons/statistics.svg";
import SettingsIcon from "@/app/icons/settings.svg";
import classes from "./NavBar.module.css";

const LINKS = [
  { icon: TrainingsIcon, label: "Eğitimler", link: "/egitimler" },
  { icon: StatisticsIcon, label: "İstatistikler", link: "/istatistikler" },
  { icon: SettingsIcon, label: "Ayarlar", link: "/ayarlar" },
];

const ADMIN_LINK = { icon: IconShieldCog, label: "Yönetim", link: "/yonetim" };

const NavBar = ({ onNavigate }) => {
  const pathname = usePathname();
  const isAdmin = useSelector(selectIsAdmin);
  const links = isAdmin ? [...LINKS, ADMIN_LINK] : LINKS;

  return (
    <nav className={classes.navbar} aria-label="Ana menü">
      <Link href="/egitimler" className={classes.logo} aria-label="Velox Academy ana sayfa" onClick={onNavigate}>
        <VeloxLogo aria-hidden />
      </Link>

      <div className={classes.links}>
        {links.map((item) => {
          const active = pathname === item.link || pathname.startsWith(`${item.link}/`);
          return (
            <Link
              key={item.link}
              href={item.link}
              className={classes.link}
              data-active={active || undefined}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
            >
              <ThemeIcon variant="light" size={26} className={classes.linkIcon} aria-hidden>
                <item.icon style={{ width: rem(20), height: rem(20) }} />
              </ThemeIcon>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className={classes.footer}>
        <UserMenu />
      </div>
    </nav>
  );
};

export default NavBar;
