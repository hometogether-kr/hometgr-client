import { permanentRedirect } from "next/navigation";

import { ROUTES } from "@/shared/config";

export default function IntroGuest() {
  permanentRedirect(ROUTES.intro.guest);
}
