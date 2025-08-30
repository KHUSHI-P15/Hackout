import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import homeBg from '../../src/assets/home.jpg'; // Correct path to your image
import logo from '../../src/assets/image.png'; // Your logo

export default function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setAnnouncements([
      {
        id: 1,
        type: 'NGO',
        title: 'Mangrove Awareness Workshop',
        date: '2025-08-25',
        description:
          'Join our awareness program to learn about mangrove restoration initiatives.',
      },
      {
        id: 2,
        type: 'Government',
        title: 'Flood Safety Notice',
        date: '2025-08-28',
        description: 'Government issues precautionary measures for upcoming tidal surge.',
      },
    ]);

    setStats({
      ngoCount: 35,
      governmentCount: 12,
      researcherCount: 20,
      reportsVerified: 934,
      problemsSolved: 412,
    });
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full h-20 m-0 bg-gradient-to-r from-blue-100 via-white to-gray-100 border-b border-gray-200 flex justify-between items-center px-4 md:px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <img src={logo} alt="BlueRoots Logo" className="w-10 h-10 rounded-full object-contain" />
          <h1 className="text-3xl font-extrabold text-[#336699] tracking-wide">
            Blue<span className="text-gray-800">Roots</span>
          </h1>
        </div>
        <div
          className="flex items-center gap-3 bg-white/80 border border-gray-300 px-4 py-2 rounded-full cursor-pointer shadow-sm hover:shadow-md hover:bg-white transition-all duration-200"
          onClick={() => navigate('/login')}
        >
          <button className="hidden sm:inline text-sm font-medium text-[#336699]">Login</button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="bg-cover bg-center h-[70vh] flex flex-col justify-center items-center text-center px-4 mt-20"
        style={{ backgroundImage: `url(${homeBg})` }}
      >
        <h1 className="text-5xl font-bold text-white drop-shadow-lg">
          BlueRoot: Community Mangrove Watch
        </h1>
        <p className="text-lg text-white mt-4 max-w-3xl drop-shadow-md">
          A community-driven platform connecting citizens, NGOs, and government to protect and
          restore mangrove ecosystems using AI-driven monitoring and collective action.
        </p>
        <div className="flex gap-4 mt-6">
          <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold shadow-md transition">
            Report Incident
          </button>
          <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-md transition">
            View Announcements
          </button>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Latest Announcements</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {announcements.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`px-3 py-1 text-sm rounded-full font-semibold ${
                      item.type === 'NGO' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-sm text-gray-500">{item.date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Conservation Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div className="p-6 rounded-lg shadow bg-gray-50">
              <p className="text-4xl font-bold text-green-600">{stats.ngoCount}</p>
              <p className="mt-2 text-gray-700">NGOs Partnered</p>
            </div>
            <div className="p-6 rounded-lg shadow bg-gray-50">
              <p className="text-4xl font-bold text-blue-600">{stats.governmentCount}</p>
              <p className="mt-2 text-gray-700">Government Authorities</p>
            </div>
            <div className="p-6 rounded-lg shadow bg-gray-50">
              <p className="text-4xl font-bold text-purple-600">{stats.researcherCount}</p>
              <p className="mt-2 text-gray-700">Researchers Engaged</p>
            </div>
            <div className="p-6 rounded-lg shadow bg-gray-50">
              <p className="text-4xl font-bold text-yellow-600">{stats.reportsVerified}</p>
              <p className="mt-2 text-gray-700">Reports Verified</p>
            </div>
            <div className="p-6 rounded-lg shadow bg-gray-50">
              <p className="text-4xl font-bold text-red-600">{stats.problemsSolved}</p>
              <p className="mt-2 text-gray-700">Problems Solved</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <footer className="bg-green-600 text-white py-12 text-center">
        <h3 className="text-2xl font-bold mb-4">Join BlueRoot to Protect Mangroves</h3>
        <button className="px-8 py-3 bg-white text-green-700 font-semibold rounded-lg shadow hover:bg-gray-200 transition">
          Get Started
        </button>
      </footer>
    </div>
  );
}
