"use client"

import DualList from "@/components/dualList/dualList";
import { useEffect, useMemo, useState } from "react";

type Course = {
  id: number;
  name: string;
};

export default function DualListAssign() {
  const [available, setAvailable] = useState<Course[]>([]);
  const [assigned, setAssigned] = useState<Course[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [resCourse, resTeacher] = await Promise.all([
        fetch("/api/course"),
        fetch("/api/teacher/1"),
      ]);

      const resCourses = await resCourse.json();
      const allCourses: Course[] = resCourses.data;
      const resTeachers = await resTeacher.json();
      const teacher = resTeachers.data;

      const assignedCourses: Course[] = teacher.courses;

      // 🔥 filter available (yang belum dimiliki teacher)
      const availableCourses = allCourses.filter(
        (course) =>
          !assignedCourses.some((g) => g.id === course.id)
      );

      setAssigned(assignedCourses);
      setAvailable(availableCourses);
    };

    fetchData();
  }, []);

  <DualList
    available={available}
    assigned={assigned}
    setAvailable={setAvailable}
    setAssigned={setAssigned}
    getLabel={(item) => item.name}
    getKey={(item) => item.id}
  />
}
