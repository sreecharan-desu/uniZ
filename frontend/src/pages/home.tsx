import { useNavigate } from "react-router";
import { Button } from "../components/button";
import { useIsAuth } from "../customhooks/is_authenticated";
import '../index.css';

export function Home() {
    useIsAuth();
    const navigateTo = useNavigate();
    
    return (
        <div className="h-[93vh] mx-5 text-center flex flex-col justify-center">
            <p className="text-xl font-semibold mb-6">Welcome to uniZ</p>
            <div className="flex flex-row justify-center space-x-4">
                <Button
                    onclickFunction={() => navigateTo('/student/signin')}
                    value="Student"
                    loading= {false}
                />
                <Button
                    onclickFunction={() => navigateTo('/admin/signin')}
                    value="Admin"
                    loading= {false}
                />
            </div>
        </div>
    );
}
