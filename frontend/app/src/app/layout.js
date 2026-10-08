import { ColorSchemeScript } from "@mantine/core";

// Mantine Styles
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dropzone/styles.css";
import "@/app/styles/globals.css";

import Providers from "./providers";

export const metadata = {
  title: {
    default: "Velox Academy",
    template: "%s | Velox Academy",
  },
  description: "Gerçek sanal makinelerde uygulamalı yazılım eğitimleri",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const RootLayout = ({ children }) => {
  return (
    <html lang="tr">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
