import AccountToggle from "./Elements/Account";
import { Logo } from "./Elements/Logo";
import { RouteSelect } from "./Elements/Nav-Menu";
import { Search } from "./Elements/Search";
import Footer from "./Elements/Footer";

export const Sidebar = () => {
  return (
    <div>
      <div className="sticky top-4 h-[calc(100vh-16px)] overflow-y-scroll pt-3 transition-colors overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col h-full justify-between">
          <div>
            <Logo />
            <AccountToggle />
            <Search />
            <RouteSelect />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
