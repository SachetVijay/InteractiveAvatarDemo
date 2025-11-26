import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SynopsisPanelProps {
    synopsis: string[];
    isLoading: boolean;
}

export const SynopsisPanel: React.FC<SynopsisPanelProps> = ({ synopsis, isLoading }) => {
    if (synopsis.length === 0 && !isLoading) return null;

    return (
        <div className="absolute right-8 top-24 w-80 bg-zinc-900/80 backdrop-blur-md rounded-xl p-6 border border-zinc-700/50 shadow-xl z-10 hidden lg:flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Live Synopsis</h3>
                {isLoading && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
            </div>

            <ul className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                    {synopsis.map((point, index) => (
                        <motion.li
                            key={`${index}-${point.substring(0, 10)}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="text-sm text-zinc-300 leading-relaxed flex gap-2"
                        >
                            <span className="text-blue-500 mt-1.5">•</span>
                            <span>{point}</span>
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>

            {synopsis.length === 0 && isLoading && (
                <div className="text-zinc-500 text-sm italic">
                    Listening to conversation...
                </div>
            )}
        </div>
    );
};
