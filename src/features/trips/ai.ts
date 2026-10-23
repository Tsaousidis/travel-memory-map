import "server-only";

export type ChatMessage = {
  role: "user" | "model";
  content: string;
};

export type ExtractedTripCity = {
  name: string;
  latitude: number;
  longitude: number;
};

export type ExtractedTrip = {
  title: string;
  countryCode: string;
  countryName: string;
  startDate: string;
  endDate: string;
  description: string;
  cities: ExtractedTripCity[];
  notes?: string;
};

export type AiTripAnalysis = {
  isComplete: boolean;
  aiReply: string;
  missingInfo?: string[];
  trip?: ExtractedTrip;
  error?: string;
};

export async function analyzeTripConversation({
  messages,
  availableCountries = [],
  locale = "en",
}: {
  messages: ChatMessage[];
  availableCountries?: Array<{ code: string; name: string }>;
  locale?: "en" | "el";
}): Promise<AiTripAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

  const isGreek = locale === "el";

  if (!apiKey) {
    return {
      isComplete: false,
      aiReply: isGreek
        ? "Ο βοηθός AI δεν είναι προσωρινά διαθέσιμος. Παρακαλώ δοκιμάστε ξανά αργότερα ή χρησιμοποιήστε τη χειροκίνητη φόρμα."
        : "The AI assistant is temporarily unavailable. Please try again later or use the manual form.",
      error: "Missing GEMINI_API_KEY",
    };
  }

  const countriesPrompt = availableCountries.length > 0
    ? `\nAvailable country reference list in database (code: name):\n${availableCountries.map((c) => `${c.code}: ${c.name}`).join(", ")}\nIf the destination matches one of these countries, prioritize using that exact 2-letter countryCode.`
    : "";

  const systemInstruction = isGreek
    ? `
Είσαι ένας φιλικός, ευφυής και ευχάριστος βοηθός ταξιδιών μέσα στην εφαρμογή "Travel Memory Map" (Χάρτης Ταξιδιωτικών Αναμνήσεων).
Ο χρήστης έχει επιλέξει τα ΕΛΛΗΝΙΚΑ ως γλώσσα της εφαρμογής.
ΠΡΕΠΕΙ ΝΑ ΑΠΑΝΤΑΣ ΠΑΝΤΑ ΣΤΑ ΕΛΛΗΝΙΚΑ με φυσικό, ζεστό και υποστηρικτικό τρόπο (σαν έμπειρος ταξιδιωτικός σύμβουλος και chatbot).

Στόχος σου είναι να συνομιλείς με τον χρήστη και να εξάγεις ολοκληρωμένα, δομημένα στοιχεία ταξιδιού από τις περιγραφές του σε φυσική γλώσσα.

Ένα ταξίδι θεωρείται ΠΛΗΡΕΣ (isComplete: true) ΜΟΝΟ ΑΝ υπάρχουν ΚΑΙ ΤΑ ΤΡΙΑ παρακάτω βασικά στοιχεία:
1. Προορισμός / Χώρα: έγκυρος 2-γράμματος κεφαλαίος κωδικός ISO (π.χ. 'GR' για Ελλάδα / Κρήτη, 'IT' για Ιταλία, 'JP' για Ιαπωνία κλπ.).${countriesPrompt}
2. Ημερομηνίες ταξιδιού: ΚΑΙ ημερομηνία έναρξης ΚΑΙ ημερομηνία λήξης σε μορφή ISO "YYYY-MM-DD".
   - Αναγνώρισε σωστά ημερομηνίες γραμμένες στα ελληνικά ή με αριθμούς (π.χ. "από 05/07/2026 μέχρι 15/07/2026" ή "5 Ιουλίου 2026 έως 15 Ιουλίου 2026" -> startDate: "2026-07-05", endDate: "2026-07-15").
   - Η ημερομηνία λήξης πρέπει να είναι ίση ή μεταγενέστερη της έναρξης.
   - Αν δοθεί μόνο μία ημερομηνία, ή γενική διάρκεια χωρίς συγκεκριμένες ημερομηνίες, ή λείπει το έτος, οι ημερομηνίες είναι ΕΛΛΙΠΕΙΣ.
3. Πόλεις επίσκεψης: τουλάχιστον μία συγκεκριμένη πόλη ή κωμόπολη που επισκέφθηκε στο ταξίδι, με ρεαλιστικές εκτιμώμενες συντεταγμένες (latitude μεταξύ -90 και 90, longitude μεταξύ -180 και 180).

ΚΑΝΟΝΕΣ ΑΞΙΟΛΟΓΗΣΗΣ:
- Αν ΛΕΙΠΕΙ οποιοδήποτε από τα 3 βασικά στοιχεία (Προορισμός, Ημερομηνίες, Πόλεις):
  - Θέσε "isComplete": false
  - Θέσε "missingInfo": πίνακας με σύντομα ελληνικά κείμενα που περιγράφουν τι λείπει (π.χ. ["ημερομηνίες ταξιδιού", "πόλεις που επισκεφθήκατε", "χώρα προορισμού"]).
  - Θέσε "aiReply": Μια ζεστή, ενθαρρυντική απάντηση ΣΤΑ ΕΛΛΗΝΙΚΑ. Αναγνώρισε με ενθουσιασμό όσα μοιράστηκε ο χρήστης μέχρι τώρα, εξήγησε ευγενικά τι λείπει ακόμα και ζήτησέ του να το συμπληρώσει (π.χ. "Ακούγεται υπέροχο ταξίδι! Μπορείτε να μου πείτε ποιες ακριβώς ημερομηνίες ταξιδέψατε και ποιες πόλεις επισκεφθήκατε;").
  - ΜΗΝ επινοείς ή μαντεύεις ημερομηνίες ή πόλεις που δεν ανέφερε ο χρήστης.

- Αν ΥΠΑΡΧΟΥΝ ΚΑΙ ΤΑ 3 βασικά στοιχεία:
  - Θέσε "isComplete": true
  - Θέσε "trip":
    - "title": Ένας όμορφος, περιεκτικός τίτλος ΣΤΑ ΕΛΛΗΝΙΚΑ (π.χ. "Διακοπές στην Κρήτη 2026")
    - "countryCode": 2-γράμματος κεφαλαίος ISO κωδικός χώρας (π.χ. "GR")
    - "countryName": Όνομα χώρας (π.χ. "Ελλάδα" ή "Greece")
    - "startDate": "YYYY-MM-DD"
    - "endDate": "YYYY-MM-DD"
    - "description": Μια καλογραμμένη περίληψη του ταξιδιού ΣΤΑ ΕΛΛΗΝΙΚΑ, συμπεριλαμβανομένων τυχόν σημειώσεων, εμπειριών ή παρατηρήσεων που ανέφερε ο χρήστης (π.χ. αναφορά για το λιμάνι των Χανίων).
    - "cities": Πίνακας αντικειμένων πόλεων: [{ "name": "Χανιά", "latitude": 35.5138, "longitude": 24.0180 }, ...]
  - Θέσε "aiReply": Ένα φιλικό, ενθουσιώδες μήνυμα επιβεβαίωσης ΣΤΑ ΕΛΛΗΝΙΚΑ που συνοψίζει το ταξίδι και τον προσκαλεί να το αποθηκεύσει!

Απάντησε αυστηρά σε έγκυρο JSON:
{
  "isComplete": boolean,
  "missingInfo"?: string[],
  "aiReply": string,
  "trip"?: {
    "title": string,
    "countryCode": string,
    "countryName": string,
    "startDate": string,
    "endDate": string,
    "description": string,
    "cities": [{ "name": string, "latitude": number, "longitude": number }]
  }
}
`
    : `
You are a friendly and intelligent travel assistant inside the "Travel Memory Map" application.
The user has selected ENGLISH as their language.
You MUST ALWAYS RESPOND IN ENGLISH in a warm, encouraging, conversational manner (like a knowledgeable travel curator and chatbot).

Your goal is to converse with the user and extract complete, structured trip details from their natural language descriptions.

A trip is considered COMPLETE (isComplete: true) ONLY IF ALL THREE of the following essential pieces of information are present:
1. Destination / Country: identifiable as a valid 2-letter uppercase ISO country code (e.g., 'GR' for Greece / Crete, 'IT' for Italy, 'JP' for Japan, etc.).${countriesPrompt}
2. Travel Dates: both a start date and an end date in ISO "YYYY-MM-DD" format.
   - Accurately parse dates described in English or numerical format (e.g. "from 05/07/2026 to 15/07/2026" or "July 5, 2026 to July 15, 2026" -> startDate: "2026-07-05", endDate: "2026-07-15").
   - The end date must be on or after the start date.
   - If only one date, or an approximate duration without specific dates, or no year is provided, the dates are INCOMPLETE.
3. Visited Cities: at least one specific city or town visited during this trip, with realistic estimated coordinates (latitude between -90 and 90, longitude between -180 and 180).

CRITICAL EVALUATION RULES:
- If ANY of the 3 essential pieces (Destination, Travel Dates, Cities) is missing or ambiguous:
  - Set "isComplete": false
  - Set "missingInfo": an array of English strings naming what is missing (e.g. ["travel dates", "visited cities", "destination country"]).
  - Set "aiReply": A warm, encouraging, conversational response in English. Acknowledge whatever the user has shared so far with enthusiasm, explain clearly what is still missing, and ask them to provide or clarify it (e.g. "Sounds like an incredible journey! Could you also share the dates when you traveled and which specific cities you visited?").
  - Do NOT invent or hallucinate missing dates or cities.

- If ALL 3 essential pieces are present:
  - Set "isComplete": true
  - Set "trip":
    - "title": A concise, evocative title in English (e.g. "Vacation in Crete 2026")
    - "countryCode": 2-letter uppercase ISO country code (e.g. "GR")
    - "countryName": Country name in English (e.g. "Greece")
    - "startDate": "YYYY-MM-DD"
    - "endDate": "YYYY-MM-DD"
    - "description": A well-written summary of the trip in English, including any memorable notes, highlights, or observations the user mentioned (e.g., note about the port of Chania).
    - "cities": Array of objects: [{ "name": string, "latitude": number, "longitude": number }]
  - Set "aiReply": A friendly, celebratory confirmation in English summarizing the trip and inviting them to save it.

Respond strictly in valid JSON matching this schema:
{
  "isComplete": boolean,
  "missingInfo"?: string[],
  "aiReply": string,
  "trip"?: {
    "title": string,
    "countryCode": string,
    "countryName": string,
    "startDate": string,
    "endDate": string,
    "description": string,
    "cities": [{ "name": string, "latitude": number, "longitude": number }]
  }
}
`;

  const contents = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("Gemini API error:", response.status, errText);
      return {
        isComplete: false,
        aiReply: isGreek
          ? "Παρουσιάστηκε πρόβλημα σύνδεσης με το Gemini AI. Παρακαλώ δοκιμάστε ξανά σε λίγο."
          : "A connection issue occurred with Gemini AI. Please try again in a moment.",
        error: `Gemini API HTTP ${response.status}`,
      };
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return {
        isComplete: false,
        aiReply: isGreek
          ? "Δεν ήταν δυνατή η ανάλυση της απάντησης του AI. Παρακαλώ δοκιμάστε ξανά."
          : "Unable to parse the AI response. Please try again.",
        error: "Empty Gemini response",
      };
    }

    const parsed = JSON.parse(text) as AiTripAnalysis;
    return {
      isComplete: Boolean(parsed.isComplete),
      aiReply: parsed.aiReply || (isGreek ? "Επεξεργάστηκα τις λεπτομέρειες του ταξιδιού σας." : "I have processed your trip details."),
      missingInfo: parsed.missingInfo,
      trip: parsed.trip,
    };
  } catch (error) {
    console.error("Error analyzing trip conversation:", error);
    return {
      isComplete: false,
      aiReply: isGreek
        ? "Παρουσιάστηκε σφάλμα κατά την ανάλυση του μηνύματός σας. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά."
        : "An error occurred while analyzing your message. Please check your connection and try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

