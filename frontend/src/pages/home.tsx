import { useIsAuth } from "../customhooks/is_authenticated";
import '../index.css';
import { motion } from 'framer-motion'; // For animations
import { FaBook, FaUsers, FaCalendarAlt } from 'react-icons/fa'; // For icons

export default function Home() {
    useIsAuth();

    // Animation variants for smooth transitions
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.2 },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
        hover: { scale: 1.05, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)", transition: { duration: 0.3 } },
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-br from-white to-gray-200">
            {/* Hero Section */}
            <motion.div
                className="max-w-5xl text-center space-y-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1
                    className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-black tracking-tight"
                    variants={containerVariants}
                >
                uniZ
                </motion.h1>
                <motion.p
                    className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light leading-relaxed max-w-3xl mx-auto"
                    variants={containerVariants}
                >
                    Your all-in-one platform to manage grades, connect with study groups, and dive into campus life with ease.
                </motion.p>

       {/* Feature Cards */}
<motion.div
    className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-16"
    variants={containerVariants}
>
    {[
        {
            icon: <FaBook className="text-black text-3xl" />,
            title: "Grade Hub",
            description: "Track your academic progress with real-time grade insights.",
        },
        {
            icon: <FaUsers className="text-black text-3xl" />,
            title: "Study Space",
            description: "Collaborate and learn with peers in dedicated study groups.",
        },
        {
            icon: <FaCalendarAlt className="text-black text-3xl" />,
            title: "CampusHub",
            description: "Never miss out on exciting campus events and activities.",
        },
    ].map((feature, index) => (
        <motion.div
            key={index}
            className="relative p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
            variants={cardVariants}
            whileHover="hover"
        >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-100/50 to-transparent rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
            <div className="flex justify-center mb-4">
                {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-black mb-2 text-center">{feature.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed text-center">{feature.description}</p>
        </motion.div>
    ))}
</motion.div>

                {/* CTA Button */}
                <motion.div className="mt-16" variants={containerVariants}>
                    <a
                        href="/student/signin"
                        className="inline-block px-8 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        Start Your Journey
                    </a>
                    <p className="mt-4 text-gray-500 text-sm font-light">
                        Join thousands of students thriving with uniZ
                    </p>
                </motion.div>
            </motion.div>

            {/* Subtle Background Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gray-100 rounded-full opacity-20 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-100 rounded-full opacity-20 blur-3xl" />
            </div>
        </div>
    );
}