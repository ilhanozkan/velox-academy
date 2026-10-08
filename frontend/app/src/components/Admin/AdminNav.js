"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs } from "@mantine/core";
import { IconBook, IconChartPie, IconUsers } from "@tabler/icons-react";

const TABS = [
  { value: "/yonetim", label: "Genel bakış", icon: IconChartPie },
  { value: "/yonetim/kullanicilar", label: "Kullanıcılar", icon: IconUsers },
  { value: "/yonetim/egitimler", label: "Eğitimler", icon: IconBook },
];

const AdminNav = () => {
  const pathname = usePathname();
  const active = [...TABS].reverse().find((tab) => pathname.startsWith(tab.value))?.value;

  return (
    <Tabs value={active} mb="lg">
      <Tabs.List>
        {TABS.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            leftSection={<tab.icon size={16} />}
            component={Link}
            href={tab.value}
          >
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
};

export default AdminNav;
