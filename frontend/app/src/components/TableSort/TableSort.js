"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Center,
  TextInput,
  rem,
  Button,
  Loader,
  Checkbox,
} from "@mantine/core";
import {
  IconSelector,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
} from "@tabler/icons-react";

import classes from "./TableSort.module.css";
import sortData from "@/utils/sortData";
import { getUser } from "@/lib/features/auth/authSlice";

const Th = ({ children, reversed, sorted, onSort, sortable, style }) => {
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;

  return (
    <Table.Th className={classes.th} style={style}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          {sortable === false ? null : (
            <Center className={classes.icon}>
              <Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            </Center>
          )}
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
};

/**
 * A sortable table component.
 *
 * @component
 * @param {Object[]} columns - An array of column objects.
 * @param {Object[]} data - An array of data objects.
 * @param {string} pageName - The name of the page.
 * @param {Function} onCreateClick - The click event handler for the create button.
 * @param {boolean} loading - Indicates whether the data is currently being loaded.
 * @param {boolean} fetchStarted - Indicates whether the fetch process has started.
 * @param {Function} FilterGroup - The filter group component.
 * @param {Object} filters - The filters object.
 * @param {Function} setFilters - The function to set the filters.
 * @param {string[]} hiddens - The hidden columns.
 * @param {Object} headerStyles - The header styles.
 * @param {string} buttonLabel - The label for the create button.
 * @param {boolean} hideCreateButton - The flag to hide the create button.
 * @param {Function} rowOnClick - The click event handler for the table rows.
 * @param {boolean} hideHeader - The flag to hide the header.
 * @param {Object} filterGroupProps - The filter group props.
 * @param {boolean} selectable - The flag to enable row selection.
 * @param {boolean} selectAll - The flag to select all rows.
 * @returns {JSX.Element} The rendered table component.
 */
export const TableSort = ({
  columns,
  data,
  pageName,
  onCreateClick,
  loading,
  fetchStarted,
  FilterGroup,
  filters,
  setFilters,
  hiddens,
  headerStyles,
  buttonLabel,
  hideCreateButton,
  rowOnClick,
  hideHeader,
  filterGroupProps,
  selectable,
  selectAll,
}) => {
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState(data || []);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(data, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(
      sortData(data, { sortBy, reversed: reverseSortDirection, search: value })
    );
  };

  // Selectable table
  const toggleRow = (id) =>
    selectable?.setSelection((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  const toggleAll = () =>
    selectable?.setSelection((current) =>
      current.length === data.length ? [] : data.map((r) => r?.id)
    );

  const rows = (sortedData || [])?.map((row, id) => (
    <Table.Tr
      key={id}
      className={
        selectable?.selection.includes(row?.id)
          ? `${classes.tr} ${classes.rowSelected}`
          : classes.tr
      }
      style={{ width: 40 }}
    >
      {selectable ? (
        <Table.Td>
          <Checkbox
            checked={selectable?.selection.includes(row?.id)}
            onChange={() => toggleRow(row?.id)}
          />
        </Table.Td>
      ) : null}

      {columns.map((column) => (
        <Table.Td
          key={column.name}
          className={
            rowOnClick ? `${classes.tdClickable} ${classes.td}` : classes.td
          }
          style={{ width: 40 }}
          onClick={() => (rowOnClick ? rowOnClick(row) : null)}
        >
          {column.render ? column.render(row, id) : row[column.name]}
        </Table.Td>
      ))}
    </Table.Tr>
  ));

  useEffect(() => {
    setSortedData(data || []);

    // Set all data selected first time
    if (selectable && data.length > 0 && selectAll)
      selectable.setSelection(data.map((r) => r?.id));
  }, [data]);

  return (
    <>
      {hideHeader ? null : (
        <div className={classes.header} style={headerStyles}>
          <TextInput
            placeholder="Ara"
            mb="md"
            radius="md"
            leftSection={
              <IconSearch
                style={{ width: rem(16), height: rem(16) }}
                stroke={1.5}
              />
            }
            value={search}
            onChange={handleSearchChange}
            className={classes.searchInput}
            style={{
              marginRight: hideCreateButton && !FilterGroup ? 0 : rem(20),
            }}
          />

          {FilterGroup ? (
            <FilterGroup
              filters={filters}
              setFilters={setFilters}
              hiddens={hiddens}
              {...filterGroupProps}
            />
          ) : null}

          {hideCreateButton ? null : (
            <Button
              radius="md"
              className={classes.createButton}
              onClick={onCreateClick}
            >
              {buttonLabel ? buttonLabel : `Yeni ${pageName} Ekle`}
            </Button>
          )}
        </div>
      )}

      <ScrollArea>
        <Table
          horizontalSpacing="md"
          verticalSpacing="xs"
          miw={700}
          layout="fixed"
          highlightOnHover
          className={classes.table}
          striped
          withColumnBorders
        >
          <Table.Tbody>
            <Table.Tr className={classes.tableHeader}>
              {selectable ? (
                <Th
                  sortable={false}
                  style={{
                    width: 54,
                  }}
                >
                  <Checkbox
                    onChange={toggleAll}
                    checked={selectable?.selection.length == data.length}
                    indeterminate={
                      selectable?.selection.length > 0 &&
                      selectable?.selection.length != data.length
                    }
                  />
                </Th>
              ) : null}

              {columns?.map((column) => {
                console.log(column);
                return (
                  <Th
                    key={column.name}
                    sorted={sortBy == column.name}
                    reversed={reverseSortDirection}
                    onSort={() => {
                      column.sortable === false
                        ? null
                        : setSorting(column.name);
                    }}
                    sortable={column.sortable}
                    style={column.style}
                  >
                    {column.label}
                  </Th>
                );
              })}
            </Table.Tr>
          </Table.Tbody>
          <Table.Tbody>
            {rows?.length > 0 ? (
              rows
            ) : loading ? (
              <Table.Tr>
                <Table.Td colSpan={Object.keys(columns).length}>
                  <Text fw={500} ta="center" className={classes.centerText}>
                    <Loader size={18} style={{ marginRight: "0.25rem" }} />
                    Yükleniyor...
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : fetchStarted ? (
              <Table.Tr>
                <Table.Td colSpan={Object.keys(columns).length}>
                  <Text fw={500} ta="center">
                    {pageName} verisi bulunamadı.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : null}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </>
  );
};
