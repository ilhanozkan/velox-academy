import { useEffect, useState } from "react";
import { Combobox, Loader, TextInput, useCombobox } from "@mantine/core";

export const AsyncAutocomplete = ({
  options,
  value,
  setValue,
  loading,
  ...props
}) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  // Filtered options
  const [filteredOptions, setFilteredOptions] = useState(options);
  // Label value
  const [label, setLabel] = useState(value.label);

  // Set filtered options when options change
  useEffect(() => {
    if (options) {
      setFilteredOptions(options);
    }
  }, [options]);

  // Set label value when value change
  useEffect(() => {
    setLabel(value.label);
  }, [value]);

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        setValue(optionValue);
        combobox.closeDropdown();
      }}
      withinPortal={false}
      store={combobox}
    >
      <Combobox.Target>
        <TextInput
          value={label}
          onChange={(event) => {
            // Filter options
            setFilteredOptions(
              options.filter((option) =>
                option.label
                  .toLocaleLowerCase("tr-TR")
                  .includes(
                    (event.currentTarget.value || "")?.toLocaleLowerCase(
                      "tr-TR"
                    )
                  )
              )
            );

            // Set label value
            setLabel(event.currentTarget.value);

            combobox.resetSelectedOption();
            combobox.openDropdown();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => {
            combobox.openDropdown();
          }}
          onBlur={() => combobox.closeDropdown()}
          rightSection={loading && <Loader size={18} />}
          {...props}
        />
      </Combobox.Target>

      <Combobox.Dropdown hidden={filteredOptions === null}>
        <Combobox.Options>
          {filteredOptions?.length == 0 ? (
            <Combobox.Empty>Seçenek bulunamadı</Combobox.Empty>
          ) : (
            (filteredOptions || []).map((item) => (
              <Combobox.Option value={item.value} key={item.value}>
                {item.label}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
