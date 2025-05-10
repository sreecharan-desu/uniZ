import { useState, useEffect } from "react";
import { ClipboardCheck, Clock, BellRing, Users } from "lucide-react";

export default function Attendance() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <ClipboardCheck size={24} />,
      title: "Attendance Tracking",
      description: "Track attendance with ease and accuracy"
    },
    {
      icon: <Clock size={24} />,
      title: "Real-time Updates",
      description: "Monitor attendance status in real-time"
    },
    {
      icon: <BellRing size={24} />,
      title: "Notifications",
      description: "Get alerted about attendance exceptions"
    },
    {
      icon: <Users size={24} />,
      title: "Reporting",
      description: "Generate comprehensive attendance reports"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4">
      {/* Header */}
      <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`}>
        <h1 className="text-5xl font-bold mb-2 text-center">Attendance</h1>
        <div className="h-1 w-24 bg-black mx-auto mb-6"></div>
      </div>
      
      {/* Coming Soon Message */}
      <div className={`max-w-2xl text-center mb-12 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        <p className="text-xl mb-6">
          We're working on something exciting to transform how you manage attendance.
        </p>
        <div className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-full">
          <span className="mr-2">Coming Soon</span>
          <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full mb-12">
        {features.map((feature, index) => (
          <div 
            key={index}
            className={`border border-gray-200 rounded-lg p-6 transition-all duration-700 transform hover:shadow-lg hover:-translate-y-1 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: `${500 + index * 150}ms` }}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
      
      
    </div>
  );
}