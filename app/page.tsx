import Link from 'next/link';

export default function Home() {
  // Removed session check to avoid MongoDB connection on home page

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Micro-Trust Circles
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          AI-Powered Quantum-Resistant Peer-to-Peer Micro-Lending System
        </p>
        
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome to the Future of Micro-Lending
          </h2>
          <p className="text-gray-600 mb-6">
            Create private trust circles with friends, family, or colleagues. 
            Lend and borrow small amounts with AI-powered trust scoring and 
            post-quantum encryption security.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="font-semibold text-gray-800 mb-2">AI Trust Score</h3>
              <p className="text-sm text-gray-600">
                Machine learning calculates trust scores automatically
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-2">🔐</div>
              <h3 className="font-semibold text-gray-800 mb-2">Quantum-Safe</h3>
              <p className="text-sm text-gray-600">
                Post-quantum encryption protects your data
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold text-gray-800 mb-2">Trust Circles</h3>
              <p className="text-sm text-gray-600">
                Private groups for safe peer-to-peer lending
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border-2 border-blue-600"
          >
            Sign In
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-600">
          💡 This is a simulated environment for educational purposes
        </p>
      </div>
    </div>
  );
}
