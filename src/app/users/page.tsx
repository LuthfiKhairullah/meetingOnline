"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <Link href="/users/create">+ Tambah User</Link>

      {users.map((u: any) => (
        <div key={u.id}>
          <p>{u.name} - {u.email}</p>
          <Link href={`/users/edit/${u.id}`}>Edit</Link>
        </div>
      ))}
    </div>
  );
}