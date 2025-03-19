import { Button } from "@/components/ui/button";

interface ReloadButtonProps {
  onReload: () => void;
}

export default function ReloadButton({ onReload }: ReloadButtonProps) {
  return (
    <Button variant="outline" onClick={onReload} className="ml-2">
      Reload
    </Button>
  );
}
