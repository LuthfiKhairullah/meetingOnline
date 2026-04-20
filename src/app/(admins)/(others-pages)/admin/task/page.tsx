import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DataTable from "@/components/dataTables/DataTable";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Task",
  description:
    "List Task",
  // other metadata
};

export default function TaskPage() {
  const user = {
    role: 'admin', // contoh dari session / auth
  }
  const permissions = ['user:update', 'user:delete']

  const canEdit = permissions.includes('user:update')
  const canDelete = permissions.includes('user:delete')

  const columns = [
    { header: 'Name', accessorKey: 'name' },
  ]

  return (
    <div>
      <PageBreadcrumb pageTitle="Task" />
      <div className="space-y-6">
        <ComponentCard title="">
          <Link
              href="/admin/task/create"
            className="px-2 py-1 bg-blue-500 text-white rounded"
          >
            Create
          </Link>
          <div className="space-y-6"></div>
          <DataTable
            columns={columns}
            endpoint="/api/tasks"
            canEdit={canEdit}
            canDelete={canDelete}
            editUrl="/admin/task/edit"
          />
        </ComponentCard>
      </div>
    </div>
  );
}
