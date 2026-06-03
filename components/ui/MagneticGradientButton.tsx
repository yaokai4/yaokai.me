import type { ComponentProps } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function MagneticGradientButton(props: ComponentProps<typeof MagneticButton>) {
  return <MagneticButton {...props} />;
}
