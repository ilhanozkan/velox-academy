import { convertToISO } from "./timeOptions";

const getQueries = (queries) => {
  let queryURL = "";

  if (queries) {
    queryURL = "?";

    Object.keys(queries).forEach((key) => {
      if (
        queries[key] === null ||
        queries[key] === undefined ||
        queries[key] === ""
      )
        return;

      // Date format
      if (key === "startDate" || key === "endDate") {
        queryURL += `${key}=${convertToISO(queries[key])}&`;
        return;
      }

      queryURL += `${key}=${queries[key]}&`;
    });

    queryURL = queryURL.slice(0, -1);
  }

  return queryURL;
};

export default getQueries;
