import { useRef, useState } from 'react';
import { Camera, ImagePlus, X } from 'lucide-react';
import { compressImage } from '@/utils/storage';

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export default function PhotoUploader({ photos, onChange, maxPhotos = 5 }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setCompressing(true);
    try {
      const newPhotos: string[] = [];
      const remaining = maxPhotos - photos.length;
      const filesToProcess = Array.from(files).slice(0, remaining);

      for (const file of filesToProcess) {
        const base64 = await compressImage(file);
        newPhotos.push(base64);
      }

      if (newPhotos.length > 0) {
        onChange([...photos, ...newPhotos]);
      }
    } catch (err) {
      console.error('Photo processing failed:', err);
    } finally {
      setCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  const canAdd = photos.length < maxPhotos;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative flex-shrink-0 group">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-cream-200">
                <img
                  src={photo}
                  alt={`标签照片 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {canAdd && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={compressing}
              className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-cream-300 hover:border-lavender-300 bg-cream-50 hover:bg-lavender-50 transition-colors flex flex-col items-center justify-center gap-1 disabled:opacity-50"
            >
              {compressing ? (
                <div className="w-5 h-5 border-2 border-lavender-300 border-t-lavender-500 rounded-full animate-spin" />
              ) : (
                <>
                  <Camera className="w-5 h-5 text-cream-400" />
                  <span className="text-xs text-cream-400">拍照</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {canAdd && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={compressing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-sm font-medium bg-cream-100 text-charcoal-300 hover:bg-cream-200 transition-colors disabled:opacity-50"
          >
            <ImagePlus className="w-4 h-4" />
            从相册选择
          </button>
        </div>
      )}

      <p className="text-xs text-charcoal-200">
        最多上传 {maxPhotos} 张，支持拍照或从相册选择
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
