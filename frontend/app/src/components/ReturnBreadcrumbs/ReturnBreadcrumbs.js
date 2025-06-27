import { Breadcrumbs, Anchor } from "@mantine/core";

/**
 * Renders a breadcrumbs component with a list of items.
 *
 * @component
 * @param {Object[]} items - The list of breadcrumb items.
 * @param {string} items[].href - The URL for the breadcrumb item.
 * @param {string} items[].title - The title of the breadcrumb item.
 * @returns {JSX.Element} The rendered breadcrumbs component.
 */
const ReturnBreadcrumbs = ({ items }) => {
  const list = items.map((item, index) => (
    <Anchor href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

  return (
    <>
      <Breadcrumbs>{list}</Breadcrumbs>
    </>
  );
};

export default ReturnBreadcrumbs;
