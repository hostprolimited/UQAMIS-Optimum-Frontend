import React, { useState } from "react";

type SafetyItem = {
  id: number;
  part: string;
  attentionRequired: boolean;
  good: boolean;
};

const initialData: SafetyItem[] = [
  { id: 1, part: "Door opens outside", attentionRequired: false, good: false },
  { id: 2, part: "Windows open outside", attentionRequired: false, good: false },
  { id: 3, part: "Windows have no grills", attentionRequired: false, good: false },
  { id: 4, part: "Spacing between desks adequate", attentionRequired: false, good: false },
  { id: 5, part: "At least 5 students in class are trained to evacuate the rest in case of emergency", attentionRequired: false, good: false },
  { id: 6, part: "The class have undertaken an evacuation drill in case of emergency", attentionRequired: false, good: false },
  { id: 7, part: "At least five students in class have basic first aid skills", attentionRequired: false, good: false },
  { id: 8, part: "The floor provides appropriate grip", attentionRequired: false, good: false },
  { id: 9, part: "The space immediately outside the classroom provides easy movement in case of emergency", attentionRequired: false, good: false },
  { id: 10, part: "There is a clear display of action expected in case of emergency", attentionRequired: false, good: false },
  { id: 11, part: "There is a clear display of assembly point in case of emergency", attentionRequired: false, good: false },
  { id: 12, part: "There is a fire extinguisher within close proximity from the classroom", attentionRequired: false, good: false },
  { id: 13, part: "At least five students are trained on how to handle the available fire extinguisher", attentionRequired: false, good: false },
];

interface ClassSafetyFormProps {
  safetyData: SafetyItem[];
  onSafetyDataChange: (data: SafetyItem[]) => void;
}

const ClassSafetyForm: React.FC<ClassSafetyFormProps> = ({ safetyData, onSafetyDataChange }) => {

  const toggleField = (id: number, field: "attentionRequired" | "good") => {
    onSafetyDataChange(
      safetyData.map(item =>
        item.id === id
          ? {
              ...item,
              [field]: !item[field],
              ...(field === "attentionRequired" ? { good: false } : { attentionRequired: false }),
            }
          : item
      )
    );
  };

  const handleSubmit = () => {
    console.log("Form submitted:", safetyData);
    alert("Class Safety Report Submitted ");
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-6 mt-10">
      {/* <h1 className="text-2xl font-bold text-center mb-2">SAFETY DATA COLLECTION FORMS</h1> */}
      <h2 className="text-xl font-semibold text-center mb-6 text-gray-700"> SAFETY REPORT</h2>

      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 w-12 text-center">S/NO</th>
            <th className="border p-2 text-left">PART OF BUILDING</th>
            <th className="border p-2 text-center w-40">ATTENTION REQUIRED</th>
            <th className="border p-2 text-center w-24">GOOD</th>
          </tr>
        </thead>
        <tbody>
          {safetyData.map(item => (
            <tr key={item.id} className="hover:bg-gray-50 transition">
              <td className="border p-2 text-center">{item.id}</td>
              <td className="border p-2">{item.part}</td>
              <td className="border p-2 text-center">
                <input
                  type="checkbox"
                  checked={item.attentionRequired}
                  onChange={() => toggleField(item.id, "attentionRequired")}
                  className="w-5 h-5 accent-red-600"
                />
              </td>
              <td className="border p-2 text-center">
                <input
                  type="checkbox"
                  checked={item.good}
                  onChange={() => toggleField(item.id, "good")}
                  className="w-5 h-5 accent-green-600"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        {/* <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Submit Report
        </button> */}
      </div>
    </div>
  );
};

export default ClassSafetyForm;
