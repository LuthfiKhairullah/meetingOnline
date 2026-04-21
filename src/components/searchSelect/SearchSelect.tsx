"use client";

import AsyncSelect from "react-select/async";
import { useEffect, useState } from "react";

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
      <label className="block mb-1 text-sm font-medium">{label}</label>

      <AsyncSelect
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        value={selected}
        onChange={(val: any) => {
          setSelected(val);
          onChange(val?.value ?? null);
        }}
        placeholder={`Pilih ${label}`}
        isClearable
        className="text-sm"
      />
    </div>
  );
}