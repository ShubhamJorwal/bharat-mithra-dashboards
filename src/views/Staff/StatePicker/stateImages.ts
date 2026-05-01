// Real per-state/UT famous-place image URLs sourced from Wikimedia Commons.
// All images are public domain / CC-licensed and resized via Wikimedia's
// thumbnail proxy.
//
// If a URL ever 404s, the <img onError> handler in StatePicker.tsx falls
// back to a deterministic picsum placeholder for that state — no broken
// image icons.
//
// Updated: 2026-05-01

const W = 400;
const wm = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${W}`;

export const STATE_IMAGES: Record<string, string> = {
  // Andaman & Nicobar — Radhanagar Beach
  AN: wm("Radhanagar Beach Havelock Island.jpg"),
  // Andhra Pradesh — Tirumala Tirupati Temple
  AP: wm("Tirumala 090615.jpg"),
  // Arunachal Pradesh — Tawang Monastery
  AR: wm("Tawang Monastery Front View 2.jpg"),
  // Assam — Kamakhya Temple, Guwahati
  AS: wm("Kamakhya Temple Front view from main entrance.jpg"),
  // Bihar — Mahabodhi Temple, Bodh Gaya
  BR: wm("Mahabodhi temple.jpg"),
  // Chandigarh — Open Hand Monument
  CH: wm("Open Hand Monument Chandigarh.jpg"),
  // Chhattisgarh — Chitrakote Falls
  CG: wm("Chitrakot Waterfall, Bastar.jpg"),
  // Daman, Diu, DNH — Diu Fort
  DD: wm("Diu fort Sea side.jpg"),
  // Delhi — India Gate
  DL: wm("Indiagate.JPG"),
  // Goa — Basilica of Bom Jesus
  GA: wm("Basilica of Bom Jesus, Old Goa.jpg"),
  // Gujarat — Statue of Unity
  GJ: wm("Statue of Unity in 2018.jpg"),
  // Haryana — Brahma Sarovar Kurukshetra
  HR: wm("Brahma Sarovar - Kurukshetra.jpg"),
  // Himachal Pradesh — Hadimba Devi Temple, Manali
  HP: wm("Hidimba Temple Manali.jpg"),
  // Jammu & Kashmir — Dal Lake
  JK: wm("Dal Lake -Srinagar -Kashmir-1.jpg"),
  // Jharkhand — Hundru Falls
  JH: wm("Hundru Falls in Ranchi.jpg"),
  // Karnataka — Mysore Palace (verified working)
  KA: wm("Mysore Palace Morning.jpg"),
  // Kerala — Backwaters
  KL: wm("Kerala Backwaters Houseboat.jpg"),
  // Ladakh — Pangong Tso
  LA: wm("Pangong Lake.jpg"),
  // Lakshadweep — Agatti aerial
  LD: wm("Agatti island aerial view.jpg"),
  // Madhya Pradesh — Kandariya Mahadeva Temple, Khajuraho
  MP: wm("Kandariya Mahadeva Temple 02.jpg"),
  // Maharashtra — Gateway of India
  MH: wm("Mumbai 03-2016 30 Gateway of India.jpg"),
  // Manipur — Loktak Lake
  MN: wm("Loktak Lake View.jpg"),
  // Meghalaya — Living Root Bridge, Cherrapunji
  ML: wm("Umshiang Double-Decker Root Bridge.jpg"),
  // Mizoram — Aizawl
  MZ: wm("Aizawl city view.jpg"),
  // Nagaland — Hornbill Festival
  NL: wm("Hornbill Festival Kohima.jpg"),
  // Odisha — Konark Sun Temple
  OD: wm("Konark Sun Temple Front View.JPG"),
  // Puducherry — Promenade Beach
  PY: wm("Promenade Beach Pondicherry.jpg"),
  // Punjab — Golden Temple, Amritsar
  PB: wm("The Golden Temple of Amrithsar.jpg"),
  // Rajasthan — Hawa Mahal, Jaipur
  RJ: wm("Hawa Mahal 2011.jpg"),
  // Sikkim — Kanchenjunga
  SK: wm("Kangchenjunga India.jpg"),
  // Tamil Nadu — Meenakshi Temple, Madurai
  TN: wm("Madurai Meenakshi Amman Temple Gopurams.jpg"),
  // Telangana — Charminar, Hyderabad
  TG: wm("Charminar 03.jpg"),
  // Tripura — Ujjayanta Palace
  TR: wm("Ujjayanta Palace Front View.jpg"),
  // Uttar Pradesh — Taj Mahal
  UP: wm("Taj Mahal in March 2004.jpg"),
  // Uttarakhand — Kedarnath Temple
  UK: wm("Kedarnath Temple in 2017.jpg"),
  // West Bengal — Howrah Bridge
  WB: wm("Howrah Bridge in Kolkata, India.jpg"),
};

export const stateImageFor = (
  code: string,
  fallback?: string,
): string => {
  const upper = (code || "").toUpperCase();
  return STATE_IMAGES[upper] || fallback || fallbackImage(upper);
};

export const fallbackImage = (code: string): string =>
  `https://picsum.photos/seed/bm-state-${(code || "").toLowerCase()}/400/400`;
