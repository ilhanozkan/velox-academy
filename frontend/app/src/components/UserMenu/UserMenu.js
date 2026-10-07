"use client";

import { forwardRef } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Group, Menu, Text, UnstyledButton, rem } from "@mantine/core";
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

const UserButton = forwardRef(({ user, ...others }, ref) => (
  <UnstyledButton ref={ref} className={classes.button} {...others}>
    <Group gap="xs" wrap="nowrap">
      <Avatar src={imageUrl(user?.profile_image)} radius="xl" size="sm" color="primary">
        {initials(user)}
      </Avatar>

      <div className={classes.text}>
        <Text size="sm" fw={500} truncate>
          {user?.full_name || user?.username}
        </Text>
        <Text c="dimmed" size="xs" truncate>
          {user?.email}
        </Text>
      </div>

      <IconChevronDown size="1rem" aria-hidden />
    </Group>
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
