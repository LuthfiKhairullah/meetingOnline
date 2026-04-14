import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DataTable from "@/components/dataTables/DataTable";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Users",
  description:
    "List Users",
  // other metadata
};

export default function UsersPage() {
  const user = {
    role: 'admin', // contoh dari session / auth
  }
  const permissions = ['user:update', 'user:delete']

  const canEdit = permissions.includes('user:update')
  const canDelete = permissions.includes('user:delete')

  const columns = [
    { header: 'Fullname', accessorKey: 'fullname' },
    { header: 'Username', accessorKey: 'username' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'No HP', accessorKey: 'noHp' },
    { header: 'Address', accessorKey: 'alamat' },
  ]

  return (
    <div>
      <PageBreadcrumb pageTitle="Users" />
      <div className="space-y-6">
        <Link
            href="/admin/users/create"
          className="px-2 py-1 bg-blue-500 text-white rounded"
        >
          Create
        </Link>
        <div className="space-y-6"></div>
        <ComponentCard title="">
          <DataTable
            columns={columns}
            endpoint="/api/users"
            canEdit={canEdit}
            canDelete={canDelete}
            editUrl="/admin/users/edit"
          />
        </ComponentCard>
      </div>
    </div>
  );
}
