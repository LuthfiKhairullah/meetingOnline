"use client"

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DualList from "@/components/dualList/dualList";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Course = {
  id: number;
  name: string;
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
    if (!token) return; 

    const fetchData = async () => {
      const [resCourse, resCourseTeacher] = await Promise.all([
        fetch("/api/course", {
          headers: {
            "Content-Type": "application/json",
            "x-client-type": "web",
            "authorization": `Bearer ${token}`,
          },
        }),
        fetch("/api/course-teacher/show/" + id, {
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
      const assignedCourseTeachers: Course[] = [];
      (courseTeachers.courseTeacher ?? []).forEach((element: {
        course?: {
          id: number;
          name: string;
        };
      }) => {
        assignedCourseTeachers.push({
          id: element.course?.id ?? 0,
          name: element.course?.name ?? '',
        })
      });
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
  }, [id, token]);

  return (
    <div>
      <PageBreadcrumb pageTitle={`Edit Course Teacher ${courseTeacher.user?.fullname} Class : ${courseTeacher.class?.name}`} />
        <DualList
          available={available}
          assigned={assigned}
          setAvailable={setAvailable}
          setAssigned={setAssigned}
          getLabel={(item) => item.name}
          getKey={(item) => item.id}
          onMoveRight={async (items) => {
            await fetch("/api/course-teacher/assign/" + courseTeacher.id, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-client-type": "web",
                "authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({
                ids: items.map((i) => i.id),
                classId: courseTeacher.class?.id
              }),
            });
          }}
          onMoveLeft={async (items) => {
            await fetch("/api/course-teacher/unassign/" + courseTeacher.id, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-client-type": "web",
                "authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({
                ids: items.map((i) => i.id),
                classId: courseTeacher.class?.id
              }),
            });
          }}
        />
      </div>

  )
}
