import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-100">
    <div className="text-center">
      <h1 className="mb-4 text-4xl font-bold text-red-600">401</h1>
      <p className="mb-4 text-xl text-gray-600">Unauthorized: You do not have permission to view this page.</p>
      <Link to="/" className="text-blue-500 underline hover:text-blue-700">
        Return to Login
      </Link>
    </div>
  </div>
);

export default Unauthorized;
