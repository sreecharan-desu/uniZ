import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { PageTransition } from './Transition';

export function Modal({ children, isOpen, onClose }: { children: React.ReactNode; isOpen: boolean; onClose: () => void }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black"
                        onClick={onClose}
                    />
                    <PageTransition type="modal">
                        <div className="fixed inset-0 flex items-center justify-center">
                            {children}
                        </div>
                    </PageTransition>
                </>
            )}
        </AnimatePresence>
    );
} 