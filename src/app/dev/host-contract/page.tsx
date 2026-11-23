import { notFound } from "next/navigation";

import { ListingStep10Preview } from "@/pages-layer/listing-step-10-confirm";

export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ListingStep10Preview />;
}
