"use client";

import { forwardRef } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Menu, Text, UnstyledButton, rem } from "@mantine/core";
import { IconChevronDown, IconLogout, IconSettings } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";

import { logout, selectUser } from "@/lib/features/auth/authSlice";
import { imageUrl } from "@/lib/api";
import classes from "./UserMenu.module.css";

export const initials = (user) =>
  (user?.full_name || user?.username || "?")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// Only phrasing content (spans) inside the <button>.
// Menu.Target passes its own className; merge it instead of overriding ours.
const UserButton = forwardRef(({ user, className, ...others }, ref) => (
  <UnstyledButton ref={ref} className={[classes.button, className].filter(Boolean).join(" ")} {...others}>
    <span className={classes.inner}>
      <Avatar src={imageUrl(user?.profile_image)} radius="xl" size="sm" color="primary">
        {initials(user)}
      </Avatar>

      <span className={classes.text}>
        <Text component="span" display="block" size="sm" fw={500} truncate>
          {user?.full_name || user?.username}
        </Text>
        <Text component="span" display="block" c="dimmed" size="xs" truncate>
          {user?.email}
        </Text>
      </span>

      <IconChevronDown size="1rem" aria-hidden className={classes.chevron} />
    </span>
  </UnstyledButton>
));
UserButton.displayName = "UserButton";

const UserMenu = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectUser);

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace("/giris-yap");
  };

  return (
    <Menu width="target" position="top">
      <Menu.Target>
        <UserButton user={user} aria-label="Kullanıcı menüsü" />
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconSettings style={{ width: rem(16), height: rem(16) }} />}
          onClick={() => router.push("/ayarlar")}
        >
          Ayarlar
        </Menu.Item>
        <Menu.Item
          color="red"
          leftSection={<IconLogout style={{ width: rem(16), height: rem(16) }} />}
          onClick={handleLogout}
        >
          Çıkış Yap
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserMenu;
