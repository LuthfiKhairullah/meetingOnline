import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DataTable from "@/components/dataTables/DataTable";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Murajaah",
  description:
    "List Murajaah",
  // other metadata
};

export default function MurajaahPage() {
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
      <PageBreadcrumb pageTitle="Murajaah" />
      <div className="space-y-6">
        <ComponentCard title="">
          <Link
              href="/admin/murajaah/create"
            className="px-2 py-1 bg-blue-500 text-white rounded"
          >
            Create
          </Link>
          <div className="space-y-6"></div>
          <DataTable
            columns={columns}
            endpoint="/api/murajaah"
            canDetail={canDetail}
            canEdit={canEdit}
            canDelete={canDelete}
            editUrl="/admin/murajaah/edit"
            detailUrl="/admin/murajaahscore"
          />
        </ComponentCard>
      </div>
    </div>
  );
}
