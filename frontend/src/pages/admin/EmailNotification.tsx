
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../api/endpoints";
import { Send, Mail, Zap, ArrowLeft, BookOpen, AlertTriangle } from "lucide-react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { cn } from "../../utils/cn";

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const intervalRef: any = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<boolean>(false);
  const token = localStorage.getItem("admin_token");

  const templates: Template[] = [
    {
      title: "Welcome New Students",
      subject: "Welcome to UniZ",
      body: `Hello Students,\n\nWelcome to our campus! We are excited to have you join our vibrant community.\n\nBest regards,\nAdministration`,
      icon: <Zap className="w-5 h-5 text-white" />,
    },
    {
      title: "Exam Reminder",
      subject: "Upcoming Exam Reminder",
      body: `Dear Students,\n\nThis is a reminder that your exams are scheduled to start next week. Please ensure you are well prepared.\n\nGood luck!`,
      icon: <BookOpen className="w-5 h-5 text-white" />,
    },
    {
      title: "Event Notification",
      subject: "Campus Event Invitation",
      body: `Hello Students,\n\nWe are hosting an exciting campus event this Friday. Don't miss out!\n\nSee you there!`,
      icon: <Send className="w-5 h-5 text-white" />,
    },
  ];

  const sendNotification = async () => {
    if (!subject.trim() || !body.trim()) return alert("Subject and body are required");
    setSending(true);
    abortRef.current = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          const progRes = await fetch(`${BASE_URL}/admin/notify/progress?processId=${pid}`, {
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
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
         <div className="flex flex-col gap-6">
            <button
                onClick={() => navigate("/admin")}
                className="self-start inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Email Notifications</h1>
                    <p className="text-slate-500 mt-1">Broadcast important updates to students securely.</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Main Composer */}
             <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 shadow-sm">
                       <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                           <Mail className="w-5 h-5 text-slate-500" /> Compose Email
                       </h2>

                       <div className="space-y-5">
                           <Input
                                value={subject}
                                onchangeFunction={(e: any) => setSubject(e.target.value)}
                                placeholder="Subject Line"
                                className="font-medium"
                           />
                           
                           <div className="space-y-1.5 ml-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Message Body</label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Write your message here..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none h-48"
                                />
                           </div>

                           <div className="pt-2 flex gap-4">
                                <Button
                                    onclickFunction={sendNotification}
                                    loading={sending}
                                    value="Send Broadcast"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                />
                                {sending && (
                                     <button
                                        onClick={cancelNotification}
                                        className="px-6 py-2 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                           </div>
                       </div>
                  </div>

                  {/* Progress Section */}
                  {progress && (
                      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                          <div className="flex justify-between items-center mb-3">
                               <h3 className="font-semibold text-slate-900">Sending Status</h3>
                               <span className={cn(
                                   "px-2 py-0.5 rounded-md text-xs font-bold uppercase",
                                   progress.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                   progress.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                               )}>
                                   {progress.status}
                               </span>
                          </div>

                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                               <span>{progress.processedRecords} / {progress.totalRecords} sent</span>
                               <span>{progress.percentage.toFixed(0)}%</span>
                          </div>
                          
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
                                <div
                                className={cn("h-full transition-all duration-300", 
                                    progress.status === "failed" ? "bg-red-500" : 
                                    progress.status === "completed" ? "bg-emerald-500" : "bg-blue-500"
                                )}
                                style={{ width: `${progress.percentage}%` }}
                                />
                         </div>

                         {progress.failedRecords.length > 0 && (
                            <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-red-700 mb-2">
                                    <AlertTriangle className="w-4 h-4" /> Failed Recipients
                                </h4>
                                <ul className="list-disc list-inside text-xs text-red-600 max-h-32 overflow-y-auto space-y-1">
                                    {progress.failedRecords.map((f, i) => (
                                        <li key={i}>{f.email} <span className="opacity-75">- {f.reason}</span></li>
                                    ))}
                                </ul>
                            </div>
                         )}
                      </div>
                  )}
             </div>

             {/* Sidebar Options */}
             <div className="space-y-6">
                 {/* Audience Selector */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Target Audience</h3>
                      
                      <div className="space-y-4">
                           <select
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="all">All Students</option>
                                <option value="branch">Specific Branch</option>
                                <option value="batch">Specific Batch / Year</option>
                                <option value="userIds">Specific Students (IDs)</option>
                            </select>

                            {(target === "branch" || target === "batch" || target === "userIds") && (
                                <div className="animate-in fade-in slide-in-from-top-1">
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                                        {target === "branch" ? "Enter Branch Code" : 
                                         target === "batch" ? "Enter Batch Year" : "Enter IDs (comma separated)"}
                                    </label>
                                    <input
                                        type="text"
                                        value={filterValue}
                                        onChange={(e) => setFilterValue(e.target.value)}
                                        placeholder={target === 'userIds' ? "e.g. o210001, o210002" : "e.g. CSE or 2024"}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            )}
                      </div>
                  </div>

                  {/* Templates */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                       <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Quick Templates</h3>
                       <div className="space-y-3">
                           {templates.map((t) => (
                               <button
                                  key={t.title}
                                  onClick={() => selectTemplate(t)}
                                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                               >
                                   <div className="flex items-center gap-3 mb-1">
                                       <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                                           {t.icon}
                                       </div>
                                       <span className="font-semibold text-slate-900 text-sm">{t.title}</span>
                                   </div>
                                   <p className="text-xs text-slate-500 line-clamp-2 pl-9">
                                       {t.subject}
                                   </p>
                               </button>
                           ))}
                       </div>
                  </div>
             </div>
        </div>
    </div>
  );
}
