'use client'

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DataTable from "@/components/dataTables/DataTable";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import DetailView from "../DetailView";

export default function TaskScorePage() {
  const params = useParams()
  const id = params.id as string
  const user = {
    role: 'admin', // contoh dari session / auth
  }
  const permissions = ['user:update', 'user:delete']

  const canEdit = permissions.includes('user:update')
  const canDelete = permissions.includes('user:delete')

  const fields = [
    { label: "Title", key: "title" },
    { label: "Description", key: "description" },
    { label: "Teacher", key: "teacher" },
    { label: "Class", key: "class" },
    { label: "Course", key: "course" },
    {
      label: "Start At",
      key: "startAt",
      render: (val: any) =>
        val ? new Date(val).toLocaleString("id-ID") : "-",
    },
    {
      label: "End At",
      key: "endAt",
      render: (val: any) =>
        val ? new Date(val).toLocaleString("id-ID") : "-",
    },
  ];
  const columns = [
    { header: 'Title', accessorKey: 'title' },
    { header: 'Description', accessorKey: 'description' },
    { header: 'Teacher', accessorKey: 'teacher' },
    { header: 'Class', accessorKey: 'class' },
    { header: 'Course', accessorKey: 'course' },
    { header: 'Start At', accessorKey: 'startAt' },
    { header: 'End At', accessorKey: 'endAt' },
  ]

  const [taskData, setTaskData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/tasks/show/${id}`, {
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "web",
          "authorization": `Bearer ${token}`,
        },
      });

      const json = await res.json();
      setTaskData(json.data);
    };

    if (id) fetchData();
  }, [id]);

  if (!taskData) return <div>Loading...</div>;

  return (
    <div>
      <PageBreadcrumb pageTitle="Task" />
      <div className="space-y-6">
        <DetailView data={taskData} fields={fields} />

        <ComponentCard title="">
          <div className="space-y-6"></div>
          <DataTable
            columns={columns}
            endpoint="/api/task-score"
            canEdit={canEdit}
            canDelete={canDelete}
            editUrl="/admin/taskscore/edit"
          />
        </ComponentCard>
      </div>
    </div>
  );
}
