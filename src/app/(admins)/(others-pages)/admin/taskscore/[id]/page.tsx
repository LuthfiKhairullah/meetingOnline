'use client'

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DataTable from "@/components/dataTables/DataTable";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import DetailView from "../DetailView";

export default function TaskScorePage() {
  const params = useParams()
  const id = params.id as string

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
    { header: 'Name', accessorKey: 'name' },
    { header: 'Score', accessorKey: 'score' },
    { header: 'Submit At', accessorKey: 'doneAt' },
    { header: 'Status', accessorKey: 'status' },
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

  if (!taskData) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-100 to-blue-100 p-6">
      
      {/* Header */}
      <div className="mb-6">
        <PageBreadcrumb pageTitle="Task Detail" />
      </div>

      <div className="space-y-6">

        {/* Detail Card */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-purple-200 p-6">
          <h2 className="text-xl font-semibold text-purple-700 mb-4">
            📘 Informasi Task
          </h2>

          <DetailView data={taskData} fields={fields} />
        </div>

        {/* Table Card */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-indigo-200 p-6">
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-indigo-700">
              📊 Data Student
            </h2>
          </div>

          <div className="rounded-xl overflow-hidden border border-gray-200">
            <DataTable
              columns={columns}
              endpoint={"/api/task-score/" + id}
              canEdit={canEdit}
              canDelete={canDelete}
              editUrl="/admin/taskscore/edit"
            />
          </div>
        </div>

      </div>
    </div>
  );
}