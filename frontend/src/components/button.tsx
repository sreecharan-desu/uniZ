type ButtonProps = {
    value: string,
    onclickFunction: () => void,
    loading: boolean
}

export function Button({ value, loading, onclickFunction }: ButtonProps) {
    if (loading) {
        return (
            <button
                onClick={onclickFunction}
                className="bg-gray-400 text-white py-2 px-4 rounded w-full flex justify-center items-center"
                disabled
            >
                <div className="spinner-border animate-spin border-t-2 border-b-2 border-white w-5 h-5 rounded-full mr-2"></div>
                Loading...
            </button>

        );
    } else {
        return (
            <button
                onClick={onclickFunction}
                className="bg-black text-white py-2 px-4 underline rounded hover:bg-gray-800 transition duration-300 w-full"
            >
                {value}
            </button>
        );
    }

}
