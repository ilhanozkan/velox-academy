import { Suspense } from "react";

import Workspace from "@/components/Workspace/Workspace";

export const metadata = {
  title: "Eğitim",
};

const TrainingPage = () => (
  <Suspense>
    <Workspace />
  </Suspense>
);

export default TrainingPage;
