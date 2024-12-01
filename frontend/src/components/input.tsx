import { useState } from "react";

type InputProps = {
    type: string,
    placeholder: string,
    onchangeFunction: React.ChangeEventHandler<HTMLInputElement> | undefined,
}

export function Input({ type, placeholder, onchangeFunction }: InputProps) {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    if (type === "password") {
        return (
            <div className="flex items-center space-x-2 w-full">
                <input
                    type={passwordVisible ? 'text' : 'password'}
                    placeholder={placeholder}
                    onChange={onchangeFunction}
                    className="mb-4 p-2 border border-gray-300 rounded w-full"
                />
                <button
                    onClick={togglePasswordVisibility}
                    className="bg-transparent h-10 cursor-pointer text-black"
                >
                    {passwordVisible ? '🙈' : '👁️'}
                </button>
            </div>
        );
    } else {
        return (
            <input
                type={type}
                placeholder={placeholder}
                onChange={onchangeFunction}
                className="mb-4 p-2 border border-gray-300 rounded w-full"
            />
        );
    }
}
