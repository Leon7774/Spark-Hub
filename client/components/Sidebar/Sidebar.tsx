import AccountToggle from "./Elements/Account";
import { Logo } from "./Elements/Logo";
import { RouteSelect } from "./Elements/Nav-Menu";
import { Search } from "./Elements/Search";

export const Sidebar = () => {
  return (
    <div>
      <div className="sticky top-4 h-[calc(100vh-32px-64px)] overflow-visible overflow-y-scroll pt-3 transition-colors [&::-webkit-scrollbar]:hidden overflow-x-hidden [scrollbar-width:none]">
        <Logo></Logo>
        <AccountToggle />
        <Search></Search>
        <RouteSelect></RouteSelect>
      </div>
    </div>
  );
};
export default Sidebar;
