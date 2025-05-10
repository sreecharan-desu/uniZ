import { useState, useEffect } from "react";
import { Users, Book, Map, Calendar, Search, ArrowRight, Bookmark, Star, Coffee, Sparkles } from "lucide-react";

// Framer Motion is available in this environment
import { motion } from "framer-motion";

export default function StudySpace() {
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
      title: "Create Study Spaces",
      description: "Organize study sessions by specifying subject, location, date, and time.",
      icon: <Calendar size={24} className="text-black" />,
    },
    {
      title: "Join Study Spaces",
      description: "Find and join local study spaces that match your interests and schedule.",
      icon: <Users size={24} className="text-black" />,
    },
    {
      title: "Location-Based",
      description: "Discover study sessions happening near you with our interactive map.",
      icon: <Map size={24} className="text-black" />,
    },
    {
      title: "Subject Focus",
      description: "Filter study spaces by academic subjects or specific topics.",
      icon: <Book size={24} className="text-black" />,
    },
  ];

  const testimonials = [
    {
      quote: "Study Space completely changed how I prepare for exams. The in-person connections are invaluable.",
      author: "SreeCharan, Computer Science Student"
    },
    {
      quote: "As a student, I use Study Space to organize additional help sessions. My friends love it!",
      author: "SreeHari, Mechanical"
    }
  ];

  // Staggered animation for svg elements
  const svgVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

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
                <Book size={36} className="text-white" />
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl font-bold tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Study<span className="text-gray-500">Space</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-700 max-w-2xl mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Connect, collaborate, and learn together in physical spaces
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <a 
                href="https://studyspace-exp.vercel.app/" 
                className="px-8 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                Get Started <ArrowRight size={16} className="ml-2" />
              </a>
              <a 
                href="https://studyspace-exp.vercel.app/" 
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
            <motion.circle cx="400" cy="300" r="200" fill="black" 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.2 }}
            />
            <motion.rect x="600" y="400" width="300" height="300" fill="black" 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.4 }}
            />
            <motion.path d="M100,600 Q400,300 700,600 T900,300" stroke="black" strokeWidth="60" fill="none" 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, delay: 0.6 }}
            />
          </svg>
        </motion.div>
      </header>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-3">How Study Space Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A simple process to connect with other learners in physical spaces
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
                <Search size={28} className="text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Find</h3>
              <p className="text-gray-600">Search for study spaces near you based on subject, date, and location.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Bookmark size={28} className="text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Join</h3>
              <p className="text-gray-600">Reserve your spot in a study session with just a few clicks.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Coffee size={28} className="text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect</h3>
              <p className="text-gray-600">Meet in person, collaborate, and enhance your learning experience.</p>
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
            <h2 className="text-3xl font-bold mb-3">Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to build your perfect in-person study environment
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

      {/* App Showcase */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-6">Experience the power of in-person collaboration</h2>
              <p className="text-lg text-gray-600 mb-8">
                Our platform is designed to bring back the magic of face-to-face learning while keeping
                the convenience of digital organization.
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
                  <span>Build meaningful connections with peers and mentors</span>
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
                    <Star size={20} />
                  </div>
                  <span>Improve knowledge retention through discussion</span>
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
                    <Star size={20} />
                  </div>
                  <span>Find study spaces in libraries, cafes, and campuses</span>
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
                  href="https://studyspace-exp.vercel.app/" 
                  className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
                >
                  Try Study Space <ArrowRight size={16} className="ml-2" />
                </a>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Custom SVG illustration */}
              <svg viewBox="0 0 500 500" className="w-full">
                <motion.rect
                  x="100" y="100" width="300" height="300" rx="20" 
                  fill="white" stroke="black" strokeWidth="6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                />
                
                {/* Map lines */}
                <motion.path 
                  d="M150,150 L350,150 L350,350 L150,350 Z" 
                  fill="none" stroke="black" strokeWidth="2" strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 0.6 }}
                />
                
                {/* Location pins */}
                <motion.g
                  variants={svgVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 1.2 }}
                >
                  <circle cx="200" cy="200" r="15" fill="black" />
                  <circle cx="300" cy="250" r="15" fill="black" />
                  <circle cx="250" cy="300" r="15" fill="black" />
                </motion.g>
                
                {/* People icons */}
                <motion.g
                  variants={svgVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 1.5 }}
                >
                  <circle cx="200" cy="200" r="8" fill="white" />
                  <circle cx="300" cy="250" r="8" fill="white" />
                  <circle cx="250" cy="300" r="8" fill="white" />
                </motion.g>
                
                {/* Books */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.8 }}
                >
                  <rect x="380" y="120" width="40" height="60" rx="5" fill="black" />
                  <rect x="385" y="130" width="30" height="5" fill="white" />
                  <rect x="385" y="140" width="20" height="5" fill="white" />
                </motion.g>
              </svg>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-3">What Our Users Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of students and educators enhancing their learning experience
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="bg-white p-8 rounded-lg shadow-sm border border-gray-100"
              >
                <svg width="40" height="40" viewBox="0 0 40 40" className="mb-6 text-gray-300">
                  <path
                    fill="currentColor"
                    d="M10,0 L20,0 L15,15 L7.5,15 L10,0 Z M30,0 L40,0 L35,15 L27.5,15 L30,0 Z"
                  />
                </svg>
                <p className="text-lg mb-6">{testimonial.quote}</p>
                <p className="font-medium">{testimonial.author}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <Sparkles size={48} className="mx-auto text-white" />
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your learning experience?</h2>
            <p className="text-xl mb-10 text-gray-300">
              Join Study Space today and connect with learners near you.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <a 
                href="https://studyspace-exp.vercel.app/" 
                className="px-8 py-4 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-colors inline-flex items-center"
              >
                Get Started <ArrowRight size={16} className="ml-2" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}