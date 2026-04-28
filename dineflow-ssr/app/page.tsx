import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-yellow-400">Dine</span>
          <span className="text-white">Flow</span>
        </h1>
        <p className="text-gray-400 mb-8">Smart Restaurant Management System</p>
        
        <div className="flex flex-col gap-4">
          <Link 
            href="/landing" 
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition text-center"
          >
            Go to Landing Page
          </Link>
          <Link 
            href="/dashboard" 
            className="bg-[#1E1E1E] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2a2a2a] transition border border-gray-700 text-center"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}