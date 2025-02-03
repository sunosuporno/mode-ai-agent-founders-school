"use client";

import TokenAllowanceForm from "../TokenAllowanceForm";

export default function ConfigInterface() {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h2 className="text-xl font-extralight text-white mb-4">
            Current Allowances
          </h2>
          <div className="bg-gray-900/50 rounded-lg p-4 text-gray-400 font-extralight">
            No allowances configured yet
          </div>
        </div>

        <div>
          <h2 className="text-xl font-extralight text-white mb-4">
            Request New Allowance
          </h2>
          <TokenAllowanceForm />
        </div>
      </div>
    </div>
  );
}
