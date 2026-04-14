"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", path: "/" },
    { name: "Users", path: "/users" },
    { name: "Class", path: "/class" },
  ];

  return (
    <div className="sidebar" data-background-color="dark">
    </div>
  );
}