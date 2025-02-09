import { useState } from 'react';

export default function GradeLite() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className='flex flex-row items-center justify-center h-screen w-96 mx-auto'>
            <div className="flex flex-col items-center justify-center h-screen w-96">
                {/* Skeleton */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-pulse space-y-4 w-full h-full bg-red-100/20">
                            <div className="flex items-center justify-center h-full">
                                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        </div>
                    </div>
                )}

                <iframe
                    src="https://sreecharan-desu.github.io/Gradelite/#GradeLite"
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    title="GradeLite"
                    onLoad={() => setIsLoading(false)}
                />
            </div>
        </div>

    );
}