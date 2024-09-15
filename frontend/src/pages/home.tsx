import { useIsAuth } from "../customhooks/is_authenticated";
import '../index.css';

export function Home() {
    useIsAuth();    
    return (
        <div className="mx-5 text-center flex flex-col justify-center">
            <p className="text-6xl font-semibold mb-6">Welcome to uniZ</p>
        </div>
    );
}
