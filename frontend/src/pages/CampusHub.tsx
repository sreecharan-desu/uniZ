import { useState, useEffect } from "react";
import { Calendar, Users, MapPin, Search, Bell, ArrowRight, Star, Clock, Tag, Bookmark, MessageCircle, Share2, Megaphone, Sparkles } from "lucide-react";

// Framer Motion is available in this environment
import { motion } from "framer-motion";

export default function CampusHub() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const featuresData = [
    {
      title: "Event Discovery",
      description: "Browse through all campus events in one central place.",
      icon: <Search size={24} className="text-black" />,
    },
    {
      title: "Real-time Updates",
      description: "Get notified about new events and updates instantly.",
      icon: <Bell size={24} className="text-black" />,
    },
    {
      title: "Event Categories",
      description: "Filter events by type, department, or interest groups.",
      icon: <Tag size={24} className="text-black" />,
    },
    {
      title: "Save & Share",
      description: "Bookmark events and share them with friends.",
      icon: <Share2 size={24} className="text-black" />,
    }
  ];

  const upcomingEvents = [
    {
      title: "Spring Career Fair",
      date: "May 15",
      location: "Main Hall",
      category: "Career"
    },
    {
      title: "AI Research Symposium",
      date: "May 20",
      location: "Science Building",
      category: "Academic"
    },
    {
      title: "Campus Music Festival",
      date: "May 22",
      location: "Outdoor Amphitheater",
      category: "Entertainment"
    }
  ];

  // Staggered animation for svg elements


  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <motion.div 
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="mb-8"
            >
              <div className="flex items-center justify-center w-20 h-20 bg-black rounded-full mb-4">
                <Calendar size={36} className="text-white" />
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl font-bold tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Campus<span className="text-gray-500">Hub</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-700 max-w-2xl mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Your central place for all campus events
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <a 
                href="https://srees-campushub.vercel.app" 
                className="px-8 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                Explore Events <ArrowRight size={16} className="ml-2" />
              </a>
              <a 
                href="https://srees-campushub.vercel.app" 
                className="px-8 py-3 border-2 border-black text-black font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                Learn More
              </a>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Abstract shapes */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-full -z-10 opacity-5 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ delay: 1, duration: 1.5 }}
        >
          <svg width="100%" height="100%" viewBox="0 0 1000 1000">
            <motion.circle cx="200" cy="300" r="150" fill="black" 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.2 }}
            />
            <motion.rect x="600" y="200" width="200" height="200" fill="black" 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.4 }}
            />
            <motion.path d="M100,600 Q300,400 500,600 T900,400" stroke="black" strokeWidth="40" fill="none" 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, delay: 0.6 }}
            />
          </svg>
        </motion.div>
      </header>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-3">Never Miss a Campus Event Again</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              CampusHub brings together all events from across your campus in one easy-to-use platform
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Calendar size={28} className="text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-3">All Events, One Place</h3>
              <p className="text-gray-600">Find academic, social, cultural, and athletic events all in a single platform.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Bell size={28} className="text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Stay Updated</h3>
              <p className="text-gray-600">Get personalized notifications about events that match your interests.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Users size={28} className="text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect with Others</h3>
              <p className="text-gray-600">See who's attending and connect with fellow students with similar interests.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-3">Powerful Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to stay connected with campus life
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {featuresData.map((feature, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      {feature.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Event Preview Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-5 gap-12 items-center">
            <motion.div
              className="md:col-span-2"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-6">Discover what's happening on campus</h2>
              <p className="text-lg text-gray-600 mb-8">
                From academic lectures to sports events, clubs, and social gatherings - find everything that matches your interests.
              </p>
              
              <ul className="space-y-4">
                <motion.li 
                  className="flex items-center"
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <div className="mr-3 text-black">
                    <Star size={20} />
                  </div>
                  <span>Personalized event recommendations</span>
                </motion.li>
                <motion.li 
                  className="flex items-center"
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="mr-3 text-black">
                    <Clock size={20} />
                  </div>
                  <span>Calendar integration and reminders</span>
                </motion.li>
                <motion.li 
                  className="flex items-center"
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="mr-3 text-black">
                    <MapPin size={20} />
                  </div>
                  <span>Campus map with event locations</span>
                </motion.li>
              </ul>
              
              <motion.div 
                className="mt-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <a 
                  href="https://srees-campushub.vercel.app" 
                  className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
                >
                  Browse Events <ArrowRight size={16} className="ml-2" />
                </a>
              </motion.div>
            </motion.div>
            
            <motion.div
              className="md:col-span-3"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-6">Featured Events</h3>
                
                <motion.div 
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {upcomingEvents.map((event, index) => (
                    <motion.div 
                      key={index}
                      variants={itemVariants}
                      className="bg-white p-4 rounded-lg border border-gray-100 flex"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex flex-col items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-sm text-gray-500">May</span>
                        <span className="text-xl font-bold">{event.date.split(" ")[1]}</span>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-1">{event.title}</h4>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Clock size={14} className="mr-1" />
                          <span className="mr-3">{event.date}</span>
                          <MapPin size={14} className="mr-1" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{event.category}</span>
                          <div className="ml-auto flex">
                            <button className="mr-2 text-gray-500 hover:text-black transition-colors">
                              <Bookmark size={16} />
                            </button>
                            <button className="text-gray-500 hover:text-black transition-colors">
                              <Share2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                
                <motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                >
                  <a href="https://srees-campushub.vercel.app" className="text-black font-medium hover:underline inline-flex items-center">
                    View all events <ArrowRight size={14} className="ml-1" />
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A simple, intuitive platform designed for campus communities
            </p>
          </motion.div>
          
          <div className="relative">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Custom SVG illustration */}
              <svg viewBox="0 0 800 500" className="w-full">
                {/* Device frame */}
                <motion.rect
                  x="150" y="50" width="500" height="400" rx="20" 
                  fill="white" stroke="black" strokeWidth="8"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                />
                
                {/* App header */}
                <motion.rect
                  x="150" y="50" width="500" height="60" rx="20" 
                  fill="black"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.6 }}
                />
                
                <motion.text
                  x="400" y="85" 
                  textAnchor="middle" 
                  fill="white" 
                  fontWeight="bold"
                  fontSize="24"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1 }}
                >
                  CampusHub
                </motion.text>
                
                {/* Navigation */}
                <motion.rect
                  x="180" y="130" width="120" height="40" rx="8" 
                  fill="black"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                />
                
                <motion.text
                  x="240" y="155" 
                  textAnchor="middle" 
                  fill="white" 
                  fontSize="16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                >
                  Events
                </motion.text>
                
                <motion.rect
                  x="320" y="130" width="120" height="40" rx="8" 
                  fill="white" stroke="black" strokeWidth="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.6 }}
                />
                
                <motion.text
                  x="380" y="155" 
                  textAnchor="middle" 
                  fill="black" 
                  fontSize="16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.8 }}
                >
                  Groups
                </motion.text>
                
                <motion.rect
                  x="460" y="130" width="120" height="40" rx="8" 
                  fill="white" stroke="black" strokeWidth="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 2 }}
                />
                
                <motion.text
                  x="520" y="155" 
                  textAnchor="middle" 
                  fill="black" 
                  fontSize="16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 2.2 }}
                >
                  Calendar
                </motion.text>
                
                {/* Event cards */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 2.4 }}
                >
                  <rect x="180" y="190" width="400" height="80" rx="8" fill="white" stroke="black" strokeWidth="2" />
                  <text x="200" y="220" fill="black" fontWeight="bold" fontSize="16">Spring Career Fair</text>
                  <text x="200" y="245" fill="gray" fontSize="14">May 15 • Main Hall</text>
                  <circle cx="550" cy="220" r="15" fill="black" />
                  <path d="M545,220 L550,225 L560,215" stroke="white" strokeWidth="2" fill="none" />
                </motion.g>
                
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 2.8 }}
                >
                  <rect x="180" y="290" width="400" height="80" rx="8" fill="white" stroke="black" strokeWidth="2" />
                  <text x="200" y="320" fill="black" fontWeight="bold" fontSize="16">AI Research Symposium</text>
                  <text x="200" y="345" fill="gray" fontSize="14">May 20 • Science Building</text>
                  <circle cx="550" cy="320" r="15" fill="white" stroke="black" strokeWidth="2" />
                  <path d="M545,320 L555,320 M550,315 L550,325" stroke="black" strokeWidth="2" />
                </motion.g>
                
                {/* Abstract elements */}
                <motion.g
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.05, scale: 1 }}
                  transition={{ duration: 1.5, delay: 3.2 }}
                >
                  <circle cx="100" cy="100" r="80" fill="black" />
                  <rect x="650" y="350" width="120" height="120" fill="black" />
                  <path d="M80,400 Q200,300 300,400 T500,300" stroke="black" strokeWidth="30" fill="none" />
                </motion.g>
              </svg>
            </motion.div>
          </div>
        </div>
      </section>

      {/* For Event Organizers Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 md:order-1"
            >
              {/* Custom SVG illustration */}
              <svg viewBox="0 0 400 300" className="w-full">
                <motion.rect
                  x="50" y="50" width="300" height="200" rx="20" 
                  fill="white" stroke="black" strokeWidth="6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                />
                
                {/* Event creation form */}
                <motion.g
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <rect x="80" y="70" width="240" height="40" rx="5" fill="#f3f4f6" />
                  <text x="95" y="95" fontSize="14" fill="black">Event Title</text>
                  
                  <rect x="80" y="125" width="240" height="40" rx="5" fill="#f3f4f6" />
                  <text x="95" y="150" fontSize="14" fill="black">Location</text>
                  
                  <rect x="80" y="180" width="240" height="40" rx="5" fill="black" />
                  <text x="200" y="205" fontSize="14" fill="white" textAnchor="middle">Create Event</text>
                </motion.g>
                
                {/* Decorative elements */}
                <motion.g
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 1 }}
                >
                  <circle cx="25" cy="25" r="15" fill="black" />
                  <circle cx="375" cy="275" r="15" fill="black" />
                  <path d="M25,275 Q150,200 375,25" stroke="black" strokeWidth="4" fill="none" strokeDasharray="6,6" />
                </motion.g>
              </svg>
            </motion.div>
            
            <motion.div
              className="order-1 md:order-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-6">For Event Organizers</h2>
              <p className="text-lg text-gray-600 mb-8">
                Easily create and promote your campus events to reach the largest audience possible.
              </p>
              
              <motion.div 
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div variants={itemVariants} className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Megaphone size={24} className="text-black" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Maximum Visibility</h3>
                    <p className="text-gray-600">Reach thousands of students across campus with just a few clicks.</p>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <MessageCircle size={24} className="text-black" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Attendee Engagement</h3>
                    <p className="text-gray-600">Interact with attendees before, during, and after your events.</p>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Star size={24} className="text-black" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Analytics & Insights</h3>
                    <p className="text-gray-600">Track attendance and gather feedback to improve future events.</p>
                  </div>
                </motion.div>
              </motion.div>
              
              <motion.div 
className="mt-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <a 
                  href="https://srees-campushub.vercel.app" 
                  className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
                >
                  Create an Event <ArrowRight size={16} className="ml-2" />
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
}