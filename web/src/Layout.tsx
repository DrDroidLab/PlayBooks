import { Outlet } from "react-router-dom";
import CustomContainer from "./components/CustomContainer";
import Sidebar from "./components/Sidebar";

function Layout() {
  return (
    <div className="relative flex h-screen overflow-hidden">
      <div className="h-screen border-r border-gray-200 flex">
        <Sidebar />
      </div>

      <main
        className="w-full overflow-y-scroll"
        style={{ background: "#F8FAFC" }}>
        <CustomContainer>
          <Outlet />
        </CustomContainer>
      </main>
    </div>
  );
}

export default Layout;
