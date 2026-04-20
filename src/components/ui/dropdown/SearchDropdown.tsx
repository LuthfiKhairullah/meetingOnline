'use client'

import { useState } from "react";

interface Option {
  label: string;
  value: string | number;
}

interface Props {
  label: string;
  options: Option[];
  value?: string | number;
  onChange: (val: any) => void;
}

export default function SearchableDropdown({
  label,
  options,
  value,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = options.find((opt) => opt.value === value);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <label className="block mb-1">{label}</label>

      {/* Trigger */}
      <div
        onClick={() => setOpen(!open)}
        className="border p-2 rounded cursor-pointer bg-white"
      >
        {selected ? selected.label : "Pilih data"}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-10 w-full border bg-white rounded mt-1 shadow max-h-60 overflow-auto">
          
          {/* Search */}
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 border-b outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Items */}
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.value}
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                  setSearch("");
                }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                {item.label}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 text-sm">
              Tidak ditemukan
            </div>
          )}
        </div>
      )}
    </div>
  );
}