"use client";

import { useMemo, useState } from "react";

type DualListProps<T> = {
  available: T[];
  assigned: T[];
  setAvailable: (data: T[]) => void;
  setAssigned: (data: T[]) => void;

  getLabel: (item: T) => string;
  getKey: (item: T) => string | number;

  onMoveRight?: (items: T[]) => Promise<void>; // 🔥 API call
  onMoveLeft?: (items: T[]) => Promise<void>;  // 🔥 API call
};

export default function DualList<T>({
  available,
  assigned,
  setAvailable,
  setAssigned,
  getLabel,
  getKey,
  onMoveRight,
  onMoveLeft,
}: DualListProps<T>) {
  const [selectedLeft, setSelectedLeft] = useState<T[]>([]);
  const [selectedRight, setSelectedRight] = useState<T[]>([]);

  const [searchLeft, setSearchLeft] = useState("");
  const [searchRight, setSearchRight] = useState("");

  const [loading, setLoading] = useState(false);

  const filteredLeft = useMemo(() => {
    return available.filter((item) =>
      getLabel(item).toLowerCase().includes(searchLeft.toLowerCase())
    );
  }, [available, searchLeft]);

  const filteredRight = useMemo(() => {
    return assigned.filter((item) =>
      getLabel(item).toLowerCase().includes(searchRight.toLowerCase())
    );
  }, [assigned, searchRight]);

  const toggle = (item: T, side: "left" | "right") => {
    if (side === "left") {
      setSelectedLeft((prev) =>
        prev.some((i) => getKey(i) === getKey(item))
          ? prev.filter((i) => getKey(i) !== getKey(item))
          : [...prev, item]
      );
    } else {
      setSelectedRight((prev) =>
        prev.some((i) => getKey(i) === getKey(item))
          ? prev.filter((i) => getKey(i) !== getKey(item))
          : [...prev, item]
      );
    }
  };

  const moveRight = async () => {
    if (selectedLeft.length === 0) return;

    try {
      setLoading(true);

      // 🔥 CALL API DULU
      if (onMoveRight) {
        await onMoveRight(selectedLeft);
      }

      // 🔄 UPDATE UI
      setAssigned([...assigned, ...selectedLeft]);
      setAvailable(
        available.filter(
          (a) => !selectedLeft.some((s) => getKey(s) === getKey(a))
        )
      );

      setSelectedLeft([]);
    } catch (err) {
      console.error("Move Right Error:", err);
      alert("Gagal update data");
    } finally {
      setLoading(false);
    }
  };

  const moveLeft = async () => {
    if (selectedRight.length === 0) return;

    try {
      setLoading(true);

      // 🔥 CALL API DULU
      if (onMoveLeft) {
        await onMoveLeft(selectedRight);
      }

      // 🔄 UPDATE UI
      setAvailable([...available, ...selectedRight]);
      setAssigned(
        assigned.filter(
          (a) => !selectedRight.some((s) => getKey(s) === getKey(a))
        )
      );

      setSelectedRight([]);
    } catch (err) {
      console.error("Move Left Error:", err);
      alert("Gagal update data");
    } finally {
      setLoading(false);
    }
  };

  const List = ({
    title,
    items,
    selected,
    onToggle,
    search,
    setSearch,
  }: any) => (
    <div className="w-full bg-white shadow rounded-2xl p-4">
      <h2 className="font-bold mb-2">{title}</h2>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="border p-2 w-full mb-3 rounded"
        disabled={loading}
      />

      <div className="border rounded h-64 overflow-auto">
        {items.map((item: T) => (
          <div
            key={getKey(item)}
            onClick={() => onToggle(item)}
            className={`p-2 cursor-pointer ${
              selected.some((i: T) => getKey(i) === getKey(item))
                ? "bg-blue-100"
                : "hover:bg-gray-100"
            }`}
          >
            {getLabel(item)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-3 gap-1 items-center">
      <List
        title="Available"
        items={filteredLeft}
        selected={selectedLeft}
        onToggle={(item: T) => toggle(item, "left")}
        search={searchLeft}
        setSearch={setSearchLeft}
      />

      <div className="flex flex-col gap-2 items-center">
        <button
          onClick={moveRight}
          disabled={loading}
          className="bg-blue-500 text-white px-3 py-2 rounded disabled:opacity-50"
        >
          &gt;
        </button>
        <button
          onClick={moveLeft}
          disabled={loading}
          className="bg-gray-500 text-white px-3 py-2 rounded disabled:opacity-50"
        >
          &lt;
        </button>
      </div>

      <List
        title="Assigned"
        items={filteredRight}
        selected={selectedRight}
        onToggle={(item: T) => toggle(item, "right")}
        search={searchRight}
        setSearch={setSearchRight}
      />
    </div>
  );
}