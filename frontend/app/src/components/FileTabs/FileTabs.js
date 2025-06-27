import { Tabs } from "@mantine/core";

const FileTabs = ({ data, value }) => {
  return (
    <Tabs.List bg="secondary">
      {data?.map((fileName) => (
        <Tabs.Tab key={fileName} value={fileName}>
          {fileName}
        </Tabs.Tab>
      ))}
    </Tabs.List>
  );
};

export default FileTabs;
