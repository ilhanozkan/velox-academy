import { NothingFoundBackground } from "@/components/NothingFoundBackground/NothingFoundBackground";

export const metadata = {
  title: "Sayfa Bulunamadı",
  description: "Aradığınız sayfa bulunamadı",
};

const NotFound = (props) => {
  return <NothingFoundBackground />;
};

export default NotFound;
