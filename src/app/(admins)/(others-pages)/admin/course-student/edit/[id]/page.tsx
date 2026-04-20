"use client"

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DualList from "@/components/dualList/dualList";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Course = {
  id: number;
  fullname: string;
};

export default function EditCourseTeacherPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
  }, []);
  const params = useParams()
  const id = params.id as string
  const [available, setAvailable] = useState<Course[]>([]);
  const [assigned, setAssigned] = useState<Course[]>([]);
  const [courseTeacher, setCourseTeacher] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const [resCourse, resCourseTeacher] = await Promise.all([
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

      const resCourses = await resCourse.json();
      const allCourses: Course[] = resCourses.data;
      const resCourseTeachers = await resCourseTeacher.json();
      const courseTeachers = resCourseTeachers.data;
console.log(courseTeachers)
      const assignedCourseTeachers: Course[] = [];
      (courseTeachers.courseStudent ?? []).forEach((element: {
        user?: {
          id: number;
          fullname: string;
        };
      }) => {
        assignedCourseTeachers.push({
          id: element?.user?.id ?? 0,
          fullname: element.user?.fullname ?? '',
        })
      });
      console.log('courseTeachers')
      console.log(courseTeachers)
      
      // 🔥 filter available (yang belum dimiliki courseTeacher)
      const availableTeachers = allCourses.filter(
        (courseTeacher) =>
          !assignedCourseTeachers.some((g) => g.id === courseTeacher.id)
      );
      console.log(availableTeachers)

      setCourseTeacher(courseTeachers)
      setAssigned(assignedCourseTeachers);
      setAvailable(availableTeachers);
    };

    fetchData();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle={`Edit Course Teacher ${courseTeacher.user?.fullname} Class : ${courseTeacher.class?.name}`} />
        <DualList
          available={available}
          assigned={assigned}
          setAvailable={setAvailable}
          setAssigned={setAssigned}
          getLabel={(item) => item.fullname}
          getKey={(item) => item.id}
          onMoveRight={async (items) => {
            await fetch("/api/course-student/assign/" + courseTeacher.id, {
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
            await fetch("/api/course-student/unassign/" + courseTeacher.id, {
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
