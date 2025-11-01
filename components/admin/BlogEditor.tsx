"use client";

import { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  FiEdit,
  FiTrash,
  FiX,
  FiPlus,
  FiType,
  FiImage,
  FiSave,
  FiLoader,
} from "react-icons/fi";
import { FaHeading } from "react-icons/fa";
import { LuHeading2 } from "react-icons/lu";

type ContentType = "heading" | "subheading" | "text" | "image";

export interface ContentBlock {
  id: string;
  type: ContentType;
  content: string; // text, or image src (blob URL for now)
  description?: string; // image caption / alt
}

export default function BlogEditor({
  content,
  setContent,
}: {
  content: ContentBlock[];
  setContent: React.Dispatch<React.SetStateAction<ContentBlock[]>>;
}) {
  // modal + form state
  const [showPopup, setShowPopup] = useState(false);
  const [currentType, setCurrentType] = useState<ContentType | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // ui state
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // file input + blob URL housekeeping
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const createdBlobUrlsRef = useRef<Set<string>>(new Set());

  // ----- Helpers -----
  const openTypePicker = (type: ContentType) => {
    setCurrentType(type);
    setShowPopup(true);
    setInputValue("");
    setImageDescription("");
    setEditingId(null);
  };

  const resetPopup = () => {
    setShowPopup(false);
    setCurrentType(null);
    setInputValue("");
    setImageDescription("");
    setEditingId(null);
    setSaving(false);
    setImageLoading(false);
  };

  // Local image select (no upload). Creates a blob URL for preview.
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageLoading(true);
    const file = e.target.files?.[0];
    if (!file) {
      setImageLoading(false);
      return;
    }

    // revoke previous preview if it was a blob
    if (inputValue.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(inputValue);
      } catch {}
    }

    const url = URL.createObjectURL(file);
    createdBlobUrlsRef.current.add(url);
    setInputValue(url);
    setImageLoading(false);
  };

  const handleSubmitBlock = async () => {
    if (!currentType || !inputValue.trim()) return;
    setSaving(true);

    const newBlock: ContentBlock = {
      id: editingId || uuidv4(),
      type: currentType,
      content: inputValue.trim(),
      ...(currentType === "image" && { description: imageDescription.trim() }),
    };

    // simulate tiny delay for button spinner
    setTimeout(() => {
      setContent((prev) =>
        editingId
          ? prev.map((b) => (b.id === editingId ? newBlock : b))
          : [...prev, newBlock]
      );
      resetPopup();
    }, 200);
  };

  const handleEdit = (block: ContentBlock) => {
    setCurrentType(block.type);
    setShowPopup(true);
    setInputValue(block.content);
    if (block.type === "image") setImageDescription(block.description ?? "");
    setEditingId(block.id);
  };

  const handleDelete = (id: string) => {
    setContent((prev) => {
      const toDelete = prev.find((b) => b.id === id);
      // revoke blob URL if we created it
      if (toDelete?.type === "image" && toDelete.content.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(toDelete.content);
          createdBlobUrlsRef.current.delete(toDelete.content);
        } catch {}
      }
      return prev.filter((b) => b.id !== id);
    });
  };

  // cleanup any stray blob URLs on unmount
  useEffect(() => {
    return () => {
      createdBlobUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
      createdBlobUrlsRef.current.clear();
    };
  }, []);

  return (
    <div className="max-w-7xl flex flex-col mx-auto p-4">
      {/* Add Content button */}
      <button
        type="button"
        onClick={() => setShowPopup(true)}
        className="bg-[#263E4D] text-white w-full sm:w-[60%] mx-auto px-6 py-3 rounded-lg hover:bg-[#1a2834] transition-all duration-300 
        flex items-center justify-center gap-2 cursor-pointer shadow-lg text-lg sm:text-xl hover:shadow-xl mb-8 font-poppins"
      >
        <FiPlus className="text-lg" />
        Add Content
      </button>

      {/* Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 sm:p-8 rounded-xl w-[92vw] max-w-xl mx-4 shadow-2xl">
            {!currentType ? (
              <div className="space-y-4">
                <p className="font-poppins text-gray-700 mb-2">
                  Choose a block type:
                </p>
                <button
                  type="button"
                  onClick={() => openTypePicker("heading")}
                  className="w-full bg-gray-100 p-4 rounded-xl hover:bg-gray-200 transition-colors
                  flex items-center gap-3 cursor-pointer text-gray-800 hover:text-gray-900"
                >
                  <FaHeading className="text-xl" />
                  <span className="text-lg font-poppins">Heading</span>
                </button>
                <button
                  type="button"
                  onClick={() => openTypePicker("subheading")}
                  className="w-full bg-gray-100 p-4 rounded-xl hover:bg-gray-200 transition-colors
                  flex items-center gap-3 cursor-pointer text-gray-800 hover:text-gray-900"
                >
                  <LuHeading2 className="text-xl" />
                  <span className="text-lg font-poppins">Subheading</span>
                </button>
                <button
                  type="button"
                  onClick={() => openTypePicker("text")}
                  className="w-full bg-gray-100 p-4 rounded-xl hover:bg-gray-200 transition-colors
                  flex items-center gap-3 cursor-pointer text-gray-800 hover:text-gray-900"
                >
                  <FiType className="text-xl" />
                  <span className="text-lg font-poppins">Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => openTypePicker("image")}
                  className="w-full bg-gray-100 p-4 rounded-xl hover:bg-gray-200 transition-colors
                  flex items-center gap-3 cursor-pointer text-gray-800 hover:text-gray-900"
                >
                  <FiImage className="text-xl" />
                  <span className="text-lg font-poppins">Image</span>
                </button>

                <button
                  type="button"
                  onClick={resetPopup}
                  className="w-full bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 transition-colors
                  flex items-center justify-center gap-2 cursor-pointer mt-2 font-poppins"
                >
                  <FiX className="text-lg" />
                  Cancel
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Inputs by type */}
                {currentType === "image" ? (
                  <>
                    <div
                      className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center
                      hover:border-gray-300 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imageLoading ? (
                        <FiLoader className="animate-spin text-3xl mx-auto text-gray-500" />
                      ) : inputValue ? (
                        <img
                          src={inputValue}
                          alt="Preview"
                          className="max-h-60 w-auto mx-auto mb-4 rounded-lg"
                        />
                      ) : (
                        <div className="space-y-2">
                          <FiImage className="text-3xl mx-auto text-gray-400" />
                          <p className="text-gray-500 font-poppins">
                            Click to choose image
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />

                    {inputValue && (
                      <input
                        type="text"
                        placeholder="Image description (alt/caption)"
                        value={imageDescription}
                        onChange={(e) => setImageDescription(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-gray-400
                        focus:ring-0 transition-colors placeholder-gray-400 font-poppins"
                      />
                    )}
                  </>
                ) : currentType === "text" ? (
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-gray-400
                    focus:ring-0 transition-colors placeholder-gray-400 h-40 resize-none font-poppins"
                    placeholder="Enter your text..."
                  />
                ) : (
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-gray-400
                    focus:ring-0 transition-colors placeholder-gray-400 font-poppins"
                    placeholder={`Enter ${currentType}`}
                  />
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleSubmitBlock}
                    className="flex-1 bg-[#263E4D] text-white p-3 rounded-xl hover:bg-[#1a2834]
                    transition-colors flex items-center justify-center gap-2 cursor-pointer font-poppins"
                  >
                    {saving ? (
                      <FiLoader className="animate-spin text-lg" />
                    ) : (
                      <>
                        <FiSave className="text-lg" />
                        <span className="text-base">
                          {editingId ? "Update Block" : "Add Block"}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentType(null);
                      setInputValue("");
                      setImageDescription("");
                    }}
                    className="flex-1 bg-red-600 text-white p-3 rounded-xl hover:bg-red-700
                    transition-colors flex items-center justify-center gap-2 cursor-pointer font-poppins"
                  >
                    <FiX className="text-lg" />
                    <span className="text-base">Cancel</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Render blocks */}
      <div className="space-y-8">
        {content.map((item) => (
          <div
            key={item.id}
            className="group relative border-2 border-gray-100 rounded-xl p-6 hover:border-gray-200 transition-colors"
          >
            {/* Inline actions on hover */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button
                type="button"
                onClick={() => handleEdit(item)}
                className="bg-[#263E4D] text-white p-2.5 rounded-lg hover:bg-[#1a2834] transition-colors cursor-pointer flex items-center gap-2"
                aria-label="Edit block"
                title="Edit"
              >
                <FiEdit className="text-lg" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="bg-red-600 text-white p-2.5 rounded-lg hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-2"
                aria-label="Delete block"
                title="Delete"
              >
                <FiTrash className="text-lg" />
              </button>
            </div>

            {/* Block content */}
            {item.type === "heading" && (
              <h1 className="font-playfair text-3xl sm:text-4xl text-gray-900">
                {item.content}
              </h1>
            )}

            {item.type === "subheading" && (
              <h2 className="font-playfair text-2xl sm:text-3xl text-gray-800">
                {item.content}
              </h2>
            )}

            {item.type === "text" && (
              <p className="font-poppins text-[1.05rem] text-gray-700 leading-relaxed">
                {item.content}
              </p>
            )}

            {item.type === "image" && (
              <div className="space-y-3">
                <img
                  src={item.content}
                  alt={item.description || ""}
                  className="rounded-xl w-full h-auto object-cover"
                />
                {item.description && (
                  <p className="font-poppins text-sm text-gray-500 italic">
                    {item.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
