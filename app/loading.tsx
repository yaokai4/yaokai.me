import { LoadingState } from "@/components/ui/State";

export default function Loading() {
  return (
    <div className="section-container grid min-h-screen place-items-center">
      <LoadingState label="正在准备页面" />
    </div>
  );
}
