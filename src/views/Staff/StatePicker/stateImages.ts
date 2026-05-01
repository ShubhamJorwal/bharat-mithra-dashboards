// Real per-state/UT famous-place image URLs sourced from Wikimedia Commons.
// All images are public domain / CC-licensed and resized via Wikipedia's
// thumbnail proxy so they load fast (320px wide is plenty for a small
// card thumbnail).
//
// To swap one out, replace the URL — the picker code falls back to the
// banner_image_url stored on the state record (which is currently a
// picsum placeholder), and from there to a generic placeholder.
//
// Updated: 2026-05-01

const W = 320;
const thumb = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${W}`;

export const STATE_IMAGES: Record<string, string> = {
  // Andaman & Nicobar — Radhanagar Beach
  AN: thumb("Radhanagar Beach Havelock.jpg"),
  // Andhra Pradesh — Tirumala Tirupati Temple
  AP: thumb("Sri Venkateswara Swamy Temple Tirumala.jpg"),
  // Arunachal Pradesh — Tawang Monastery
  AR: thumb("Tawang Monastery 2010.jpg"),
  // Assam — Kamakhya Temple
  AS: thumb("Kamakhya temple.jpg"),
  // Bihar — Mahabodhi Temple, Bodh Gaya
  BR: thumb("Mahabodhitemple.jpg"),
  // Chandigarh — Open Hand Monument
  CH: thumb("Open Hand Monument 2007.jpg"),
  // Chhattisgarh — Chitrakote Falls
  CG: thumb("Chitrakot Falls Bastar.jpg"),
  // Daman, Diu, DNH — Diu Fort
  DD: thumb("Diu Fort 2013.jpg"),
  // Delhi — India Gate
  DL: thumb("India Gate in New Delhi 03-2016.jpg"),
  // Goa — Basilica of Bom Jesus
  GA: thumb("Basilica of Bom Jesus Goa.jpg"),
  // Gujarat — Statue of Unity
  GJ: thumb("Statue of Unity in November 2018.jpg"),
  // Haryana — Kurukshetra (Brahma Sarovar)
  HR: thumb("Brahma Sarovar Kurukshetra.jpg"),
  // Himachal Pradesh — Hadimba Temple, Manali
  HP: thumb("Hadimba Devi Temple Manali.jpg"),
  // Jammu & Kashmir — Dal Lake
  JK: thumb("Dal Lake in Srinagar.jpg"),
  // Jharkhand — Hundru Falls
  JH: thumb("Hundru Falls Ranchi.jpg"),
  // Karnataka — Mysuru Palace
  KA: thumb("Mysore Palace Morning.jpg"),
  // Kerala — Kerala backwaters
  KL: thumb("Kerala Backwaters.jpg"),
  // Ladakh — Pangong Tso
  LA: thumb("Pangong Tso Ladakh.jpg"),
  // Lakshadweep — Agatti Island aerial
  LD: thumb("Agatti Island Aerial View.jpg"),
  // Madhya Pradesh — Khajuraho temples
  MP: thumb("Kandariya Mahadeva Temple Khajuraho.jpg"),
  // Maharashtra — Gateway of India
  MH: thumb("Gateway of India Mumbai 2015.jpg"),
  // Manipur — Loktak Lake
  MN: thumb("Loktak Lake Manipur.jpg"),
  // Meghalaya — Living root bridge, Cherrapunji
  ML: thumb("Living root bridges Cherrapunji.jpg"),
  // Mizoram — Aizawl skyline
  MZ: thumb("Aizawl city Mizoram.jpg"),
  // Nagaland — Hornbill Festival
  NL: thumb("Hornbill Festival Nagaland.jpg"),
  // Odisha — Konark Sun Temple
  OD: thumb("Konark Sun Temple Front view.jpg"),
  // Puducherry — French Quarter
  PY: thumb("French Quarter Pondicherry.jpg"),
  // Punjab — Golden Temple
  PB: thumb("Golden Temple Amritsar Punjab.jpg"),
  // Rajasthan — Hawa Mahal, Jaipur
  RJ: thumb("Hawa Mahal Jaipur.jpg"),
  // Sikkim — Kanchenjunga
  SK: thumb("Kanchenjunga from Sikkim.jpg"),
  // Tamil Nadu — Meenakshi Temple, Madurai
  TN: thumb("Meenakshi Temple Madurai.jpg"),
  // Telangana — Charminar
  TG: thumb("Charminar Hyderabad 03.jpg"),
  // Tripura — Ujjayanta Palace
  TR: thumb("Ujjayanta Palace Agartala.jpg"),
  // Uttar Pradesh — Taj Mahal
  UP: thumb("Taj Mahal Agra Front View.jpg"),
  // Uttarakhand — Kedarnath Temple
  UK: thumb("Kedarnath Temple Uttarakhand.jpg"),
  // West Bengal — Howrah Bridge
  WB: thumb("Howrah Bridge from Strand Road.jpg"),
};

export const stateImageFor = (
  code: string,
  fallback?: string,
): string => {
  const upper = (code || "").toUpperCase();
  return STATE_IMAGES[upper] || fallback || `https://picsum.photos/seed/bm-state-${upper.toLowerCase()}/320/320`;
};
