"use client";

import { Alert, Badge, Center, Group, Loader, ScrollArea, Stack, Table, Text } from "@mantine/core";
import { IconAlertTriangle, IconTerminal2 } from "@tabler/icons-react";

import classes from "./Results.module.css";

const MAX_ROWS = 500;

const Cell = ({ value }) => {
  if (value === null || value === undefined)
    return (
      <Text span fs="italic" c="dimmed" size="sm">
        NULL
      </Text>
    );
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const ResultTable = ({ rows }) => {
  const columns = Object.keys(rows[0] || {});
  const visible = rows.slice(0, MAX_ROWS);

  return (
    <ScrollArea className={classes.tableScroll} type="auto">
      <Table striped highlightOnHover withColumnBorders stickyHeader className={classes.table}>
        <Table.Thead>
          <Table.Tr>
            {columns.map((column) => (
              <Table.Th key={column}>{column}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {visible.map((row, index) => (
            <Table.Tr key={index}>
              {columns.map((column) => (
                <Table.Td key={column}>
                  <Cell value={row[column]} />
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
};

/**
 * Output of the last run: query rows, program output or an error. Errors used
 * to be dropped (the panel kept showing its placeholder) and an object result
 * could crash the page.
 */
const Results = ({ result, running }) => {
  if (running && !result)
    return (
      <Center py="xl">
        <Group gap="xs">
          <Loader size="sm" />
          <Text c="dimmed">Çalıştırılıyor…</Text>
        </Group>
      </Center>
    );

  if (!result)
    return (
      <Center py="xl" px="md">
        <Stack align="center" gap={6}>
          <IconTerminal2 size={32} stroke={1.4} color="var(--mantine-color-gray-5)" aria-hidden />
          <Text c="dimmed" ta="center">
            Bir dosyayı çalıştırdığınızda sonucu burada görünecek.
          </Text>
        </Stack>
      </Center>
    );

  const { data, file, durationMs } = result;
  const meta = (
    <Group gap="xs" mb="xs">
      <Badge variant="light" color="gray" tt="none">
        {file}
      </Badge>
      {Array.isArray(data) ? <Badge variant="light">{data.length} satır</Badge> : null}
      {durationMs !== undefined ? (
        <Text size="xs" c="dimmed">
          {durationMs} ms
        </Text>
      ) : null}
      {running ? <Loader size="xs" /> : null}
    </Group>
  );

  if (data && typeof data === "object" && !Array.isArray(data) && (data.error || data.message))
    return (
      <div className={classes.panel}>
        {meta}
        <Alert color="red" variant="light" icon={<IconAlertTriangle />} title="Hata" role="alert">
          <pre className={classes.errorText}>{data.message || "Bilinmeyen hata"}</pre>
        </Alert>
      </div>
    );

  if (Array.isArray(data))
    return (
      <div className={classes.panel}>
        {meta}
        {data.length ? (
          <>
            <ResultTable rows={data} />
            {data.length > MAX_ROWS ? (
              <Text size="xs" c="dimmed" mt="xs">
                İlk {MAX_ROWS} satır gösteriliyor.
              </Text>
            ) : null}
          </>
        ) : (
          <Text c="dimmed">Sorgu çalıştı ancak hiç satır döndürmedi.</Text>
        )}
      </div>
    );

  return (
    <div className={classes.panel}>
      {meta}
      <pre className={classes.output}>
        {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default Results;
