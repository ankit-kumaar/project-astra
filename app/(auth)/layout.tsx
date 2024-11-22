import React, { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="p-6 bg-white shadow-lg rounded-lg">{children}</div>
    </div>
  );
};

export default AuthLayout;
