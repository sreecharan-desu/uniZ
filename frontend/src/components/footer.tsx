export function Footer() {
    const year = new Date().getFullYear();
    return (
        <div className="font-bold text-center fixed bottom-0 left-0 right-0 py-2 bg-white text-black flex justify-center items-center border-t border-gray-300">
            uniZ &middot; {year} &middot; All rights reserved
        </div>
    );
}
