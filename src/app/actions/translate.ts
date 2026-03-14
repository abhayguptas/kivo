"use server";

import { LingoDotDevEngine } from "lingo.dev/sdk";

// This server action uses the Lingo.dev SDK to dynamically translate an array of objects
export async function batchTranslateFeedback(
  feedbackArray: Array<{ text: string; sourceLocale?: string | null }>,
  targetLocale: string = "en"
) {
  // Ensure the API key is present
  if (!process.env.LINGODOTDEV_API_KEY) {
    console.warn("LINGODOTDEV_API_KEY is not set. Returning original objects.");
    return feedbackArray;
  }

  try {
    const lingoDotDev = new LingoDotDevEngine({
      apiKey: process.env.LINGODOTDEV_API_KEY,
    });

    // We can auto-detect the source locale or pass it in. If omitted, Lingo.dev auto-detects
    // The SDK automatically maps over the objects and preserves keys/numbers/booleans
    
    // Simulate mapping over the feedback array and translating just the 'text' property
    // We do this by passing the full object array
    const translatedResults = [];
    
    for (const feedback of feedbackArray) {
      const translatedObject = await lingoDotDev.localizeObject(feedback, {
        sourceLocale: feedback.sourceLocale || null, // null for auto-detect
        targetLocale: targetLocale,
      });
      translatedResults.push(translatedObject);
    }
    
    return translatedResults;
  } catch (error) {
    console.error("Translation failed:", error);
    return feedbackArray;
  }
}
