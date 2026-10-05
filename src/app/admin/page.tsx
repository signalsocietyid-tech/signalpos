import { redirect } from "next/navigation";

/** Alias kanonis backoffice: /admin → dashboard (/). */
export default function AdminAlias() {
  redirect("/");
}
