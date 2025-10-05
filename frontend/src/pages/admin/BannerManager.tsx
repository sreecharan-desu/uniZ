import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../apis";
import {
  Trash2,
  PlusCircle,
  Eye,
  Move,
  Image as ImageIcon,
  LayoutDashboard,
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
      className="group relative bg-white/70 backdrop-blur-md border border-gray-200/50 shadow-lg hover:shadow-2xl rounded-3xl overflow-hidden transition-all"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-3 left-3 bg-white/80 p-2 rounded-full cursor-grab shadow-sm"
      >
        <Move className="w-5 h-5 text-gray-600" />
      </div>

      {/* Banner Image */}
      <div className="relative">
        <img
          src={banner.imageUrl}
          alt="banner"
          className="h-52 w-full object-cover rounded-t-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent rounded-t-3xl"></div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {banner.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3">{banner.text}</p>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center px-5 py-4 border-t border-gray-200/60 bg-white/50 backdrop-blur-sm">
        <button
          onClick={() => publishBanner(banner.id, !banner.isPublished)}
          className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-xl transition ${
            banner.isPublished
              ? "bg-green-600 text-white hover:bg-green-500"
              : "bg-gray-500 text-white hover:bg-gray-400"
          }`}
        >
          <Eye className="w-4 h-4" />
          {banner.isPublished ? "Unpublish" : "Publish"}
        </button>

        <button
          onClick={() => deleteBanner(banner.id)}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}

export default function BannerManager() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);

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
    if (!text || !image) return alert("Text and Image required");
    try {
      const imageUrl = await uploadToCloudinary(image);
      const res = await fetch(`${BASE_URL}/admin/banners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(token!)}`,
        },
        body: JSON.stringify({ title: text, text, imageUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setText("");
        setImage(null);
        fetchBanners();
      } else alert("Failed to add banner");
    } catch (err) {
      console.error(err);
      alert("Error uploading image or adding banner");
    }
  };

  const deleteBanner = async (id: string) => {
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
  });

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-black" />
            Banner Manager
          </h1>
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2 border border-black rounded-lg hover:bg-gray-100 transition"
          >
            ← Back
          </button>
        </div>

        {/* Add Banner */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/70 shadow-xl rounded-3xl p-8 flex flex-col md:flex-row items-center gap-5 transition-all hover:shadow-2xl">
          <input
            type="text"
            placeholder="Banner text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 outline-none text-gray-900"
          />

          <div
            {...getRootProps()}
            className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
              isDragActive
                ? "border-black bg-gray-100"
                : "border-gray-300 hover:border-black/50"
            }`}
          >
            <input {...getInputProps()} />
            {image ? (
              <p className="text-gray-800 font-medium">{image.name}</p>
            ) : (
              <p className="text-gray-500 flex flex-col items-center justify-center gap-1">
                <ImageIcon className="w-6 h-6 text-gray-400" />
                Drag & drop image or click to upload
              </p>
            )}
          </div>

          <button
            onClick={addBanner}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Add Banner
          </button>
        </div>

        {/* Banner List */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <div className="text-center text-gray-500 py-20 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-inner">
                <p className="text-lg font-medium">No banners added yet</p>
              </div>
            )}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
