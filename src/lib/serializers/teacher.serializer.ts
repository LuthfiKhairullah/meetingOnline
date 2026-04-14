import { User } from "@/generated/prisma/client";

type TeacherClass = {
  id: number;
  name: string;
};

export function serializeTeacher(user: User, teacher: TeacherClass[]) {
  return {
    ...user,
    teacher: teacher,
  };
}