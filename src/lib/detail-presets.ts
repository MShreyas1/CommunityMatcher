export interface PresetField {
  key: string;
  label: string;
  type: "text" | "select";
  options?: string[];
  placeholder?: string;
}

export interface DetailPreset {
  id: string;
  name: string;
  fields: PresetField[];
}

export const DETAIL_PRESETS: DetailPreset[] = [
  {
    id: "indian",
    name: "Indian",
    fields: [
      {
        key: "gothramNakshatram",
        label: "Gothram / Nakshatram",
        type: "text",
        placeholder: "e.g. Bharadwaj / Rohini",
      },
      {
        key: "education",
        label: "Education",
        type: "text",
        placeholder: "e.g. MS Computer Science",
      },
      {
        key: "raisedIn",
        label: "Raised In",
        type: "text",
        placeholder: "e.g. Chennai, Tamil Nadu",
      },
      {
        key: "countryRaisedIn",
        label: "Country Raised In",
        type: "select",
        options: [
          "USA",
          "India",
          "Canada",
          "UAE",
          "Singapore",
          "England",
          "Australia",
          "India and USA",
          "India and Canada",
          "Other",
        ],
      },
      {
        key: "height",
        label: "Height",
        type: "text",
        placeholder: "e.g. 5'6\"",
      },
      {
        key: "foodHabits",
        label: "Food Habits",
        type: "select",
        options: ["Vegetarian", "Non-Vegetarian", "Eggetarian", "Vegan"],
      },
      {
        key: "drinkingHabits",
        label: "Drinking Habits",
        type: "select",
        options: [
          "I do not drink",
          "I drink on rare occasion",
          "I am a social drinker",
        ],
      },
      {
        key: "smokingHabits",
        label: "Smoking Habits",
        type: "select",
        options: [
          "I do not smoke",
          "I smoke occasionally",
          "I smoke regularly",
        ],
      },
      {
        key: "previouslyMarried",
        label: "Previously Married",
        type: "select",
        options: ["No", "Yes"],
      },
    ],
  },
];

export function getPresetById(id: string): DetailPreset | undefined {
  return DETAIL_PRESETS.find((p) => p.id === id);
}
