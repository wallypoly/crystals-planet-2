import { redirect } from "next/navigation";

/**
 * The crystal atlas is the home page. This path is the canonical name the
 * navigation uses for it, so it forwards rather than 404-ing.
 */
export default function CrystalWikiPage() {
  redirect("/");
}
