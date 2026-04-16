"use client"

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DualList from "@/components/dualList/dualList";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type UserRole = {
  id: number;
  name: string;
};

export default function CreateUserRolePage() {
  const token = localStorage.getItem("token");

  const params = useParams()
  const id = params.id as string
  const [available, setAvailable] = useState<UserRole[]>([]);
  const [assigned, setAssigned] = useState<UserRole[]>([]);
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const [resUserRole, resUser] = await Promise.all([
        fetch("/api/roles", {
          headers: {
            "Content-Type": "application/json",
            "x-client-type": "web",
            "authorization": `Bearer ${token}`,
          },
        }),
        fetch("/api/users/" + id, {
          headers: {
            "Content-Type": "application/json",
            "x-client-type": "web",
            "authorization": `Bearer ${token}`,
          },
        }),
      ]);

      const resUserRoles = await resUserRole.json();
      const allUserRoles: UserRole[] = resUserRoles.data;
      const resUsers = await resUser.json();
      const users = resUsers.data;
      const assignedUserRoles: UserRole[] = users.userRole;

      // 🔥 filter available (yang belum dimiliki user)
      const availableUserRoles = allUserRoles.filter(
        (userrole) =>
          !assignedUserRoles.some((g) => g.id === userrole.id)
      );

      setUser(users)
      setAssigned(assignedUserRoles);
      setAvailable(availableUserRoles);
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
            await fetch("/api/userroles/assign/" + user.id, {
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
            await fetch("/api/userroles/unassign/" + user.id, {
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
