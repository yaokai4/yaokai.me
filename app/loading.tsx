import { LoadingState } from "@/components/ui/State";

export default function Loading() {
  return (
    <div className="section-container grid min-h-screen place-items-center pt-24">
      <LoadingState label="Loading content" />
    </div>
  );
}
