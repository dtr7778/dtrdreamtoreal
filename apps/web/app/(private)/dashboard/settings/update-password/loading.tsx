import { Spinner } from "@workspace/ui/components/spinner";

export default function Loading() {
  return (
    <div className="flex w-full items-center justify-center p-4">
      <Spinner className="size-14 text-primary" strokeWidth={1} />
    </div>
  );
}
