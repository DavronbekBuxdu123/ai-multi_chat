import { SidebarTrigger } from "@/components/ui/sidebar";

function AppHeader() {
  return (
    <div className="flex items-center justify-between shadow p-3 w-full  dark:bg-[#0d1225]">
      <SidebarTrigger />
    </div>
  );
}

export default AppHeader;
