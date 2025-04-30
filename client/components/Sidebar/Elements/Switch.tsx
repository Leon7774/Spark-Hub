import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SwitchDemo() {
  function handleToggle() {
    const html = document.documentElement;
    html.classList.toggle("dark");
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch id="dark-mode" onClick={handleToggle} />
      <Label htmlFor="dark-mode">Dark Mode</Label>
    </div>
  );
}
