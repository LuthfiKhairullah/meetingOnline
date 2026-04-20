"use client"

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DualList from "@/components/dualList/dualList";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Student = {
  id: number;
  name: string;
};

export default function EditStudentPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
  }, []);
  const params = useParams()
  const id = params.id as string
  const [available, setAvailable] = useState<Student[]>([]);
  const [assigned, setAssigned] = useState<Student[]>([]);
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const [resStudent, resUser] = await Promise.all([
        fetch("/api/student", {
          headers: {
            "Content-Type": "application/json",
            "x-client-type": "web",
            "authorization": `Bearer ${token}`,
          },
        }),
        fetch("/api/course-student/show/" + id, {
          headers: {
            "Content-Type": "application/json",
            "x-client-type": "web",
            "authorization": `Bearer ${token}`,
          },
        }),
      ]);

      const resStudents = await resStudent.json();
      const allStudents: Student[] = resStudents.data;
      const resUsers = await resUser.json();
      const users = resUsers.data;
      const assignedStudents: Student[] = [];
      (users.courseStudent ?? []).forEach((element: {
          id: number,
          fullname: string,
      }) => {
        console.log(element?.fullname)
        assignedStudents.push({
          id: element?.id ?? 0,
          name: element?.fullname ?? '',
        })
      });
      
      // 🔥 filter available (yang belum dimiliki user)
      const availableStudents = allStudents.filter(
        (courseStudent) =>
          !assignedStudents.some((g) => g.id === courseStudent.id)
      );
      
      setUser(users)
      setAssigned(assignedStudents);
      setAvailable(availableStudents);
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
            await fetch("/api/course-student/assign/" + user.id, {
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
            await fetch("/api/course-student/unassign/" + user.id, {
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
