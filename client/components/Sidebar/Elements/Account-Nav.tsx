import { Button } from "@/components/ui/button";
import { logout } from "@/app/api/actions";

const AccountNav = ({ visible }: { visible: boolean }) => {
  return (
    <div
      className={`absolute mt-2 w-[150px] overflow-visible rounded-2xl bg-white p-2 shadow transition-all duration-200 ease-in-out ${
        visible
          ? "visible z-50 scale-100 opacity-100"
          : "invisible z-[-1] scale-95 opacity-0"
      }`}
    >
      <Button
        onClick={() => logout()}
        variant="ghost"
        className="w-full hover:bg-gray-200"
      >
        Log Out
      </Button>
      <Button variant="ghost" className="w-full hover:bg-gray-200">
        Add Account
      </Button>
      <Button variant="ghost" className="w-full hover:bg-gray-200">
        Settings
      </Button>
    </div>
  );
};
export default AccountNav;
