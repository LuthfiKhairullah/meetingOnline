"use client";

import { useState, useEffect } from "react";

interface Option {
  [key: string]: any; // biar fleksibel
}

interface Props {
  label: string;
  endpoint: string;
  value?: string;
  onChange: (val: string) => void;
  getLabel?: (item: Option) => string; // 🔥 custom label
  getValue?: (item: Option) => string; // 🔥 custom value
}

export default function SearchDropdown({
  label,
  endpoint,
  value,
  onChange,
  getLabel = (item) => item.name, // default
  getValue = (item) => item.id,   // default
}: Props) {
  const [options, setOptions] = useState<Option[]>([]);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${endpoint}?search=${search}`);
      const json = await res.json();
      setOptions(json.data);
    };

    fetchData();
  }, [search, endpoint]);

  useEffect(() => {
    if (value && options.length > 0) {
      const selected = options.find(
        (item) => getValue(item) === value
      );

      if (selected) {
        setSearch(getLabel(selected));
      }
    }
  }, [value, options]);

  return (
    <div className="relative w-full">
      <label className="block mb-1">{label}</label>

      <input
        className="border p-2 w-full"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        placeholder="Search..."
      />

      {show && (
        <div className="absolute z-10 bg-white border w-full max-h-40 overflow-y-auto">
          {options.map((item, idx) => (
            <div
              key={idx}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange(getValue(item));
                setSearch(getLabel(item));
                setShow(false);
              }}
            >
              {getLabel(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}