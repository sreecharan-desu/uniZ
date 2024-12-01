import { useState, useEffect } from "react";

interface PushNotificationProps {
  message: string;
}

const PushNotification: React.FC<PushNotificationProps> = ({ message }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timeout
  }, []);

  if (!isVisible) return null; // Do not render if not visible

  return (
    <div
      className={`fixed bottom-5 right-5 px-4 py-3 rounded-md shadow-lg bg-black text-center text-white text-sm font-extrabold
      transform transition-transform duration-1000 ease-in-out
      ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
    >
      {message}
    </div>
  );
};

export default PushNotification;
