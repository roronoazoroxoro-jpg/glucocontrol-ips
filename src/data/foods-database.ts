export interface FoodEntry {
  keywords: string[];
  serving: string;
  calories: number;
  carbs: number;
  sugar: number;
  fat: number;
  saturatedFat: number;
  protein: number;
  fiber: number;
  sodium: number;
  /** English terms for USDA lookup */
  usdaQuery?: string;
}

export const FOODS_DATABASE: FoodEntry[] = [
  // Desayunos
  { keywords: ["avena", "oatmeal", "porridge"], serving: "1 taza", calories: 150, carbs: 27, sugar: 1, fat: 3, saturatedFat: 0.5, protein: 5, fiber: 4, sodium: 2, usdaQuery: "oatmeal cooked" },
  { keywords: ["avena con frutas", "avena frutas"], serving: "1 bowl", calories: 220, carbs: 40, sugar: 18, fat: 4, saturatedFat: 1, protein: 7, fiber: 5, sodium: 5 },
  { keywords: ["tostadas", "tostada"], serving: "2 rebanadas", calories: 160, carbs: 30, sugar: 3, fat: 2, saturatedFat: 0.5, protein: 5, fiber: 2, sodium: 280, usdaQuery: "toast white bread" },
  { keywords: ["tostadas con mermelada", "mermelada"], serving: "2 tostadas", calories: 200, carbs: 38, sugar: 15, fat: 3, saturatedFat: 0.5, protein: 5, fiber: 2, sodium: 250 },
  { keywords: ["medialuna", "medialunas"], serving: "1 unidad", calories: 180, carbs: 22, sugar: 8, fat: 9, saturatedFat: 3, protein: 4, fiber: 1, sodium: 180 },
  { keywords: ["facturas", "factura"], serving: "1 unidad", calories: 250, carbs: 30, sugar: 12, fat: 12, saturatedFat: 4, protein: 5, fiber: 1, sodium: 200 },
  { keywords: ["cafe con leche", "café con leche"], serving: "1 taza", calories: 80, carbs: 8, sugar: 7, fat: 3, saturatedFat: 2, protein: 4, fiber: 0, sodium: 60 },
  { keywords: ["cafe", "café", "espresso"], serving: "1 taza", calories: 5, carbs: 1, sugar: 0, fat: 0, saturatedFat: 0, protein: 0, fiber: 0, sodium: 5, usdaQuery: "black coffee" },
  { keywords: ["te", "té", "infusion", "manzanilla"], serving: "1 taza", calories: 2, carbs: 0, sugar: 0, fat: 0, saturatedFat: 0, protein: 0, fiber: 0, sodium: 5 },
  { keywords: ["mate"], serving: "1 mate", calories: 5, carbs: 1, sugar: 0, fat: 0, saturatedFat: 0, protein: 0, fiber: 0, sodium: 5 },
  { keywords: ["terere", "tereré"], serving: "1 vaso", calories: 5, carbs: 1, sugar: 0, fat: 0, saturatedFat: 0, protein: 0, fiber: 0, sodium: 5 },
  { keywords: ["yogur", "yogurt", "yogur griego"], serving: "1 pote 170g", calories: 100, carbs: 15, sugar: 12, fat: 2, saturatedFat: 1, protein: 6, fiber: 0, sodium: 60, usdaQuery: "plain yogurt" },
  { keywords: ["leche", "vaso de leche"], serving: "250ml", calories: 120, carbs: 12, sugar: 12, fat: 5, saturatedFat: 3, protein: 8, fiber: 0, sodium: 100, usdaQuery: "whole milk" },
  { keywords: ["huevos revueltos", "huevo revuelto"], serving: "2 huevos", calories: 180, carbs: 2, sugar: 1, fat: 14, saturatedFat: 4, protein: 12, fiber: 0, sodium: 200, usdaQuery: "scrambled eggs" },
  { keywords: ["huevo", "huevos", "huevo frito"], serving: "2 unidades", calories: 140, carbs: 1, sugar: 0.5, fat: 10, saturatedFat: 3, protein: 12, fiber: 0, sodium: 140, usdaQuery: "fried egg" },
  { keywords: ["pan casero", "pan blanco", "pan lactal"], serving: "2 rebanadas", calories: 140, carbs: 26, sugar: 3, fat: 2, saturatedFat: 0.5, protein: 4, fiber: 1, sodium: 240, usdaQuery: "white bread" },
  { keywords: ["pan integral"], serving: "2 rebanadas", calories: 130, carbs: 22, sugar: 3, fat: 2, saturatedFat: 0.3, protein: 6, fiber: 4, sodium: 220, usdaQuery: "whole wheat bread" },

  // Carnes y proteínas
  { keywords: ["pollo", "pechuga de pollo", "pechuga"], serving: "150g", calories: 165, carbs: 0, sugar: 0, fat: 3.6, saturatedFat: 1, protein: 31, fiber: 0, sodium: 74, usdaQuery: "chicken breast grilled" },
  { keywords: ["pollo a la plancha", "pollo plancha"], serving: "150g", calories: 170, carbs: 0, sugar: 0, fat: 4, saturatedFat: 1, protein: 32, fiber: 0, sodium: 80 },
  { keywords: ["milanesa de pollo", "milanesa pollo"], serving: "1 unidad", calories: 320, carbs: 18, sugar: 1, fat: 18, saturatedFat: 4, protein: 24, fiber: 1, sodium: 480 },
  { keywords: ["milanesa de carne", "milanesa", "milanesa napolitana"], serving: "1 unidad", calories: 380, carbs: 22, sugar: 2, fat: 24, saturatedFat: 6, protein: 24, fiber: 1, sodium: 550 },
  { keywords: ["carne", "bife", "bife de chorizo"], serving: "150g", calories: 250, carbs: 0, sugar: 0, fat: 15, saturatedFat: 6, protein: 26, fiber: 0, sodium: 72, usdaQuery: "beef steak grilled" },
  { keywords: ["asado", "parrillada", "costilla"], serving: "200g", calories: 450, carbs: 0, sugar: 0, fat: 32, saturatedFat: 12, protein: 38, fiber: 0, sodium: 120, usdaQuery: "beef ribs grilled" },
  { keywords: ["chorizo", "morcilla", "salchicha"], serving: "1 unidad", calories: 280, carbs: 2, sugar: 1, fat: 24, saturatedFat: 8, protein: 12, fiber: 0, sodium: 680, usdaQuery: "pork sausage" },
  { keywords: ["hamburguesa", "hamburguesa completa"], serving: "1 unidad", calories: 450, carbs: 35, sugar: 6, fat: 25, saturatedFat: 8, protein: 22, fiber: 2, sodium: 700, usdaQuery: "cheeseburger" },
  { keywords: ["pescado", "merluza", "filet de merluza"], serving: "150g", calories: 120, carbs: 0, sugar: 0, fat: 2, saturatedFat: 0.5, protein: 24, fiber: 0, sodium: 90, usdaQuery: "hake fish baked" },
  { keywords: ["salmon", "salmón"], serving: "150g", calories: 280, carbs: 0, sugar: 0, fat: 18, saturatedFat: 3, protein: 28, fiber: 0, sodium: 80, usdaQuery: "salmon baked" },
  { keywords: ["atun", "atún", "lata atun"], serving: "1 lata", calories: 120, carbs: 0, sugar: 0, fat: 1, saturatedFat: 0.3, protein: 26, fiber: 0, sodium: 350, usdaQuery: "canned tuna" },

  // Platos típicos Argentina/Misiones
  { keywords: ["empanada", "empanadas"], serving: "1 unidad", calories: 160, carbs: 15, sugar: 1, fat: 9, saturatedFat: 3, protein: 5, fiber: 1, sodium: 225 },
  { keywords: ["empanada de carne"], serving: "2 unidades", calories: 340, carbs: 30, sugar: 2, fat: 18, saturatedFat: 6, protein: 12, fiber: 2, sodium: 480 },
  { keywords: ["locro"], serving: "1 plato", calories: 320, carbs: 35, sugar: 5, fat: 12, saturatedFat: 4, protein: 18, fiber: 6, sodium: 800 },
  { keywords: ["guiso", "guiso de carne", "estofado"], serving: "1 plato", calories: 300, carbs: 28, sugar: 4, fat: 14, saturatedFat: 5, protein: 20, fiber: 4, sodium: 750 },
  { keywords: ["tallarines", "tallarin", "tallarines con salsa"], serving: "1 plato", calories: 350, carbs: 52, sugar: 4, fat: 10, saturatedFat: 2, protein: 12, fiber: 3, sodium: 600 },
  { keywords: ["noquis", "ñoquis", "gnocchi"], serving: "1 plato", calories: 280, carbs: 48, sugar: 2, fat: 6, saturatedFat: 1, protein: 8, fiber: 2, sodium: 400 },
  { keywords: ["ravioles", "ravioles con salsa"], serving: "1 plato", calories: 380, carbs: 50, sugar: 4, fat: 12, saturatedFat: 4, protein: 16, fiber: 3, sodium: 650 },
  { keywords: ["sorrentinos"], serving: "1 plato", calories: 400, carbs: 48, sugar: 3, fat: 16, saturatedFat: 6, protein: 18, fiber: 2, sodium: 700 },
  { keywords: ["chipa", "chipá"], serving: "2 unidades", calories: 280, carbs: 32, sugar: 2, fat: 14, saturatedFat: 5, protein: 8, fiber: 1, sodium: 400 },
  { keywords: ["mbeyu", "mbeyú"], serving: "2 unidades", calories: 260, carbs: 30, sugar: 2, fat: 12, saturatedFat: 4, protein: 7, fiber: 2, sodium: 380 },
  { keywords: ["sopa paraguaya", "sopa"], serving: "1 porción", calories: 220, carbs: 18, sugar: 3, fat: 14, saturatedFat: 5, protein: 8, fiber: 2, sodium: 500 },
  { keywords: ["budin", "budín", "budin de pan"], serving: "1 porción", calories: 200, carbs: 32, sugar: 18, fat: 6, saturatedFat: 2, protein: 5, fiber: 1, sodium: 250 },
  { keywords: ["flan", "flan casero"], serving: "1 porción", calories: 180, carbs: 32, sugar: 28, fat: 4, saturatedFat: 2, protein: 5, fiber: 0, sodium: 80 },
  { keywords: ["dulce de leche"], serving: "2 cucharadas", calories: 130, carbs: 22, sugar: 20, fat: 3, saturatedFat: 2, protein: 3, fiber: 0, sodium: 40 },
  { keywords: ["ensalada rusa"], serving: "1 porción", calories: 200, carbs: 18, sugar: 6, fat: 12, saturatedFat: 2, protein: 4, fiber: 2, sodium: 350 },
  { keywords: ["pizza", "pizza muzzarella", "muzzarella"], serving: "2 porciones", calories: 280, carbs: 36, sugar: 4, fat: 10, saturatedFat: 4, protein: 12, fiber: 2, sodium: 600, usdaQuery: "cheese pizza" },
  { keywords: ["fugazzeta", "fugazza"], serving: "2 porciones", calories: 300, carbs: 38, sugar: 3, fat: 12, saturatedFat: 4, protein: 10, fiber: 2, sodium: 550 },

  // Cereales y guarniciones
  { keywords: ["arroz", "arroz blanco"], serving: "1 taza cocida", calories: 205, carbs: 45, sugar: 0, fat: 0.4, saturatedFat: 0.1, protein: 4, fiber: 1, sodium: 2, usdaQuery: "white rice cooked" },
  { keywords: ["arroz integral"], serving: "1 taza cocida", calories: 215, carbs: 45, sugar: 0, fat: 1.8, saturatedFat: 0.3, protein: 5, fiber: 3, sodium: 10, usdaQuery: "brown rice cooked" },
  { keywords: ["arroz con pollo"], serving: "1 plato", calories: 380, carbs: 45, sugar: 2, fat: 10, saturatedFat: 2, protein: 28, fiber: 2, sodium: 400 },
  { keywords: ["pasta", "fideos", "spaghetti", "spaguetti"], serving: "1 plato", calories: 220, carbs: 43, sugar: 2, fat: 1.5, saturatedFat: 0.3, protein: 8, fiber: 2, sodium: 5, usdaQuery: "spaghetti cooked" },
  { keywords: ["papa", "papas", "pure de papa", "puré"], serving: "1 porción", calories: 160, carbs: 37, sugar: 2, fat: 0.2, saturatedFat: 0, protein: 4, fiber: 3, sodium: 10, usdaQuery: "mashed potatoes" },
  { keywords: ["papas fritas", "french fries"], serving: "1 porción mediana", calories: 320, carbs: 42, sugar: 0, fat: 15, saturatedFat: 2, protein: 4, fiber: 4, sodium: 250, usdaQuery: "french fries" },
  { keywords: ["mandioca", "yuca", "mandioca hervida"], serving: "150g", calories: 160, carbs: 38, sugar: 2, fat: 0.3, saturatedFat: 0, protein: 1, fiber: 2, sodium: 14, usdaQuery: "cassava boiled" },
  { keywords: ["batata", "boniato", "camote"], serving: "150g", calories: 130, carbs: 30, sugar: 6, fat: 0.2, saturatedFat: 0, protein: 2, fiber: 4, sodium: 50, usdaQuery: "sweet potato baked" },
  { keywords: ["quinoa"], serving: "1 taza cocida", calories: 220, carbs: 39, sugar: 2, fat: 4, saturatedFat: 0.5, protein: 8, fiber: 5, sodium: 13, usdaQuery: "quinoa cooked" },
  { keywords: ["lentejas", "guiso de lentejas"], serving: "1 plato", calories: 230, carbs: 40, sugar: 4, fat: 1, saturatedFat: 0.2, protein: 18, fiber: 16, sodium: 400, usdaQuery: "lentils cooked" },
  { keywords: ["porotos", "frijoles", "alubias"], serving: "1 plato", calories: 240, carbs: 44, sugar: 2, fat: 1, saturatedFat: 0.2, protein: 16, fiber: 15, sodium: 350, usdaQuery: "black beans cooked" },

  // Verduras y ensaladas
  { keywords: ["ensalada", "ensalada mixta"], serving: "1 plato", calories: 60, carbs: 8, sugar: 4, fat: 2, saturatedFat: 0.3, protein: 3, fiber: 3, sodium: 100, usdaQuery: "mixed salad greens" },
  { keywords: ["ensalada con pollo", "ensalada de pollo"], serving: "1 plato", calories: 250, carbs: 10, sugar: 5, fat: 12, saturatedFat: 2, protein: 28, fiber: 4, sodium: 300 },
  { keywords: ["ensalada caesar", "césar"], serving: "1 plato", calories: 320, carbs: 12, sugar: 3, fat: 24, saturatedFat: 5, protein: 18, fiber: 3, sodium: 650 },
  { keywords: ["tomate", "tomates"], serving: "1 unidad", calories: 22, carbs: 5, sugar: 3, fat: 0.2, saturatedFat: 0, protein: 1, fiber: 1, sodium: 6 },
  { keywords: ["zanahoria", "zanahorias"], serving: "1 unidad", calories: 25, carbs: 6, sugar: 3, fat: 0.1, saturatedFat: 0, protein: 0.5, fiber: 2, sodium: 42 },
  { keywords: ["brocoli", "brócoli"], serving: "1 taza", calories: 55, carbs: 11, sugar: 2, fat: 0.6, saturatedFat: 0.1, protein: 4, fiber: 5, sodium: 64, usdaQuery: "broccoli cooked" },
  { keywords: ["palta", "aguacate"], serving: "1/2 unidad", calories: 160, carbs: 9, sugar: 0.5, fat: 15, saturatedFat: 2, protein: 2, fiber: 7, sodium: 7, usdaQuery: "avocado" },

  // Frutas
  { keywords: ["banana", "plátano", "platano", "banana madura"], serving: "1 unidad mediana", calories: 105, carbs: 27, sugar: 14, fat: 0.3, saturatedFat: 0.1, protein: 1, fiber: 3, sodium: 1, usdaQuery: "banana raw" },
  { keywords: ["manzana"], serving: "1 unidad", calories: 95, carbs: 25, sugar: 19, fat: 0.3, saturatedFat: 0, protein: 0.5, fiber: 4, sodium: 2, usdaQuery: "apple raw" },
  { keywords: ["naranja"], serving: "1 unidad", calories: 62, carbs: 15, sugar: 12, fat: 0.2, saturatedFat: 0, protein: 1, fiber: 3, sodium: 0, usdaQuery: "orange raw" },
  { keywords: ["jugo de naranja", "jugo naranja"], serving: "1 vaso 250ml", calories: 110, carbs: 26, sugar: 21, fat: 0.2, saturatedFat: 0, protein: 2, fiber: 0.5, sodium: 2, usdaQuery: "orange juice" },
  { keywords: ["mandarina", "mandarinas"], serving: "2 unidades", calories: 80, carbs: 20, sugar: 16, fat: 0.2, saturatedFat: 0, protein: 1, fiber: 3, sodium: 2 },
  { keywords: ["sandia", "sandía", "melon", "melón"], serving: "1 tajada", calories: 45, carbs: 11, sugar: 9, fat: 0.2, saturatedFat: 0, protein: 1, fiber: 0.5, sodium: 2 },
  { keywords: ["frutilla", "frutillas", "fresa"], serving: "1 taza", calories: 50, carbs: 12, sugar: 7, fat: 0.5, saturatedFat: 0, protein: 1, fiber: 3, sodium: 2, usdaQuery: "strawberries raw" },
  { keywords: ["uva", "uvas"], serving: "1 taza", calories: 104, carbs: 27, sugar: 23, fat: 0.2, saturatedFat: 0.1, protein: 1, fiber: 1, sodium: 3, usdaQuery: "grapes raw" },
  { keywords: ["anana", "ananá", "piña"], serving: "1 taza", calories: 82, carbs: 22, sugar: 16, fat: 0.2, saturatedFat: 0, protein: 1, fiber: 2, sodium: 2, usdaQuery: "pineapple raw" },
  { keywords: ["mango"], serving: "1 unidad", calories: 135, carbs: 35, sugar: 31, fat: 0.6, saturatedFat: 0.1, protein: 1, fiber: 4, sodium: 4, usdaQuery: "mango raw" },
  { keywords: ["fruta", "frutas", "ensalada de frutas"], serving: "1 tazón", calories: 100, carbs: 25, sugar: 20, fat: 0.3, saturatedFat: 0, protein: 1, fiber: 3, sodium: 2 },

  // Lácteos y quesos
  { keywords: ["queso", "queso cremoso", "queso untable"], serving: "30g", calories: 110, carbs: 1, sugar: 0, fat: 9, saturatedFat: 5, protein: 7, fiber: 0, sodium: 180, usdaQuery: "cream cheese" },
  { keywords: ["queso rallado", "parmesano"], serving: "2 cucharadas", calories: 45, carbs: 0, sugar: 0, fat: 3, saturatedFat: 2, protein: 4, fiber: 0, sodium: 130, usdaQuery: "parmesan cheese" },
  { keywords: ["ricota"], serving: "100g", calories: 170, carbs: 3, sugar: 1, fat: 13, saturatedFat: 8, protein: 11, fiber: 0, sodium: 100, usdaQuery: "ricotta cheese" },

  // Snacks y dulces
  { keywords: ["galletita", "galleta", "galletitas"], serving: "4 unidades", calories: 160, carbs: 24, sugar: 10, fat: 6, saturatedFat: 2, protein: 2, fiber: 1, sodium: 180, usdaQuery: "cookies" },
  { keywords: ["alfajor", "alfajores"], serving: "1 unidad", calories: 220, carbs: 32, sugar: 22, fat: 9, saturatedFat: 4, protein: 3, fiber: 1, sodium: 80 },
  { keywords: ["chocolate", "tableta chocolate"], serving: "30g", calories: 160, carbs: 18, sugar: 16, fat: 9, saturatedFat: 5, protein: 2, fiber: 2, sodium: 20, usdaQuery: "dark chocolate" },
  { keywords: ["torta", "pastel", "bizcochuelo"], serving: "1 porción", calories: 280, carbs: 40, sugar: 28, fat: 12, saturatedFat: 5, protein: 4, fiber: 1, sodium: 200, usdaQuery: "cake slice" },
  { keywords: ["helado", "helado crema"], serving: "1 bocha", calories: 200, carbs: 24, sugar: 20, fat: 11, saturatedFat: 6, protein: 3, fiber: 0, sodium: 60, usdaQuery: "vanilla ice cream" },
  { keywords: ["dulce", "postre", "postre casero"], serving: "1 porción", calories: 250, carbs: 35, sugar: 28, fat: 12, saturatedFat: 6, protein: 3, fiber: 1, sodium: 80 },
  { keywords: ["choclo", "humita", "tamal"], serving: "1 unidad", calories: 180, carbs: 28, sugar: 4, fat: 6, saturatedFat: 2, protein: 5, fiber: 3, sodium: 350 },

  // Bebidas
  { keywords: ["agua", "agua mineral"], serving: "500ml", calories: 0, carbs: 0, sugar: 0, fat: 0, saturatedFat: 0, protein: 0, fiber: 0, sodium: 0 },
  { keywords: ["gaseosa", "coca cola", "coca", "pepsi", "sprite", "fanta"], serving: "350ml", calories: 140, carbs: 39, sugar: 39, fat: 0, saturatedFat: 0, protein: 0, fiber: 0, sodium: 45, usdaQuery: "cola soft drink" },
  { keywords: ["coca zero", "gaseosa zero", "coca light"], serving: "350ml", calories: 0, carbs: 0, sugar: 0, fat: 0, saturatedFat: 0, protein: 0, fiber: 0, sodium: 40 },
  { keywords: ["jugo", "jugo en polvo", "jugo de frutas"], serving: "1 vaso", calories: 120, carbs: 28, sugar: 24, fat: 0, saturatedFat: 0, protein: 0, fiber: 0, sodium: 15, usdaQuery: "fruit juice" },
  { keywords: ["vino", "copa de vino"], serving: "150ml", calories: 125, carbs: 4, sugar: 1, fat: 0, saturatedFat: 0, protein: 0, fiber: 0, sodium: 6, usdaQuery: "red wine" },
  { keywords: ["cerveza", "birra"], serving: "1 vaso", calories: 150, carbs: 13, sugar: 0, fat: 0, saturatedFat: 0, protein: 1, fiber: 0, sodium: 14, usdaQuery: "beer" },
  { keywords: ["bebida isotonica", "gatorade", "powerade"], serving: "500ml", calories: 80, carbs: 21, sugar: 21, fat: 0, saturatedFat: 0, protein: 0, fiber: 0, sodium: 200 },

  // Comidas compuestas comunes
  { keywords: ["sandwich", "sándwich", "sandwich de miga"], serving: "1 unidad", calories: 280, carbs: 32, sugar: 5, fat: 12, saturatedFat: 3, protein: 12, fiber: 2, sodium: 550, usdaQuery: "ham sandwich" },
  { keywords: ["wrap"], serving: "1 unidad", calories: 200, carbs: 22, sugar: 2, fat: 10, saturatedFat: 3, protein: 8, fiber: 2, sodium: 400 },
  { keywords: ["sopa", "sopa de verduras", "caldo"], serving: "1 plato", calories: 90, carbs: 12, sugar: 3, fat: 3, saturatedFat: 1, protein: 5, fiber: 2, sodium: 700, usdaQuery: "vegetable soup" },
  { keywords: ["sopa crema", "crema de zapallo"], serving: "1 plato", calories: 150, carbs: 18, sugar: 6, fat: 7, saturatedFat: 3, protein: 4, fiber: 3, sodium: 600 },
  { keywords: ["tarta", "tarta de verdura", "tarta pascualina"], serving: "1 porción", calories: 280, carbs: 22, sugar: 3, fat: 18, saturatedFat: 6, protein: 10, fiber: 2, sodium: 450 },
  { keywords: ["lomito", "lomito completo"], serving: "1 unidad", calories: 520, carbs: 42, sugar: 5, fat: 28, saturatedFat: 8, protein: 24, fiber: 2, sodium: 900 },
  { keywords: ["choripan", "choripán"], serving: "1 unidad", calories: 420, carbs: 32, sugar: 3, fat: 26, saturatedFat: 9, protein: 14, fiber: 1, sodium: 850 },
];

/** Mapa español → inglés para búsqueda USDA */
export const SPANISH_TO_USDA: Record<string, string> = {
  pollo: "chicken",
  carne: "beef",
  pescado: "fish",
  arroz: "rice",
  pasta: "pasta",
  fideos: "pasta",
  pan: "bread",
  leche: "milk",
  huevo: "egg",
  queso: "cheese",
  ensalada: "salad",
  sopa: "soup",
  pizza: "pizza",
  manzana: "apple",
  banana: "banana",
  naranja: "orange",
  papa: "potato",
  papas: "potato",
  tomate: "tomato",
  zanahoria: "carrot",
  yogurt: "yogurt",
  yogur: "yogurt",
  avena: "oatmeal",
  milanesa: "breaded cutlet",
  empanada: "empanada pastry",
};
