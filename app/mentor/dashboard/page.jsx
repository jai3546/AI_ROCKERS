"use client";

export default function MentorDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, Mentor! 👋
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-100 p-4 rounded-xl shadow">
          <h2 className="font-semibold text-lg">My Students</h2>
          <p className="text-gray-500">View assigned students</p>
        </div>
        <div className="bg-green-100 p-4 rounded-xl shadow">
          <h2 className="font-semibold text-lg">Sessions</h2>
          <p className="text-gray-500">Upcoming mentor sessions</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-xl shadow">
          <h2 className="font-semibold text-lg">Progress</h2>
          <p className="text-gray-500">Track student progress</p>
        </div>
      </div>
    </div>
  );
}
