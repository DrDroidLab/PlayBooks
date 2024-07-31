import { Outlet } from "react-router-dom";
// import Sidebar from "./Sidebar";
import "./Layout.css";
import CustomContainer from "./components/CustomContainer";
import Sidebar from "./components/Sidebar";

function Layout() {
  return (
    <div className="wrapper flex h-screen overflow-hidden">
      <div className="lg:w-2/12 w-1/3 h-screen border-r border-gray-200 hidden lg:flex">
        <Sidebar />
      </div>

      <main
        className="w-full lg:w-10/12 main1 overflow-y-scroll"
        style={{ background: "#F8FAFC" }}>
        <CustomContainer>
          <Outlet />
        </CustomContainer>
      </main>
    </div>
  );
}

export default Layout;
