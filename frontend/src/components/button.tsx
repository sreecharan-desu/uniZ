type ButtonProps = {
    value: string,
    onclickFunction: () => void,
    loading : boolean
}

export function Button({ value,loading, onclickFunction }: ButtonProps) {
    if(loading){
        return (
            <button
                onClick={onclickFunction}
                className="bg-gray-400 text-white py-2 px-4 rounded w-full"
                disabled
            >
                Loading...
            </button>
        );
    }else{
        return (
            <button
                onClick={onclickFunction}
                className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition duration-300 w-full"
            >
                {value}
            </button>
        );
    }

}
