import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

function AppHeader() {
  return (
    <div className="flex items-center justify-between shadow p-3 w-full">
      <SidebarTrigger />
      <Button>Sign In</Button>
    </div>
  );
}

export default AppHeader;
