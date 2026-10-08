"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBook, IconChartPie, IconUsers } from "@tabler/icons-react";

import classes from "./AdminNav.module.css";

const LINKS = [
  { href: "/yonetim", label: "Genel bakış", icon: IconChartPie },
  { href: "/yonetim/kullanicilar", label: "Kullanıcılar", icon: IconUsers },
  { href: "/yonetim/egitimler", label: "Eğitimler", icon: IconBook },
];

// Section links that look like tabs. They navigate between pages, so they are
// links with aria-current rather than ARIA tabs (which need tab panels).
const AdminNav = () => {
  const pathname = usePathname();
  const active = [...LINKS].reverse().find((link) => pathname.startsWith(link.href))?.href;

  return (
    <nav className={classes.nav} aria-label="Yönetim bölümleri">
      {LINKS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={classes.link}
          data-active={href === active || undefined}
          aria-current={href === active ? "page" : undefined}
        >
          <Icon size={16} aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default AdminNav;
