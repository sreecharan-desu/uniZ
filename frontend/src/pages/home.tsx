import { useIsAuth } from "../customhooks/is_authenticated";
import '../index.css';
import { Analytics } from "@vercel/analytics/react"

export function Home() {
    useIsAuth();    
    return (
        <>
            <Analytics/>
            <div className="mx-5 text-center flex flex-col justify-center">
                <p className="text-6xl font-semibold mb-6">Welcome to uniZ</p>
            </div>
        </>
    );
}
