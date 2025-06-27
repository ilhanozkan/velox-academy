import { useEffect, useState } from "react";
import { Text } from "@mantine/core";

import { TableSort } from "../TableSort/TableSort";
import { useSocket } from "@/contexts/SocketContext";
import TextCell from "../TextCell/TextCell";

const Results = () => {
  const [data, setData] = useState(null);

  // Get shared socket connection
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleResult = (data) => {
      setData(data);
    };

    socket.off("result");

    socket.on("result", handleResult);

    return () => {
      socket.off("result", handleResult);
    };
  }, [socket]);

  if (!data || !data?.length) {
    return (
      <Text>
        Bir sorgu çalıştırarak sonuçları burada görüntüleyebilirsiniz.
      </Text>
    );
  }

  if (Array.isArray(data) && !data?.length) {
    return <Text>Veri bulunamadı.</Text>;
  }

  if (Array.isArray(data) && data?.length)
    return (
      <TableSort
        data={data}
        columns={
          data.length
            ? Object.keys(data[0])?.map((key) => ({
                name: key,
                label: key,
                render: (row) => {
                  return (
                    <TextCell
                      text={row[key]}
                      style={{
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                        width: "100%",
                      }}
                    />
                  );
                },
              }))
            : []
        }
        hideHeader
      />
    );

  return <Text>{data}</Text>;
};

export default Results;
