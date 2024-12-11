import { useIsAuth } from "../customhooks/is_authenticated";
import '../index.css';

export function Home() {
    useIsAuth();    
    return (
        <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 bg-gradient-to-b from-white to-gray-100">
            {/* Hero Section */}
            <div className="max-w-4xl text-center space-y-8 animate-fadeIn">
                <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600">
                    Welcome to uniZ
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 font-medium leading-relaxed">
                    Your all-in-one platform for managing student outings, outpasses, and academic records
                </p>
                
                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6 mt-12">
                    <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-semibold mb-2">Outpass Management</h3>
                        <p className="text-gray-600">Request and track your outpass applications seamlessly</p>
                    </div>
                    <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-semibold mb-2">Outing Tracking</h3>
                        <p className="text-gray-600">Manage your outing requests with real-time status updates</p>
                    </div>
                    <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-semibold mb-2">Grade Hub</h3>
                        <p className="text-gray-600">Access your academic performance and records instantly</p>
                    </div>
                </div>

                {/* CTA Button */}
                <div className="mt-12">
                    <a 
                        href="/student/signin"
                        className="inline-block px-8 py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-300"
                    >
                        Sign in to Get Started
                    </a>
                    <p className="mt-4 text-gray-500">
                        Experience the future of student management
                    </p>
                </div>
            </div>
        </div>
    );
}
