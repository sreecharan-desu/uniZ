
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../api/endpoints";
import {
  Trash2,
  PlusCircle,
  Eye,
  GripVertical,
  Image as ImageIcon,
  LayoutDashboard,
  ArrowLeft,
  Upload,
  EyeOff
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { cn } from "../../utils/cn";

type Banner = {
  id: string;
  text: string;
  imageUrl: string;
  isPublished: boolean;
  title: string;
};

function SortableBannerCard({
  banner,
  deleteBanner,
  publishBanner,
}: {
  banner: Banner;
  deleteBanner: (id: string) => void;
  publishBanner: (id: string, publish: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: banner.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-white border border-slate-200 shadow-sm hover:shadow-md rounded-xl overflow-hidden transition-all duration-200"
    >
      <div className="relative aspect-video bg-slate-100">
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="h-full w-full object-cover"
          />
           <div
            {...attributes}
            {...listeners}
            className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg cursor-grab shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-slate-600"
          >
            <GripVertical className="w-5 h-5" />
          </div>
          <div className="absolute top-3 right-3">
               <span className={cn(
                   "px-2 py-1 text-xs font-bold uppercase tracking-wide rounded-md backdrop-blur-md shadow-sm border",
                   banner.isPublished 
                   ? "bg-emerald-500/90 text-white border-emerald-400" 
                   : "bg-slate-500/90 text-white border-slate-400"
               )}>
                   {banner.isPublished ? "Published" : "Draft"}
               </span>
          </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">
          {banner.title}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 min-h-[40px]">{banner.text}</p>
        
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
             <button
                onClick={() => publishBanner(banner.id, !banner.isPublished)}
                className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors border",
                    banner.isPublished
                    ? "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                )}
            >
                {banner.isPublished ? (
                    <><EyeOff className="w-4 h-4" /> Unpublish</>
                ) : (
                    <><Eye className="w-4 h-4" /> Publish</>
                )}
            </button>
            <button
                onClick={() => deleteBanner(banner.id)}
                className="flex items-center justify-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Banner"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
}

export default function BannerManager() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("admin_token");
  const CLOUDINARY_UPLOAD_PRESET = "hho_unsigned";
  const CLOUDINARY_CLOUD_NAME = "dy2fjgt46";

  const fetchBanners = async () => {
    const res = await fetch(`${BASE_URL}/admin/banners`, {
      headers: { Authorization: `Bearer ${JSON.parse(token!)}` },
    });
    const data = await res.json();
    if (data.success) setBanners(data.banners);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  };

  const addBanner = async () => {
    if (!title || !text || !image) return alert("Title, Text and Image are required");
    setLoading(true);
    try {
      const imageUrl = await uploadToCloudinary(image);
      const res = await fetch(`${BASE_URL}/admin/banners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(token!)}`,
        },
        body: JSON.stringify({ title, text, imageUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setText("");
        setTitle("");
        setImage(null);
        fetchBanners();
      } else alert("Failed to add banner");
    } catch (err) {
      console.error(err);
      alert("Error uploading image or adding banner");
    } finally {
        setLoading(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if(!confirm("Are you sure you want to delete this banner?")) return;
    await fetch(`${BASE_URL}/admin/banners/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${JSON.parse(token!)}` },
    });
    fetchBanners();
  };

  const publishBanner = async (id: string, publish: boolean) => {
    await fetch(`${BASE_URL}/admin/banners/${id}/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(token!)}`,
      },
      body: JSON.stringify({ publish }),
    });
    fetchBanners();
  };

  const sensors = useSensors(useSensor(PointerSensor));
  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = banners.findIndex((b) => b.id === active.id);
      const newIndex = banners.findIndex((b) => b.id === over.id);
      setBanners(arrayMove(banners, oldIndex, newIndex));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files: any) => setImage(files[0]),
    accept: { "image/*": [] },
    multiple: false
  });

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
                    <h1 className="text-2xl font-bold text-slate-900">Banner Management</h1>
                    <p className="text-slate-500 mt-1">Create and manage homepage banners and announcements.</p>
                </div>
            </div>
        </div>

        {/* Add Banner Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
             <div className="flex flex-col lg:flex-row gap-8">
                  {/* Dropzone */}
                  <div className="lg:w-1/3">
                      <div
                        {...getRootProps()}
                        className={cn(
                            "h-full min-h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-6 cursor-pointer transition-all bg-slate-50",
                            isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400 hover:bg-slate-100",
                            image && "border-emerald-500 bg-emerald-50"
                        )}
                    >
                        <input {...getInputProps()} />
                        {image ? (
                        <div className="text-emerald-700">
                             <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                            <p className="font-medium text-sm truncate max-w-[200px]">{image.name}</p>
                            <p className="text-xs opacity-70 mt-1">Click to change</p>
                        </div>
                        ) : (
                        <div className="text-slate-500">
                            <Upload className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                            <p className="font-medium text-sm">Upload Image</p>
                            <p className="text-xs opacity-70 mt-1">Drag & drop or click</p>
                        </div>
                        )}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="lg:w-2/3 space-y-5">
                       <Input
                           label="Banner Title"
                           value={title}
                           onchangeFunction={(e: any) => setTitle(e.target.value)}
                           placeholder="e.g. Important Announcement"
                       />
                       
                       <div className="space-y-1.5 ml-1">
                            <label className="text-sm font-medium text-slate-700">Content / Description</label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Enter the details..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none h-24"
                            />
                       </div>

                       <div className="pt-2 flex justify-end">
                            <Button 
                                onclickFunction={addBanner}
                                value="Create Banner"
                                loading={loading}
                                className="bg-slate-900 hover:bg-black"
                            >
                                <PlusCircle className="w-4 h-4 mr-2" /> Create Banner
                            </Button>
                       </div>
                  </div>
             </div>
        </div>

        {/* Banners Grid */}
        <div>
             <h3 className="text-lg font-bold text-slate-900 mb-4 px-1">Active Banners</h3>
            <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
            >
            <SortableContext
                items={banners.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
            >
                {banners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map((banner) => (
                    <SortableBannerCard
                        key={banner.id}
                        banner={banner}
                        deleteBanner={deleteBanner}
                        publishBanner={publishBanner}
                    />
                    ))}
                </div>
                ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-500">
                     <LayoutDashboard className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No banners created yet</p>
                    <p className="text-sm">Use the form above to add your first banner.</p>
                </div>
                )}
            </SortableContext>
            </DndContext>
        </div>
    </div>
  );
}
