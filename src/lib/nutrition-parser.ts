export interface ParsedQuantity {
  multiplier: number;
  cleanedText: string;
  servingNote: string;
}

const NUMBER_WORDS: Record<string, number> = {
  un: 1, una: 1, uno: 1,
  dos: 2, tres: 3, cuatro: 4, cinco: 5,
  media: 0.5, medio: 0.5,
  doble: 2,
};

export function parseSpanishQuantity(input: string): ParsedQuantity {
  let text = input.trim();
  let multiplier = 1;
  let servingNote = "1 porción";

  const numericMatch = text.match(/^(\d+(?:[.,]\d+)?)\s+/);
  if (numericMatch) {
    multiplier = parseFloat(numericMatch[1].replace(",", "."));
    text = text.slice(numericMatch[0].length).trim();
    servingNote = `${multiplier} porción(es)`;
  }

  const wordNumMatch = text.match(/^(un|una|uno|dos|tres|cuatro|cinco|media|medio|doble)\s+/i);
  if (wordNumMatch && !numericMatch) {
    multiplier = NUMBER_WORDS[wordNumMatch[1].toLowerCase()] ?? 1;
    text = text.slice(wordNumMatch[0].length).trim();
    servingNote = `${multiplier} porción(es)`;
  }

  if (/^plato\s+(grande|de)/i.test(text)) {
    multiplier *= 1.5;
    text = text.replace(/^plato\s+(grande\s+de?\s*|de\s+)/i, "");
    servingNote = "1 plato grande";
  } else if (/^plato/i.test(text)) {
    text = text.replace(/^plato\s+(de\s+)?/i, "");
    servingNote = "1 plato";
  }

  if (/^taza/i.test(text)) {
    text = text.replace(/^taza\s+(de\s+)?/i, "");
    servingNote = `${multiplier} taza(s)`;
  }

  if (/^vaso/i.test(text)) {
    text = text.replace(/^vaso\s+(de\s+)?/i, "");
    servingNote = `${multiplier} vaso(s)`;
  }

  return { multiplier, cleanedText: text || input, servingNote };
}

export function scaleNutrition<T extends Record<string, number>>(
  values: T,
  multiplier: number
): T {
  const result = {} as T;
  for (const [k, v] of Object.entries(values)) {
    (result as Record<string, number>)[k] = Math.round(v * multiplier * 10) / 10;
  }
  return result;
}
