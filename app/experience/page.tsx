import { redirect } from "next/navigation";

/** 3D scene is now the app-wide background; redirect old /experience links to home. */
export default function ExperiencePage() {
  redirect("/");
}
