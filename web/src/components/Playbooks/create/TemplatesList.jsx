import React from "react";

function TemplatesList() {
  return (
    <div className="w-full p-2">
      <h1 className="font-bold text-xl">View Templates</h1>

      <div className="flex flex-wrap mt-4 gap-2">
        <div className="border rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-all">
          <h3 className="font-bold text-md">Deployment Stability Tracker</h3>
          <p className="text-sm text-gray-500">
            Playbook to evaluate critical metrics after a deployment in
            Production
          </p>
        </div>

        <div className="border rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-all">
          <h3 className="font-bold text-md">Deployment Stability Tracker</h3>
          <p className="text-sm text-gray-500">
            Playbook to evaluate critical metrics after a deployment in
            Production
          </p>
        </div>

        <div className="border rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-all">
          <h3 className="font-bold text-md">Deployment Stability Tracker</h3>
          <p className="text-sm text-gray-500">
            Playbook to evaluate critical metrics after a deployment in
            Production
          </p>
        </div>

        <div className="border rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-all">
          <h3 className="font-bold text-md">Deployment Stability Tracker</h3>
          <p className="text-sm text-gray-500">
            Playbook to evaluate critical metrics after a deployment in
            Production
          </p>
        </div>
      </div>
    </div>
  );
}

export default TemplatesList;
