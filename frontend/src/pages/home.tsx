import { useIsAuth } from "../customhooks/is_authenticated";
import '../index.css';

export function Home() {
    useIsAuth();    
    return (
        <>
            <div className="mx-5 text-center flex flex-col justify-center align-middle place-content-center">
                <p className="text-6xl font-semibold mb-6">Welcome to uniZ</p>
                <p className="text-2xl text-gray-400 font-bold"> Signin now! To explore what you can do in this website.</p>
            </div>
        </>
    );
}
