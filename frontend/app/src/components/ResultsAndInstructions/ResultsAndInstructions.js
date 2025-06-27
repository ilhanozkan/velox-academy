import { Tabs } from "@mantine/core";

// Components
import Results from "../Results/Results";
import Instructions from "../Instructions";
// Styles
import classes from "./ResultsAndInstructions.module.css";
import Terminal from "../Terminal/Terminal";

const ResultsAndInstructions = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { value: "instructions", label: "Yönergeler", panel: <Instructions /> },
    { value: "results", label: "Çıktılar", panel: <Results /> },
    { value: "terminal", label: "Terminal", panel: <Terminal /> },
  ];

  return (
    <Tabs
      value={activeTab}
      onChange={setActiveTab}
      variant="unstyled"
      classNames={{
        ...classes,
        list: classes.tabsList,
        panel: classes.tabsPanel,
      }}
      className={classes.root}
    >
      <Tabs.List bg="secondary">
        {tabs.map((tab) => (
          <Tabs.Tab key={tab.value} value={tab.value}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {tabs.map((tab) => (
        <Tabs.Panel key={tab.value} value={tab.value}>
          {tab.panel}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
};

export default ResultsAndInstructions;
