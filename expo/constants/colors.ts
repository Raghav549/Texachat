// ── Core Brand ──────────────────────────────────────────────
const gold = {
  50: "#FFF9E6",
  100: "#FFF0BF",
  200: "#FFE699",
  300: "#F5D06B",
  400: "#E8BC3D",
  500: "#D4A843",
  600: "#B8922E",
  700: "#9A7A1F",
  800: "#7A6014",
  900: "#5C470A",
} as const;

const dark = {
  0: "#0D0F17",
  50: "#131620",
  100: "#1A1D2A",
  200: "#242837",
  300: "#303547",
  400: "#3E4458",
  500: "#4E556B",
  600: "#626A80",
  700: "#7B8399",
  800: "#98A0B3",
  900: "#B9BFCE",
} as const;

// ── Semantic Tokens ─────────────────────────────────────────
export const TEXAColors = {
  // Brand
  gold,
  goldPrimary: gold[400],
  goldAccent: gold[500],
  goldLight: gold[200],
  goldDark: gold[600],

  // Backgrounds
  dark,
  bgPrimary: "#FFFFFF",
  bgSecondary: "#F8F9FB",
  bgTertiary: "#F0F2F5",
  bgDark: dark[0],
  bgDarkSecondary: dark[50],
  bgDarkCard: dark[100],

  // Surfaces (glassmorphism)
  glassBg: "rgba(255, 255, 255, 0.72)",
  glassBgDark: "rgba(19, 22, 32, 0.78)",
  glassBorder: "rgba(255, 255, 255, 0.18)",
  glassBorderDark: "rgba(255, 255, 255, 0.08)",

  // Text
  textPrimary: "#0D0F17",
  textSecondary: "#4E556B",
  textTertiary: "#98A0B3",
  textInverse: "#FFFFFF",
  textGold: gold[500],

  // Accents
  accentGreen: "#22C55E",
  accentRed: "#EF4444",
  accentBlue: "#3B82F6",
  accentOrange: "#F59E0B",

  // Status
  online: "#22C55E",
  typing: gold[400],

  // Gradients
  gradientGold: ["#E8BC3D", "#D4A843", "#B8922E"] as readonly [string, string, string],
  gradientDark: ["#0D0F17", "#1A1D2A", "#131620"] as readonly [string, string, string],
  gradientCard: ["#FFFFFF", "#F8F9FB"] as readonly [string, string],

  // Chat bubbles
  bubbleSent: gold[400],
  bubbleSentText: "#FFFFFF",
  bubbleReceived: "#F0F2F5",
  bubbleReceivedText: "#0D0F17",

  // Shadows
  shadowSm: "rgba(0, 0, 0, 0.06)",
  shadowMd: "rgba(0, 0, 0, 0.10)",
  shadowLg: "rgba(0, 0, 0, 0.14)",
  shadowGold: "rgba(212, 168, 67, 0.20)",
} as const;

export default TEXAColors;
