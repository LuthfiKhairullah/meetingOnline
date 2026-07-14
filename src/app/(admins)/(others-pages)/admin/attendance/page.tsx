import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DataTable from "@/components/dataTables/DataTable";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Attendance",
  description:
    "List Attendance",
  // other metadata
};

export default function AttendancePage() {
  const user = {
    role: 'admin', // contoh dari session / auth
  }
  const permissions = ['user:update', 'user:delete']

  const canDetail = permissions.includes('user:update')
  const canEdit = permissions.includes('user:update')
  const canDelete = permissions.includes('user:delete')

  const columns = [
    { header: 'User', accessorKey: 'userId' },
    { header: 'Task', accessorKey: 'taskId' },
    { header: 'Note', accessorKey: 'note' },
  ]

  return (
    <div>
      <PageBreadcrumb pageTitle="Attendance" />
      <div className="space-y-6">
        <ComponentCard title="">
          <Link
              href="/admin/attendance/create"
            className="px-2 py-1 bg-blue-500 text-white rounded"
          >
            Create
          </Link>
          <div className="space-y-6"></div>
          <DataTable
            columns={columns}
            endpoint="/api/attendance"
            canDetail={canDetail}
            canEdit={canEdit}
            canDelete={canDelete}
            editUrl="/admin/attendance/edit"
            detailUrl="/admin/presence"
          />
        </ComponentCard>
      </div>
    </div>
  );
}
