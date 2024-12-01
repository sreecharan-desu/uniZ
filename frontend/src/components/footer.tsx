export function Footer() {
    const year = new Date().getFullYear();
    return (

        <div className="flex-col justify-center place-content-center align-middle py-2 bg-black">
            <div className="font-bold  text-white text-center">
                uniZ &middot; {year} &middot; All rights reserved
            </div>
            <div className="font-bold bg-black text-white text-center">
                Made with &hearts; by SreeCharan
            </div>
        </div>
    );
}
