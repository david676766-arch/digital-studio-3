import { notFound } from "next/navigation";

/** Any unknown URL inside a language folder renders the localized 404 page. */
export default function CatchAll() {
  notFound();
}
