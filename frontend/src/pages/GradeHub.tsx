import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function GradeHubComingSoon() {


  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.4,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const pikachuVariants = {
    hidden: { scale: 0.8, opacity: 0, rotate: -10 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        bounce: 0.5,
      },
    },
    hover: {
      scale: 1.1,
      rotate: [0, 5, -5, 0],
      transition: {
        rotate: { repeat: Infinity, duration: 0.5 },
      },
    },
  };


  return (
    <div className="min-h-screen bg-white font-sans text-black flex flex-col">
 
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-16 px-6">
        <motion.div
          className="text-center max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={pikachuVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="relative mx-auto mb-8"
          >
            <img
              src="/pikachu.png"
              alt="Pikachu"
              className="w-40 h-40 object-contain"
            />
            <motion.div
              className="absolute -top-4 -right-4"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Zap size={24} className="text-black" />
            </motion.div>
          </motion.div>
          <motion.h2
            className="text-5xl md:text-6xl font-bold mb-6 tracking-tight"
            variants={itemVariants}
          >
            GradeHub's Charging Up! ⚡️
          </motion.h2>
          <motion.p
            className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto"
            variants={itemVariants}
          >SreeCharan & Pikachu sparking some epic upgrades, and we'll be back soon, Get ready to track grades, smash goals, and stay organized like us.
          </motion.p>
          {/* Newsletter Signup */}

        </motion.div>
      </main>

 
    </div>
  );
}