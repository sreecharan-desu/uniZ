import { useRecoilValue } from "recoil";
import { student } from "../store";
import { useNavigate } from "react-router";
import Outpass_Outing from "./outpass&outing";
import { Resetpassword } from "./resetpass";
import { RequestComp } from "./request-component";
import { Error } from "../App";
import { Student } from "../pages/student";


type MainContent = {
    content : "outpass" | "outing" | "gradehub" | "resetpassword" | "dashboard" | "requestOuting" | "requestOutpass" | "dashboard" | "error"
}



export default function Sidebar({content}:MainContent){
    const username = useRecoilValue(student);
    const navigateTo = useNavigate();
  return (
    <div className="flex -m-10 min-h-screen w-full">
      <aside
        className={`w-64 bg-black text-white`}
      >
        <div className="p-4 text-center font-bold text-lg border-b border-gray-700">
  <p className="text-white text-left flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-6 h-6">
      <path
        fillRule="evenodd"
        d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-5-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 9c-1.825 0-3.422.977-4.295 2.437A5.49 5.49 0 0 0 8 13.5a5.49 5.49 0 0 0 4.294-2.063A4.997 4.997 0 0 0 8 9Z"
        clipRule="evenodd"
      />
    </svg>
    {username.username.toUpperCase()}
  </p>

        </div>
        <nav className="mt-4 space-y-2">
  <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer" onClick={() => navigateTo('/student')}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-6 h-6">
      <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 0 1 4.25 2h7.5A2.25 2.25 0 0 1 14 4.25v5.5A2.25 2.25 0 0 1 11.75 12h-1.312c.1.128.21.248.328.36a.75.75 0 0 1 .234.545v.345a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-.345a.75.75 0 0 1 .234-.545c.118-.111.228-.232.328-.36H4.25A2.25 2.25 0 0 1 2 9.75v-5.5Zm2.25-.75a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75h-7.5Z" clipRule="evenodd" />
    </svg>
    <span className="text-white">Dashboard</span>
  </div>

  <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer" onClick={() => navigateTo('/student/outing')}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-6">
  <path fill-rule="evenodd" d="M8 3.5c-.771 0-1.537.022-2.297.066a1.124 1.124 0 0 0-1.058 1.028l-.018.214a.75.75 0 1 1-1.495-.12l.018-.221a2.624 2.624 0 0 1 2.467-2.399 41.628 41.628 0 0 1 4.766 0 2.624 2.624 0 0 1 2.467 2.399c.056.662.097 1.329.122 2l.748-.748a.75.75 0 1 1 1.06 1.06l-2 2.001a.75.75 0 0 1-1.061 0l-2-1.999a.75.75 0 0 1 1.061-1.06l.689.688a39.89 39.89 0 0 0-.114-1.815 1.124 1.124 0 0 0-1.058-1.028A40.138 40.138 0 0 0 8 3.5ZM3.22 7.22a.75.75 0 0 1 1.061 0l2 2a.75.75 0 1 1-1.06 1.06l-.69-.69c.025.61.062 1.214.114 1.816.048.56.496.996 1.058 1.028a40.112 40.112 0 0 0 4.594 0 1.124 1.124 0 0 0 1.058-1.028 39.2 39.2 0 0 0 .018-.219.75.75 0 1 1 1.495.12l-.018.226a2.624 2.624 0 0 1-2.467 2.399 41.648 41.648 0 0 1-4.766 0 2.624 2.624 0 0 1-2.467-2.399 41.395 41.395 0 0 1-.122-2l-.748.748A.75.75 0 1 1 1.22 9.22l2-2Z" clip-rule="evenodd" />
</svg>
    <span className="text-white">Outing</span>
  </div>

  <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer" onClick={() => navigateTo('/student/outpass')}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-6 h-6">
      <path d="M4.75 2A2.75 2.75 0 0 0 2 4.75v6.5A2.75 2.75 0 0 0 4.75 14h3a2.75 2.75 0 0 0 2.75-2.75v-.5a.75.75 0 0 0-1.5 0v.5c0 .69-.56 1.25-1.25 1.25h-3c-.69 0-1.25-.56-1.25-1.25v-6.5c0-.69.56-1.25 1.25-1.25h3C8.44 3.5 9 4.06 9 4.75v.5a.75.75 0 0 0 1.5 0v-.5A2.75 2.75 0 0 0 7.75 2h-3Z" />
      <path d="M8.03 6.28a.75.75 0 0 0-1.06-1.06L4.72 7.47a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06l-.97-.97h7.19a.75.75 0 0 0 0-1.5H7.06l.97-.97Z" />
    </svg>
    <span className="text-white">Outpass</span>
  </div>

  <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer" onClick={() => navigateTo('/student/gradehub')}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-6 h-6">
      <path d="M7.702 1.368a.75.75 0 0 1 .597 0c2.098.91 4.105 1.99 6.004 3.223a.75.75 0 0 1-.194 1.348A34.27 34.27 0 0 0 8.341 8.25a.75.75 0 0 1-.682 0c-.625-.32-1.262-.62-1.909-.901v-.542a36.878 36.878 0 0 1 2.568-1.33.75.75 0 0 0-.636-1.357 38.39 38.39 0 0 0-3.06 1.605.75.75 0 0 0-.372.648v.365c-.773-.294-1.56-.56-2.359-.8a.75.75 0 0 1-.194-1.347 40.901 40.901 0 0 1 6.005-3.223ZM4.25 8.348c-.53-.212-1.067-.411-1.611-.596a40.973 40.973 0 0 0-.418 2.97.75.75 0 0 0 .474.776c.175.068.35.138.524.21a5.544 5.544 0 0 1-.58.681.75.75 0 1 0 1.06 1.06c.35-.349.655-.726.915-1.124a29.282 29.282 0 0 0-1.395-.617A5.483 5.483 0 0 0 4.25 8.5v-.152Z" />
    </svg>
    <span className="text-white text-center">GradeHub <b className="bg-gray-700 rounded-full px-3 -pt-2">exp</b></span>
  </div>
  <div className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer" onClick={() => navigateTo('/student/resetpassword')}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-6 h-6">
      <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z" clipRule="evenodd" />
    </svg>
    <span className="text-white">Reset Password</span>
  </div>
</nav>
      </aside>
      <div className="w-full mt-0 mr-0 mb-0 ml-2">
        <div className="w-full p-10">
            { (content == 'outing') ? <><Outpass_Outing request="outing"/></> : (content == 'outpass') ? <><Outpass_Outing request="outpass"/></> : (content == 'resetpassword') ? <><Resetpassword/></> : (content == 'requestOuting') ? <><RequestComp type='outing' /></> : (content == 'requestOutpass') ? <><RequestComp type="outpass"/></> : (content == 'dashboard' ? <><Student/></> : (content == "error" ? <><Error/></> : <></>))}
        </div>
      </div>
    </div>
  );
};