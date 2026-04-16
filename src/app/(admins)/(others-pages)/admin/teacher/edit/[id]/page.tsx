"use client"

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DualList from "@/components/dualList/dualList";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Teacher = {
  id: number;
  name: string;
};

export default function EditTeacherPage() {
  const token = localStorage.getItem("token");
  const params = useParams()
  const id = params.id as string
  const [available, setAvailable] = useState<Teacher[]>([]);
  const [assigned, setAssigned] = useState<Teacher[]>([]);
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const [resTeacher, resUser] = await Promise.all([
        fetch("/api/class", {
          headers: {
            "Content-Type": "application/json",
            "x-client-type": "web",
            "authorization": `Bearer ${token}`,
          },
        }),
        fetch("/api/teacher/show/" + id, {
          headers: {
            "Content-Type": "application/json",
            "x-client-type": "web",
            "authorization": `Bearer ${token}`,
          },
        }),
      ]);

      const resTeachers = await resTeacher.json();
      const allTeachers: Teacher[] = resTeachers.data;
      const resUsers = await resUser.json();
      const users = resUsers.data;
      const assignedTeachers: Teacher[] = [];
      (users.teacher ?? []).forEach((element: {
        class?: {
          id: number;
          name: string;
        };
      }) => {
        assignedTeachers.push({
          id: element.class?.id ?? 0,
          name: element.class?.name ?? '',
        })
      });
      console.log(users)
      
      // 🔥 filter available (yang belum dimiliki user)
      const availableTeachers = allTeachers.filter(
        (teacher) =>
          !assignedTeachers.some((g) => g.id === teacher.id)
      );
      console.log(availableTeachers)

      setUser(users)
      setAssigned(assignedTeachers);
      setAvailable(availableTeachers);
    };

    fetchData();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle={`Edit User Role ${user.fullname}`} />
        <DualList
          available={available}
          assigned={assigned}
          setAvailable={setAvailable}
          setAssigned={setAssigned}
          getLabel={(item) => item.name}
          getKey={(item) => item.id}
          onMoveRight={async (items) => {
            await fetch("/api/teacher/assign/" + user.id, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-client-type": "web",
                "authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({
                ids: items.map((i) => i.id),
              }),
            });
          }}
          onMoveLeft={async (items) => {
            await fetch("/api/teacher/unassign/" + user.id, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-client-type": "web",
                "authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({
                ids: items.map((i) => i.id),
              }),
            });
          }}
        />
      </div>

  )
}
