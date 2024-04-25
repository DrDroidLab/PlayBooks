import { Link } from "react-router-dom";

const NoExistingTrigger = () => {
  return (
    <div className="justify-center w-full items-center flex flex-col py-8 border">
      <img src="/logo.png" alt="logo" className="h-20 mb-4 " />
      <div className="text-sm text-gray-500 mb-2 text-center">
        No Alerts found
      </div>
      <div>
        <Link to="https://docs.drdroid.io" target="_blank">
          <div
            variant="contained"
            className="text-sm rounded-lg py-2 px-2 cursor-pointer border-violet-600 text-violet-600 dura hover:text-violet-700 underline flex">
            Check Documentation
          </div>
        </Link>
      </div>
    </div>
  );
};

export default NoExistingTrigger;
