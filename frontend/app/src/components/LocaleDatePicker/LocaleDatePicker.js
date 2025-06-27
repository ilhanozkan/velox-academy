"use client";

import "dayjs/locale/tr";
import { DatePickerInput } from "@mantine/dates";

const LocaleDatePicker = (props) => {
  return <DatePickerInput locale="tr" {...props} />;
};

export default LocaleDatePicker;
