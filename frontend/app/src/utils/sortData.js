import { keys } from "@mantine/core";

const filterData = (data, search) => {
  const query = search.toLocaleLowerCase("tr-TR").trim();

  return data?.filter((item) => {
    return keys(data[0]).some((key) => {
      if (typeof item[key] == "string")
        return item[key]?.toLocaleLowerCase("tr-TR")?.includes(query);
    });
  });
};

const sortData = (data, payload) => {
  const { sortBy } = payload;

  if (!sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...(data ?? [])].sort((a, b) => {
      if (payload.reversed) {
        if (typeof a[sortBy] === "number" && typeof b[sortBy] === "number")
          return b[sortBy] - a[sortBy];

        if (typeof a[sortBy] === "boolean" && typeof b[sortBy] === "boolean")
          return b[sortBy] - a[sortBy];

        return b[sortBy]?.localeCompare(a[sortBy]);
      }

      if (typeof a[sortBy] === "number" && typeof b[sortBy] === "number")
        return a[sortBy] - b[sortBy];

      if (typeof a[sortBy] === "boolean" && typeof b[sortBy] === "boolean")
        return a[sortBy] - b[sortBy];

      return a[sortBy]?.localeCompare(b[sortBy]);
    }),
    payload.search
  );
};

export default sortData;
