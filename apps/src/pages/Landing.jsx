import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiFileText, 
  FiCheckCircle, 
  FiShare2, 
  FiZap, 
  FiUsers,
  FiArrowRight,
  FiMenu,
  FiX
} from "react-icons/fi";
import { FaThumbtack } from "react-icons/fa";

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Force dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem("theme", "dark");
  }, []);

  const features = [
    {
      icon: <FiZap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Create, search, and access your notes instantly without any lag."
    },
    {
      icon: <FiFileText className="w-6 h-6" />,
      title: "Rich Text Editing",
      description: "Format your notes beautifully with our intuitive rich text editor."
    },
    {
      icon: <FiCheckCircle className="w-6 h-6" />,
      title: "Smart Todos",
      description: "Keep track of tasks alongside your notes with seamless todo lists."
    },
    {
      icon: <FiShare2 className="w-6 h-6" />,
      title: "Instant Sharing",
      description: "Share your notes with anyone using secure, one-click links."
    },
    {
      icon: <FaThumbtack className="w-6 h-6" />,
      title: "Pin Important Notes",
      description: "Keep your most crucial thoughts right at the top of your workspace."
    },
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: "Personalized Space",
      description: "Choose your own avatar and customize your note-taking environment."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-gray-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#2dd4bf] to-[#38bdf8] rounded-lg flex items-center justify-center">
                <FiFileText className="text-gray-900 w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#2dd4bf] to-[#38bdf8] bg-clip-text text-transparent">
                Notely
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-[#2dd4bf] transition">Features</a>
              <button 
                onClick={() => navigate('/signin')}
                className="px-4 py-2 text-[#2dd4bf] font-semibold hover:text-[#38bdf8] transition"
              >
                Sign In
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-800 text-gray-300"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-b border-white/10">
            <div className="px-4 py-3 space-y-3">
              <a href="#features" className="block text-gray-300 hover:text-[#2dd4bf] py-2">Features</a>
              <button 
                onClick={() => navigate('/signin')}
                className="w-full px-4 py-2 text-[#2dd4bf] font-semibold border border-[#2dd4bf] rounded-lg"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="w-full px-6 py-2 bg-gradient-to-r from-[#2dd4bf] to-[#38bdf8] text-gray-900 rounded-lg font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              Write Better Notes,
              <span className="bg-gradient-to-r from-[#2dd4bf] to-[#38bdf8] bg-clip-text text-transparent">
                {" "}Think Better
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              The modern note-taking app that helps you capture ideas, organize tasks, 
              and collaborate seamlessly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/signup')} 
                className="px-8 py-3 bg-gradient-to-r from-[#2dd4bf] to-[#38bdf8] text-gray-900 rounded-lg font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Start Writing Free
                <FiArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Hero Image/Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#2dd4bf] to-[#38bdf8] rounded-2xl blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-white/10">
              <div className="bg-gray-900/50 px-4 py-3 flex items-center gap-2 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="ml-4 text-sm text-gray-400">Notely - Your Notes</div>
              </div>
              <div className="p-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Powerful Features for
              <span className="bg-gradient-to-r from-[#2dd4bf] to-[#38bdf8] bg-clip-text text-transparent">
                {" "}Modern Note-Taking
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to capture ideas and stay organized in one beautiful package
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-6 bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/10 hover:border-[#2dd4bf]/50">
                <div className="w-12 h-12 bg-gradient-to-r from-[#2dd4bf] to-[#38bdf8] rounded-lg flex items-center justify-center text-gray-900 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#2dd4bf] to-[#38bdf8]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Note-Taking?
          </h2>
          <p className="text-xl text-gray-800 mb-8">
            Join thousands of users who have already discovered a better way to capture ideas
          </p>
          <button 
            onClick={() => navigate('/signup')}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#2dd4bf] to-[#38bdf8] rounded-lg flex items-center justify-center">
                  <FiFileText className="text-gray-900 w-5 h-5" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#2dd4bf] to-[#38bdf8] bg-clip-text text-transparent">
                  Notely
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                The modern note-taking app for thinkers, creators, and doers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-[#2dd4bf] transition">Features</a></li>
                <li><a href="#" className="hover:text-[#2dd4bf] transition">API</a></li>
                <li><a href="#" className="hover:text-[#2dd4bf] transition">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-[#2dd4bf] transition">About</a></li>
                <li><a href="#" className="hover:text-[#2dd4bf] transition">Blog</a></li>
                <li><a href="#" className="hover:text-[#2dd4bf] transition">Careers</a></li>
                <li><a href="#" className="hover:text-[#2dd4bf] transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-[#2dd4bf] transition">Privacy</a></li>
                <li><a href="#" className="hover:text-[#2dd4bf] transition">Terms</a></li>
                <li><a href="#" className="hover:text-[#2dd4bf] transition">Security</a></li>
                <li><a href="#" className="hover:text-[#2dd4bf] transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Notely. All rights reserved. Made with ❤️ for better note-taking.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;