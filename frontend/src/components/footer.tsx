export function Footer() {
    const year = new Date().getFullYear();
    return (

        <div className="flex-col justify-center place-content-center align-middle py-2 border-t-2 ">
            <div className="font-bold  text-black text-center">
                uniZ &middot; {year} &middot; All rights reserved
            </div>
            <div className="font-bold bg-white text-black text-center">
                Made with &hearts; by SreeCharan
            </div>
        </div>
    );
}
