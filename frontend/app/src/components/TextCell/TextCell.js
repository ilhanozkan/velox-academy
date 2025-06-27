import { Text, Tooltip } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

// Utils
import isOverflown from "@/utils/isOverflown";
// Styles
import classes from "./TextCell.module.css";

const TextCell = ({ text }) => {
  const ref = useRef(null);
  const [tooltip, setTooltip] = useState(false);

  useEffect(() => {
    if (ref.current && isOverflown(ref.current)) {
      setTooltip(true);
    }
  }, [ref.current]);

  return (
    <Tooltip label={text} position="top" hidden={!tooltip}>
      <Text size="sm" className={classes.cellText} ref={ref}>
        {text}
      </Text>
    </Tooltip>
  );
};

export default TextCell;
