"use client";

import AsyncSelect from "react-select/async";
import { useEffect, useState } from "react";
import Label from "../form/Label";

interface OptionType {
  value: string | number;
  label: string;
}

interface Props {
  label: string;
  endpoint: string;
  value?: string | number | null;
  onChange: (val: string | number | null) => void;
  getLabel?: (item: any) => string;
  getValue?: (item: any) => string | number;
}

export default function SearchSelect({
  label,
  endpoint,
  value,
  onChange,
  getLabel = (item) => item.name,
  getValue = (item) => item.id,
}: Props) {
  const [selected, setSelected] = useState<OptionType | null>(null);

  // 🔥 Load options (search)
  const loadOptions = async (inputValue: string) => {
    try {
      const res = await fetch(`${endpoint}?search=${inputValue}`);
      const json = await res.json();

      return (json.data || []).map((item: any) => ({
        value: getValue(item),
        label: getLabel(item),
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // 🔥 Load default value (edit mode)
  useEffect(() => {
    const fetchSelected = async () => {
      if (!value) return;

      try {
        const res = await fetch(`${endpoint}/${value}`);
        const json = await res.json();

        if (json.data) {
          const option = {
            value: getValue(json.data),
            label: getLabel(json.data),
          };

          setSelected(option);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSelected();
  }, [value, endpoint]);

  return (
    <div className="w-full">
      <Label className="text-xl">{label}</Label>
      {/* <label className="block mb-1 text-sm font-medium">{label}</label> */}

      <AsyncSelect
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        value={selected}
        onChange={(val: any) => {
          setSelected(val);
          onChange(val?.value ?? null);
        }}
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: "44px",
            borderRadius: "0.5rem",
            backgroundColor: "#ffffff",
            borderColor: state.isFocused ? "#465fff" : "#d1d5db",
            boxShadow: state.isFocused
              ? "0 0 0 3px rgba(70, 95, 255, 0.1)"
              : "none",
            "&:hover": {
              borderColor: "#465fff",
            },
            paddingLeft: "4px",
            paddingRight: "4px",
          }),

          valueContainer: (base) => ({
            ...base,
            padding: "0 8px",
          }),

          input: (base) => ({
            ...base,
            color: "#1f2937",
          }),

          placeholder: (base) => ({
            ...base,
            color: "#9ca3af",
          }),

          singleValue: (base) => ({
            ...base,
            color: "#1f2937",
          }),

          menu: (base) => ({
            ...base,
            borderRadius: "0.5rem",
            overflow: "hidden",
            zIndex: 9999,
          }),

          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
              ? "#465fff"
              : state.isFocused
              ? "#eef2ff"
              : "#ffffff",
            color: state.isSelected ? "#ffffff" : "#1f2937",
            cursor: "pointer",
          }),
        }}
        placeholder={`Pilih ${label}`}
        isClearable
        className="text-sm"
      />
    </div>
  );
}