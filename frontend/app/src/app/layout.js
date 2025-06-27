import RootLayout from "@/components/RootLayout/RootLayout";

export const metadata = {
  title: "Velox",
  // description: "Programlar sayfası",
};

const RootLayoutMain = ({ children }) => {
  return <RootLayout>{children}</RootLayout>;
};

export default RootLayoutMain;
