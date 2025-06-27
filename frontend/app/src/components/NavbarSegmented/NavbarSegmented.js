"use client";

import { useRouter } from "next/navigation";
import { Group, Box, ThemeIcon, rem } from "@mantine/core";

import classes from "./NavbarSegmented.module.css";
import { UserDropdown } from "@/components/UserButton/UserButton";

const NavbarSegmented = ({ data, active }) => {
  const router = useRouter();

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={item.link === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        router.push(item.link);
      }}
    >
      <Group justify="space-between" gap={0}>
        <Box style={{ display: "flex", alignItems: "center" }}>
          <ThemeIcon variant="light" size={26} className={classes.linkIcon}>
            <item.icon style={{ width: rem(20), height: rem(20) }} />
          </ThemeIcon>
        </Box>
      </Group>
      <span>{item.label}</span>
    </a>
  ));

  return (
    <div className={classes.navbar}>
      <div className={classes.navbarMain}>{links}</div>

      <div className={classes.footer}>
        <UserDropdown />
      </div>
    </div>
  );
};

export default NavbarSegmented;
