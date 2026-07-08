"use client";

// Reconocimiento de comida 100% en el dispositivo (sin claves ni servidor).
// Usa MobileNet (ImageNet) y traduce las clases de comida a términos en español
// que luego se calculan con la base nutricional keyless (local + USDA).

import type { MobileNet } from "@tensorflow-models/mobilenet";

interface FoodMatch {
  keywords: string[];
  query: string;
  label: string;
}

// Clases de comida de ImageNet mapeadas a español (comida cotidiana argentina).
const FOOD_MAP: FoodMatch[] = [
  { keywords: ["pizza"], query: "pizza", label: "Pizza" },
  { keywords: ["cheeseburger", "hamburger"], query: "hamburguesa", label: "Hamburguesa" },
  { keywords: ["hotdog", "hot dog"], query: "pancho", label: "Pancho / hot dog" },
  { keywords: ["bagel", "beigel"], query: "pan", label: "Pan" },
  { keywords: ["pretzel"], query: "galletita salada", label: "Galletita salada" },
  { keywords: ["french loaf", "loaf"], query: "pan", label: "Pan" },
  { keywords: ["dough"], query: "masa", label: "Masa" },
  { keywords: ["guacamole"], query: "palta", label: "Palta / guacamole" },
  { keywords: ["burrito"], query: "burrito", label: "Burrito" },
  { keywords: ["taco"], query: "taco", label: "Taco" },
  { keywords: ["carbonara", "spaghetti", "pasta"], query: "fideos", label: "Fideos / pasta" },
  { keywords: ["meat loaf", "meatloaf"], query: "pastel de carne", label: "Pastel de carne" },
  { keywords: ["mashed potato"], query: "puré de papa", label: "Puré de papa" },
  { keywords: ["potpie", "pot pie"], query: "empanada", label: "Empanada / tarta" },
  { keywords: ["hot pot", "hotpot"], query: "guiso", label: "Guiso" },
  { keywords: ["consomme", "soup", "broth"], query: "sopa", label: "Sopa" },
  { keywords: ["ice cream", "icecream", "ice lolly", "popsicle"], query: "helado", label: "Helado" },
  { keywords: ["trifle"], query: "postre", label: "Postre" },
  { keywords: ["chocolate sauce", "chocolate"], query: "chocolate", label: "Chocolate" },
  { keywords: ["custard"], query: "flan", label: "Flan / postre" },
  { keywords: ["banana"], query: "banana", label: "Banana" },
  { keywords: ["orange"], query: "naranja", label: "Naranja" },
  { keywords: ["lemon"], query: "limón", label: "Limón" },
  { keywords: ["pineapple", "ananas"], query: "ananá", label: "Ananá" },
  { keywords: ["strawberry"], query: "frutilla", label: "Frutilla" },
  { keywords: ["granny smith", "apple"], query: "manzana", label: "Manzana" },
  { keywords: ["pomegranate"], query: "granada", label: "Granada" },
  { keywords: ["fig"], query: "higo", label: "Higo" },
  { keywords: ["corn", "ear"], query: "choclo", label: "Choclo" },
  { keywords: ["broccoli"], query: "brócoli", label: "Brócoli" },
  { keywords: ["cauliflower"], query: "coliflor", label: "Coliflor" },
  { keywords: ["cucumber", "cuke"], query: "pepino", label: "Pepino" },
  { keywords: ["mushroom"], query: "champiñones", label: "Champiñones" },
  { keywords: ["bell pepper"], query: "morrón", label: "Morrón / pimiento" },
  { keywords: ["zucchini", "courgette"], query: "zapallito", label: "Zapallito" },
  { keywords: ["butternut squash", "acorn squash", "squash"], query: "zapallo", label: "Zapallo" },
  { keywords: ["artichoke"], query: "alcaucil", label: "Alcaucil" },
  { keywords: ["cabbage"], query: "repollo", label: "Repollo" },
  { keywords: ["espresso", "coffee", "cup", "coffee mug"], query: "café", label: "Café" },
  { keywords: ["eggnog", "milk"], query: "leche", label: "Bebida con leche" },
  { keywords: ["red wine", "wine"], query: "vino", label: "Vino" },
  { keywords: ["beer", "beer glass", "beer bottle"], query: "cerveza", label: "Cerveza" },
  { keywords: ["water bottle", "pop bottle", "soda"], query: "gaseosa", label: "Bebida" },
];

let modelPromise: Promise<MobileNet> | null = null;

async function loadModel(): Promise<MobileNet> {
  if (!modelPromise) {
    modelPromise = (async () => {
      const tf = await import("@tensorflow/tfjs");
      await tf.ready();
      const mobilenet = await import("@tensorflow-models/mobilenet");
      return mobilenet.load({ version: 2, alpha: 1.0 });
    })();
  }
  return modelPromise;
}

function matchFood(className: string): FoodMatch | null {
  const lower = className.toLowerCase();
  for (const food of FOOD_MAP) {
    if (food.keywords.some((kw) => lower.includes(kw))) return food;
  }
  return null;
}

export interface OnDeviceResult {
  label: string;
  query: string;
  confidence: number;
  items: string[];
}

export async function classifyFoodImage(imageDataUrl: string): Promise<OnDeviceResult | null> {
  const model = await loadModel();

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Imagen inválida"));
    image.src = imageDataUrl;
  });

  const predictions = await model.classify(img, 5);
  if (!predictions.length) return null;

  const matched: { food: FoodMatch; probability: number }[] = [];
  for (const pred of predictions) {
    const parts = pred.className.split(",").map((s) => s.trim());
    for (const part of parts) {
      const food = matchFood(part);
      if (food && !matched.some((m) => m.food.query === food.query)) {
        matched.push({ food, probability: pred.probability });
        break;
      }
    }
  }

  if (matched.length === 0) return null;

  const primary = matched[0];
  return {
    label: primary.food.label,
    query: matched.map((m) => m.food.query).slice(0, 3).join(" con "),
    confidence: primary.probability,
    items: matched.map((m) => m.food.label).slice(0, 3),
  };
}
