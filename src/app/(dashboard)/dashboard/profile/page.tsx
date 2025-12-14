import { redirect } from "next/navigation";

export default function ProfilePage() {
  // Redirect to settings page
  redirect("/dashboard/settings");
}

