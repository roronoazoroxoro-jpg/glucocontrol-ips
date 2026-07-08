"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  Camera,
  ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import type { NutritionAnalysis } from "@/lib/nutrition";

interface FoodPhotoResult {
  name: string;
  items: string[];
  nutrition: NutritionAnalysis;
  glucoseNote: string;
  healthTip: string;
}

interface FoodPhotoAnalyzerProps {
  mealType: string;
  onLogged: () => void;
}

async function compressImage(file: File, maxSize = 1024, quality = 0.7): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Imagen inválida"));
    image.src = dataUrl;
  });

  let { width, height } = img;
  if (width > height && width > maxSize) {
    height = Math.round((height * maxSize) / width);
    width = maxSize;
  } else if (height > maxSize) {
    width = Math.round((width * maxSize) / height);
    height = maxSize;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

export function FoodPhotoAnalyzer({ mealType, onLogged }: FoodPhotoAnalyzerProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FoodPhotoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function reset() {
    setPreview(null);
    setResult(null);
    setError(null);
    setSaved(false);
    if (cameraRef.current) cameraRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    setSaved(false);
    setAnalyzing(true);

    try {
      const compressed = await compressImage(file);
      setPreview(compressed);

      const res = await fetch("/api/nutrition/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: compressed }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "No se pudo analizar la foto.");
        return;
      }
      setResult(data.result as FoodPhotoResult);
    } catch {
      setError("No se pudo procesar la imagen. Intentá de nuevo.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function saveMeal() {
    if (!result) return;
    setSaving(true);
    try {
      await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.name,
          type: mealType,
          skipAnalysis: true,
          nutrition: result.nutrition,
        }),
      });
      setSaved(true);
      onLogged();
      setTimeout(reset, 1200);
    } finally {
      setSaving(false);
    }
  }

  const n = result?.nutrition;

  return (
    <div className="space-y-4">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {!preview && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 py-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-medium shadow-md touch-manipulation"
          >
            <Camera className="w-7 h-7" />
            <span className="text-sm">Sacar foto</span>
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 py-6 rounded-2xl bg-white border border-slate-200 text-slate-700 font-medium touch-manipulation"
          >
            <ImageIcon className="w-7 h-7 text-emerald-600" />
            <span className="text-sm">Elegir foto</span>
          </button>
        </div>
      )}

      {!preview && (
        <p className="text-xs text-slate-400 text-center leading-relaxed">
          Sacá una foto de tu plato y la IA detecta los alimentos y calcula los nutrientes.
        </p>
      )}

      {preview && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200">
          <Image
            src={preview}
            alt="Foto de la comida"
            width={480}
            height={320}
            className="w-full h-48 object-cover"
            unoptimized
          />
          {analyzing && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 text-white">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-medium">Analizando tu plato...</span>
            </div>
          )}
          {!analyzing && (
            <button
              type="button"
              onClick={reset}
              className="absolute top-2 right-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/90 text-slate-700 text-xs font-medium shadow touch-manipulation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Otra foto
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-2">
          <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 leading-relaxed">{error}</p>
        </div>
      )}

      {result && n && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-800">{result.name}</span>
          </div>

          {result.items.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {result.items.map((item, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-white text-emerald-700 text-xs border border-emerald-200"
                >
                  {item}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-emerald-700">Porción estimada: {n.servingSize}</p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <PhotoBadge label="Calorías" value={`${n.calories} kcal`} />
            <PhotoBadge label="Carbohidratos" value={`${n.carbs}g`} />
            <PhotoBadge label="Azúcares" value={`${n.sugar}g`} />
            <PhotoBadge label="Grasas" value={`${n.fat}g`} />
            <PhotoBadge label="Proteínas" value={`${n.protein}g`} />
            <PhotoBadge label="Fibra" value={`${n.fiber}g`} />
          </div>

          {result.glucoseNote && (
            <div className="rounded-lg bg-white p-3">
              <p className="text-[11px] font-semibold text-slate-500 mb-0.5">Impacto en la glucosa</p>
              <p className="text-xs text-slate-700 leading-relaxed">{result.glucoseNote}</p>
            </div>
          )}
          {result.healthTip && (
            <div className="rounded-lg bg-white p-3">
              <p className="text-[11px] font-semibold text-slate-500 mb-0.5">Consejo</p>
              <p className="text-xs text-slate-700 leading-relaxed">{result.healthTip}</p>
            </div>
          )}

          <p className="text-[10px] text-emerald-600/70">
            Estimación por IA a partir de la foto. Puede variar según la porción real.
          </p>

          <button
            type="button"
            onClick={saveMeal}
            disabled={saving || saved}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium disabled:opacity-60 touch-manipulation"
          >
            {saved ? "Guardado ✓" : saving ? "Guardando..." : "Registrar esta comida"}
          </button>
        </div>
      )}
    </div>
  );
}

function PhotoBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg px-2 py-1.5">
      <p className="text-slate-400">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  );
}
