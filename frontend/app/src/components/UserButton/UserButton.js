import { forwardRef } from "react";
import { IconChevronDown, IconLogout } from "@tabler/icons-react";
import {
  Group,
  Avatar,
  Text,
  Menu,
  UnstyledButton,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";

import { getUser, handleLogout } from "@/lib/features/auth/authSlice";
import classes from "./UserButton.module.css";

const UserButton = forwardRef(({ image, username, email, icon, ...others }, ref) => (
  <UnstyledButton
    ref={ref}
    style={{
      paddingBlock: "var(--mantine-spacing-xs)",
      paddingInline: "var(--mantine-spacing-sm)",
      color: "var(--mantine-color-text)",
      borderRadius: "var(--mantine-radius-md)",
      backgroundColor: "var(--mantine-color-soft-0)",
      width: "100%",
    }}
    {...others}
  >
    <Group style={{ gap: "0.5rem", width: "100%" }}>
      <Avatar src={image} radius="xl" size={"sm"} />

      <div style={{ flex: 1, width: "100%" }}>
        <Text size="sm" fw={500}>
          {username || ""}
        </Text>

        <Text
          c="dimmed"
          size="xs"
          className={classes.userButtonDescription}
        >
          {email || ""}
        </Text>
      </div>

      {icon || <IconChevronDown size="1rem" />}
    </Group>
  </UnstyledButton>
));

export const UserDropdown = () => {
  const dispatch = useDispatch();
  const theme = useMantineTheme();
  const user = useSelector(getUser);

  return (
    <Menu>
      <Menu.Target>
        <UserButton
          image="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png"
          username={user.username || ""}
          email={user.email || ""}
        />
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={
            <IconLogout
              style={{ width: rem(16), height: rem(16) }}
              color={theme.colors.red[6]}
              stroke={1.5}
            />
          }
          onClick={() => {
            dispatch(handleLogout());
          }}
        >
          Çıkış Yap
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
