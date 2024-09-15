type ButtonProps = {
    value: string,
    onclickFunction: () => void,
}

export function Button({ value, onclickFunction }: ButtonProps) {
    return (
        <button
            onClick={onclickFunction}
            className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition duration-300"
        >
            {value}
        </button>
    );
}
