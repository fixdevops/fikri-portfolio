import React, { useState, useRef, useCallback } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Check, X, RotateCcw } from "lucide-react";

/**
 * ImageCropper — modal crop gambar sebelum upload
 * Props:
 *   imageSrc   : string  — object URL dari file yang dipilih
 *   aspect     : number  — rasio crop, default 1 (persegi/lingkaran)
 *   circularCrop: boolean — tampilkan preview bulat, default true
 *   onCrop     : (blob: Blob) => void — callback hasil crop
 *   onCancel   : () => void
 */
export default function ImageCropper({
  imageSrc,
  aspect = 1,
  circularCrop = true,
  onCrop,
  onCancel,
}) {
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);

  const onImageLoad = useCallback((e) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    const initial = centerCrop(
      makeAspectCrop({ unit: "%", width: 80 }, aspect, w, h),
      w, h
    );
    setCrop(initial);
  }, [aspect]);

  const handleConfirm = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const size = 300; // output size px
    canvas.width  = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");

    // jika circularCrop, clip dengan lingkaran
    if (circularCrop) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width  * scaleX,
      completedCrop.height * scaleY,
      0, 0, size, size
    );

    canvas.toBlob((blob) => {
      if (blob) onCrop(blob);
    }, "image/png", 0.95);
  }, [completedCrop, circularCrop, onCrop]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-900">Crop Gambar</p>
            <p className="text-xs text-gray-400 mt-0.5">Drag untuk memilih area, pinch untuk zoom</p>
          </div>
          <button onClick={onCancel}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <X size={15} />
          </button>
        </div>

        {/* crop area */}
        <div className="flex items-center justify-center bg-gray-50 p-4 overflow-auto max-h-[55vh]">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            circularCrop={circularCrop}
            minWidth={50}
            minHeight={50}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="crop"
              onLoad={onImageLoad}
              style={{ maxWidth: "100%", maxHeight: "50vh", display: "block" }}
            />
          </ReactCrop>
        </div>

        {/* footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5">
            <RotateCcw size={14} /> Ulang
          </button>
          <button onClick={handleConfirm}
            className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 flex items-center justify-center gap-1.5">
            <Check size={14} /> Pakai Ini
          </button>
        </div>
      </div>
    </div>
  );
}
