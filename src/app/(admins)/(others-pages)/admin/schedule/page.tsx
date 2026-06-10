import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DataTable from "@/components/dataTables/DataTable";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Schedule",
  description:
    "List Schedule",
  // other metadata
};

export default function SchedulePage() {
  const user = {
    role: 'admin', // contoh dari session / auth
  }
  const permissions = ['user:update', 'user:delete']

  const canDetail = permissions.includes('user:update')
  const canEdit = permissions.includes('user:update')
  const canDelete = permissions.includes('user:delete')

  const columns = [
    { header: 'Title', accessorKey: 'title' },
    { header: 'Description', accessorKey: 'description' },
    { header: 'Teacher', accessorKey: 'teacher' },
    { header: 'Class', accessorKey: 'class' },
    { header: 'Course', accessorKey: 'course' },
    { header: 'Start At', accessorKey: 'startAt' },
    { header: 'End At', accessorKey: 'endAt' },
  ]

  return (
    <div>
      <PageBreadcrumb pageTitle="Schedule" />
      <div className="space-y-6">
        <ComponentCard title="">
          <Link
              href="/admin/schedule/create"
            className="px-2 py-1 bg-blue-500 text-white rounded"
          >
            Create
          </Link>
          <div className="space-y-6"></div>
          <DataTable
            columns={columns}
            endpoint="/api/schedule"
            canDetail={canDetail}
            canEdit={canEdit}
            canDelete={canDelete}
            editUrl="/admin/schedule/edit"
            detailUrl="/admin/presence"
          />
        </ComponentCard>
      </div>
    </div>
  );
}
