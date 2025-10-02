import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../apis";
import { Send, XCircle, ShieldCheck, Mail, Zap } from "lucide-react";

type EmailProgress = {
  email: string;
  status: "pending" | "sent" | "failed";
  reason?: string;
};

type NotificationProgress = {
  processId: string;
  totalRecords: number;
  processedRecords: number;
  failedRecords: EmailProgress[];
  status: "pending" | "completed" | "failed";
  percentage: number;
};

type Template = {
  title: string;
  subject: string;
  body: string;
  icon: JSX.Element;
};

export default function EmailNotification() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [progress, setProgress] = useState<NotificationProgress | null>(null);
  const [sending, setSending] = useState(false);

  const intervalRef:any = useRef<NodeJS.Timer | null>(null);
  const abortRef = useRef<boolean>(false);
  const token = localStorage.getItem("admin_token");

  const templates: Template[] = [
    {
      title: "Welcome New Students",
      subject: "Welcome to UniZ Our new College management Sysystem!",
      body: `Hello Students,Welcome to our campus. We are excited to have you!`,
      icon: <Zap className="w-6 h-6 text-white" />,
    },
    {
      title: "Exam Reminder",
      subject: "Upcoming Exam Reminder",
      body: `Dear Students,Don't forget your exams start next week. Prepare well!`,
      icon: <Mail className="w-6 h-6 text-white" />,
    },
    {
      title: "Event Notification",
      subject: "Join Our Campus Event",
      body: `Hello Students,We are hosting a fun campus event this Friday. Be there!`,
      icon: <Send className="w-6 h-6 text-white" />,
    },
  ];

  const sendNotification = async () => {
    if (!subject.trim() || !body.trim()) return alert("Subject and body are required");
    setSending(true);
    abortRef.current = false;

    const payload: any = { subject, htmlBody: body, target };
    if (target === "branch") payload.filter = { branch: filterValue };
    if (target === "batch") payload.filter = { batch: filterValue };
    if (target === "userIds") payload.filter = { ids: filterValue.split(",").map((id) => id.trim()) };

    try {
      const res = await fetch(`${BASE_URL}/admin/notify/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(token!)}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.msg || "Failed to start notifications");
        setSending(false);
        return;
      }

      const pid = data.processId;
      setProgress({
        processId: pid,
        totalRecords: 0,
        processedRecords: 0,
        failedRecords: [],
        status: "pending",
        percentage: 0,
      });

      intervalRef.current = setInterval(async () => {
        if (abortRef.current) {
          clearInterval(intervalRef.current!);
          setSending(false);
          setProgress((prev) =>
            prev ? { ...prev, status: "failed", percentage: prev.percentage } : null
          );
          return;
        }
        try {
          const progRes = await fetch(`${BASE_URL}/admin/notifications-progress?processId=${pid}`, {
            headers: { Authorization: `Bearer ${JSON.parse(token!)}` },
          });
          const progData = await progRes.json();
          if (progData.success) {
            setProgress(progData);
            if (progData.status !== "pending") {
              clearInterval(intervalRef.current!);
              setSending(false);
            }
          }
        } catch (err) {
          console.error("Error fetching progress", err);
        }
      }, 1000);

      setSubject("");
      setBody("");
      setFilterValue("");
      setTarget("all");
    } catch (err) {
      console.error(err);
      alert("Error sending notifications");
      setSending(false);
    }
  };

  const cancelNotification = () => {
    if (!sending || !progress) return;
    abortRef.current = true;
  };

  const selectTemplate = (template: Template) => {
    setSubject(template.subject);
    setBody(template.body);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-black" />
            Secure Email Notifications
          </h1>
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2 border border-black rounded-lg hover:bg-gray-100 transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* AI Template Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((t) => (
            <div
              key={t.title}
              onClick={() => selectTemplate(t)}
              className="bg-white bg-opacity-90 backdrop-blur-sm shadow-lg rounded-2xl p-5 cursor-pointer hover:scale-105 transition-transform"
            >
              <div className="flex items-center mb-3 gap-3">
                <div className="bg-black p-3 rounded-full flex items-center justify-center">{t.icon}</div>
                <h3 className="font-bold text-gray-900">{t.title}</h3>
              </div>
              <p className="text-gray-700 text-sm line-clamp-3">{t.body.replace(/<[^>]+>/g, "")}</p>
            </div>
          ))}
        </div>

        {/* Email Form */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm shadow-2xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Mail className="w-6 h-6 text-black" />
            Compose Email
          </h2>

          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 text-black"
          />
          <textarea
            placeholder="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 text-black"
            rows={5}
          />

          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 text-black"
          >
            <option value="all">All Students</option>
            <option value="branch">By Branch</option>
            <option value="batch">By Batch / Year</option>
            <option value="userIds">By Roll Numbers / Emails</option>
          </select>

          {(target === "branch" || target === "batch" || target === "userIds") && (
            <input
              type="text"
              placeholder={
                target === "branch"
                  ? "Branch (e.g., CSE)"
                  : target === "batch"
                  ? "Batch / Year (e.g., 2025)"
                  : "Comma-separated IDs / emails (e.g., o21001,o21002)"
              }
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 text-black"
            />
          )}

          <div className="flex gap-4 mb-4">
            <button
              onClick={sendNotification}
              disabled={sending}
              className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {sending ? "Sending..." : "Send"}
            </button>
            {sending && (
              <button
                onClick={cancelNotification}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Cancel
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {progress && (
            <div className="mt-6">
              <div className="flex justify-between mb-1 text-gray-700">
                <span className="font-semibold">
                  {progress.processedRecords}/{progress.totalRecords}
                </span>
                <span>{progress.percentage.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    progress.status === "failed"
                      ? "bg-red-600"
                      : progress.status === "completed"
                      ? "bg-green-600"
                      : "bg-black"
                  }`}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <p className="mb-2 font-medium">Status: {progress.status}</p>

              {progress.failedRecords.length > 0 && (
                <div className="mt-4 text-red-600">
                  <h3 className="font-semibold mb-2">Failed Emails:</h3>
                  <ul className="list-disc ml-5 max-h-40 overflow-y-auto">
                    {progress.failedRecords.map((f, idx) => (
                      <li key={idx}>
                        {f.email} - {f.reason || "Unknown"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
