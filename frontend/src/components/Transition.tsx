import { motion, AnimatePresence } from 'framer-motion';

interface TransitionProps {
    children: React.ReactNode;
    type?: 'page' | 'component' | 'list' | 'modal';
    delay?: number;
}

const variants = {
    page: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    },
    component: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
    },
    list: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
    },
    modal: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.1 },
    }
};

export const PageTransition = ({ children, type = 'page', delay = 0 }: TransitionProps) => {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={variants[type].initial}
                animate={variants[type].animate}
                exit={variants[type].exit}
                transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                    delay: delay
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

// List item transition for mapping over arrays
export const ListItemTransition = ({ children, index = 0 }: { children: React.ReactNode; index?: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{
                duration: 0.2,
                delay: index * 0.05, // Stagger effect
            }}
        >
            {children}
        </motion.div>
    );
}; 