import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../apis";
import { Trash2, PlusCircle, Eye, Move } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
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
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: banner.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white bg-opacity-80 backdrop-blur-lg shadow-xl rounded-2xl flex flex-col overflow-hidden hover:shadow-2xl transition-shadow relative"
    >
      {/* Drag handle */}
      <div {...attributes} {...listeners} className="absolute top-2 left-2 p-2 cursor-grab">
        <Move className="w-5 h-5 text-gray-500" />
      </div>

      {/* Banner image */}
      <img src={banner.imageUrl} alt="banner" className="h-48 w-full object-cover rounded-t-2xl" />

      {/* Banner text */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{banner.title}</h3>
        <p className="text-cdgray-700 line-clamp-3">{banner.text}</p>
      </div>

      {/* Actions */}
      <div className="p-4 flex flex-wrap gap-2 justify-center border-t border-gray-200 bg-white bg-opacity-50 backdrop-blur-sm">
        {/* <button
          onClick={() => publishBanner(banner.id, !banner.isPublished)}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            banner.isPublished ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-blue-600 text-white hover:bg-blue-500"
          }`}
        >
          <ToggleLeft className="w-4 h-4" />
          {banner.isPublished ? "Deactivate" : "Activate"}
        </button> */}

        <button
          onClick={() => publishBanner(banner.id, !banner.isPublished)}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            banner.isPublished ? "bg-green-600 text-white hover:bg-green-500" : "bg-gray-400 text-white hover:bg-gray-500"
          }`}
        >
          <Eye className="w-4 h-4" />
          {banner.isPublished ? "Unpublish" : "Publish"}
        </button>

        <button
          onClick={() => deleteBanner(banner.id)}
          className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" /> Delete
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

  useEffect(() => { fetchBanners(); }, []);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
    const data = await res.json();
    return data.secure_url;
  };

  const addBanner = async () => {
    if (!text || !image) return alert("Text and Image required");
    try {
      const imageUrl = await uploadToCloudinary(image);
      const res = await fetch(`${BASE_URL}/admin/banners`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${JSON.parse(token!)}` },
        body: JSON.stringify({ title: text, text, imageUrl }),
      });
      const data = await res.json();
      if (data.success) { setText(""); setImage(null); fetchBanners(); } 
      else alert("Failed to add banner");
    } catch (err) { console.error(err); alert("Error uploading image or adding banner"); }
  };


  const deleteBanner = async (id: string) => {
    await fetch(`${BASE_URL}/admin/banners/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${JSON.parse(token!)}` } });
    fetchBanners();
  };

  const publishBanner = async (id: string, publish: boolean) => {
    await fetch(`${BASE_URL}/admin/banners/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${JSON.parse(token!)}` },
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: (files:any) => setImage(files[0]), accept: { "image/*": [] } });

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold flex items-center gap-2"><PlusCircle className="w-8 h-8 text-black"/> Banner Manager</h1>
          <button onClick={() => navigate("/admin")} className="px-4 py-2 border border-black rounded-lg hover:bg-gray-100 transition-colors">← Back</button>
        </div>

        {/* Add Banner */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm shadow-2xl rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center">
          <input type="text" placeholder="Banner text" value={text} onChange={e=>setText(e.target.value)} className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-black"/>
          <div {...getRootProps()} className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${isDragActive?"border-black bg-gray-100":"border-gray-300"}`}>
            <input {...getInputProps()} />
            {image ? <p>{image.name}</p> : <p>Drag & drop image here or click to select</p>}
          </div>
          <button onClick={addBanner} className="flex items-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors">
            <PlusCircle className="w-5 h-5" /> Add Banner
          </button>
        </div>

        {/* Banner Cards */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={banners.map(b=>b.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map(banner => <SortableBannerCard key={banner.id} banner={banner}  deleteBanner={deleteBanner} publishBanner={publishBanner}/>)}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
