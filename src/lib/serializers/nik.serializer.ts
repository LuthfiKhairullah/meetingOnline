import prisma from "../prisma";

export async function generateNik() {
  const lastUser = await prisma.user.findFirst({
    where: {
      nik: {
        startsWith: "RK",
      },
    },
    orderBy: {
      nik: "desc",
    },
  });

  if (!lastUser || !lastUser.nik) {
    return "RK0001";
  }

  const lastNumber = parseInt(lastUser.nik.slice(2), 10);
  const nextNumber = lastNumber + 1;

  return `RK${nextNumber.toString().padStart(4, "0")}`;
}