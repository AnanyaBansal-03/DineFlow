import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Navigation */}
      <nav className="bg-[#1E1E1E] border-b border-gray-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-yellow-400">Dine</span>
            <span className="text-white">Flow</span>
          </h1>
          <div className="flex gap-4">
            <Link 
              href="/login" 
              className="text-gray-300 hover:text-yellow-400 transition"
            >
              Login
            </Link>
            <Link 
              href="/login" 
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              The Smarter Way to Run Your{" "}
              <span className="text-yellow-400">Restaurant</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              DineFlow is a powerful all-in-one POS system built for modern restaurants — 
              manage orders, tables, staff, and analytics from one seamless platform.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/login" 
                className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition"
              >
                Start Free Trial →
              </Link>
              <button className="border border-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-[#2a2a2a] transition">
                Watch Demo
              </button>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-800">
              <div>
                <p className="text-2xl font-bold text-yellow-400">5,000+</p>
                <p className="text-gray-500 text-sm">Restaurants</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">2.4M+</p>
                <p className="text-gray-500 text-sm">Orders Processed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">99.9%</p>
                <p className="text-gray-500 text-sm">Uptime SLA</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-400/10 to-transparent rounded-2xl p-8 border border-gray-800">
            <p className="italic text-gray-300 mb-4">
              "Serve customers the best food with prompt and friendly service in a welcoming atmosphere, and they'll keep coming back."
            </p>
            <p className="text-yellow-400 font-semibold">— Team DineFlow</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#1A1A1A] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Run a Flawless Restaurant
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🍽", title: "Smart Table Management", desc: "Visual floor plan with real-time table status" },
              { icon: "⚡", title: "Lightning-Fast Orders", desc: "Take and send orders to the kitchen in seconds" },
              { icon: "📊", title: "Live Analytics", desc: "Track revenue and performance in real-time" },
            ].map((feature) => (
              <div key={feature.title} className="bg-[#1E1E1E] p-6 rounded-xl border border-gray-800 hover:border-yellow-400/50 transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E1E1E] border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          © 2024 DineFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}