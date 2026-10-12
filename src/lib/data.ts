// Sample data for the Phase 1 mockup. Nothing here comes from a live API.
// Cigar attributes are approximate and for demonstration only.

export type Wrapper = "Connecticut" | "Habano" | "Maduro" | "Corojo" | "Sumatra" | "Cameroon";
export type Flavor =
  | "cedar" | "cream" | "coffee" | "cocoa" | "pepper" | "leather"
  | "nuts" | "earth" | "spice" | "sweet" | "citrus" | "floral";

export type Cigar = {
  id: string;
  name: string;
  brand: string;
  country: "Dominican Republic" | "Nicaragua" | "Honduras";
  wrapper: Wrapper;
  strength: 1 | 2 | 3 | 4 | 5;
  flavors: Flavor[];
  vitola: string;
  price: number; // approximate single-stick USD
  clubRating: number; // sample member average out of 5
};

export const STRENGTH_LABELS = ["", "Mild", "Mild to medium", "Medium", "Medium to full", "Full"];
export const WRAPPERS: Wrapper[] = ["Connecticut", "Habano", "Maduro", "Corojo", "Sumatra", "Cameroon"];
export const FLAVORS: Flavor[] = [
  "cedar", "cream", "coffee", "cocoa", "pepper", "leather",
  "nuts", "earth", "spice", "sweet", "citrus", "floral",
];

// Phase 2: replace with tracked deep links from the Cigar Page affiliate program.
export const affiliateUrl = (c: Cigar) =>
  `https://www.cigarpage.com/?ref=smcc-mockup&q=${encodeURIComponent(c.brand + " " + c.name)}`;

export const cigars: Cigar[] = [
  { id: "hemingway-short-story", name: "Hemingway Short Story", brand: "Arturo Fuente", country: "Dominican Republic", wrapper: "Cameroon", strength: 3, flavors: ["cedar", "sweet", "spice"], vitola: "Perfecto", price: 9, clubRating: 4.6 },
  { id: "padron-1964-maduro", name: "1964 Anniversary Exclusivo Maduro", brand: "Padrón", country: "Nicaragua", wrapper: "Maduro", strength: 4, flavors: ["cocoa", "coffee", "earth"], vitola: "Robusto", price: 18, clubRating: 4.8 },
  { id: "oliva-v-melanio", name: "Serie V Melanio Figurado", brand: "Oliva", country: "Nicaragua", wrapper: "Sumatra", strength: 4, flavors: ["cedar", "coffee", "spice"], vitola: "Figurado", price: 14, clubRating: 4.7 },
  { id: "le-bijou-1922", name: "Le Bijou 1922 Torpedo", brand: "My Father", country: "Nicaragua", wrapper: "Habano", strength: 5, flavors: ["pepper", "cocoa", "leather"], vitola: "Torpedo", price: 12, clubRating: 4.5 },
  { id: "ashton-classic-corona", name: "Classic Corona", brand: "Ashton", country: "Dominican Republic", wrapper: "Connecticut", strength: 2, flavors: ["cream", "cedar", "nuts"], vitola: "Corona", price: 10, clubRating: 4.2 },
  { id: "davidoff-grand-cru-2", name: "Grand Cru No. 2", brand: "Davidoff", country: "Dominican Republic", wrapper: "Connecticut", strength: 2, flavors: ["cream", "floral", "cedar"], vitola: "Corona Grande", price: 22, clubRating: 4.4 },
  { id: "liga-privada-9", name: "Liga Privada No. 9 Robusto", brand: "Drew Estate", country: "Nicaragua", wrapper: "Maduro", strength: 4, flavors: ["coffee", "cocoa", "earth"], vitola: "Robusto", price: 14, clubRating: 4.6 },
  { id: "perdomo-10th-champagne", name: "10th Anniversary Champagne", brand: "Perdomo", country: "Nicaragua", wrapper: "Connecticut", strength: 2, flavors: ["cream", "nuts", "coffee"], vitola: "Epicure", price: 9, clubRating: 4.3 },
  { id: "rp-vintage-1992", name: "Vintage 1992 Robusto", brand: "Rocky Patel", country: "Honduras", wrapper: "Sumatra", strength: 3, flavors: ["cedar", "spice", "sweet"], vitola: "Robusto", price: 8, clubRating: 4.1 },
  { id: "monte-white-churchill", name: "White Series Churchill", brand: "Montecristo", country: "Dominican Republic", wrapper: "Connecticut", strength: 2, flavors: ["cream", "nuts", "cedar"], vitola: "Churchill", price: 11, clubRating: 4.0 },
  { id: "epc-pledge-prequel", name: "Pledge Prequel", brand: "E.P. Carrillo", country: "Dominican Republic", wrapper: "Maduro", strength: 4, flavors: ["cocoa", "coffee", "pepper"], vitola: "Corona", price: 15, clubRating: 4.7 },
  { id: "aganorsa-corojo", name: "Signature Selection Corojo", brand: "Aganorsa Leaf", country: "Nicaragua", wrapper: "Corojo", strength: 4, flavors: ["pepper", "cedar", "spice"], vitola: "Toro", price: 10, clubRating: 4.3 },
  { id: "ryj-1875-churchill", name: "1875 Churchill", brand: "Romeo y Julieta", country: "Dominican Republic", wrapper: "Connecticut", strength: 2, flavors: ["cream", "cedar", "nuts"], vitola: "Churchill", price: 7, clubRating: 3.9 },
  { id: "undercrown-maduro", name: "Undercrown Maduro Robusto", brand: "Drew Estate", country: "Nicaragua", wrapper: "Maduro", strength: 3, flavors: ["cocoa", "coffee", "sweet"], vitola: "Robusto", price: 9, clubRating: 4.3 },
  { id: "antano-1970", name: "Antaño 1970 Robusto", brand: "Joya de Nicaragua", country: "Nicaragua", wrapper: "Habano", strength: 5, flavors: ["pepper", "earth", "leather"], vitola: "Robusto", price: 9, clubRating: 4.2 },
  { id: "plasencia-alma-fuerte", name: "Alma Fuerte Robustus I", brand: "Plasencia", country: "Nicaragua", wrapper: "Habano", strength: 4, flavors: ["earth", "spice", "sweet"], vitola: "Hexagonal robusto", price: 18, clubRating: 4.6 },
  { id: "tatuaje-verocu", name: "Havana VI Verocu", brand: "Tatuaje", country: "Nicaragua", wrapper: "Habano", strength: 3, flavors: ["cedar", "pepper", "coffee"], vitola: "Corona Gorda", price: 9, clubRating: 4.4 },
  { id: "ab-prensado", name: "Prensado Robusto", brand: "Alec Bradley", country: "Honduras", wrapper: "Corojo", strength: 4, flavors: ["cocoa", "earth", "spice"], vitola: "Box-pressed robusto", price: 11, clubRating: 4.4 },
  { id: "macanudo-cafe", name: "Café Hampton Court", brand: "Macanudo", country: "Dominican Republic", wrapper: "Connecticut", strength: 1, flavors: ["cream", "nuts", "sweet"], vitola: "Lonsdale", price: 8, clubRating: 3.8 },
  { id: "lfd-double-ligero", name: "Double Ligero Chisel", brand: "La Flor Dominicana", country: "Dominican Republic", wrapper: "Habano", strength: 5, flavors: ["pepper", "leather", "earth"], vitola: "Chisel", price: 12, clubRating: 4.5 },
  { id: "camacho-triple-maduro", name: "Triple Maduro Robusto", brand: "Camacho", country: "Honduras", wrapper: "Maduro", strength: 5, flavors: ["cocoa", "earth", "coffee"], vitola: "Robusto", price: 11, clubRating: 4.1 },
  { id: "cohiba-red-dot", name: "Red Dot Robusto", brand: "Cohiba", country: "Dominican Republic", wrapper: "Cameroon", strength: 3, flavors: ["cedar", "cream", "spice"], vitola: "Robusto", price: 25, clubRating: 4.2 },
  { id: "four-kicks", name: "Four Kicks Robusto", brand: "Crowned Heads", country: "Dominican Republic", wrapper: "Habano", strength: 3, flavors: ["cedar", "spice", "citrus"], vitola: "Robusto", price: 10, clubRating: 4.3 },
  { id: "warped-flor-del-valle", name: "Flor del Valle Mira Flor", brand: "Warped", country: "Nicaragua", wrapper: "Sumatra", strength: 3, flavors: ["floral", "sweet", "cedar"], vitola: "Corona", price: 12, clubRating: 4.5 },
];

export type Post = {
  id: number;
  author: string;
  initials: string;
  city: string;
  ago: string;
  text: string;
  cigarId?: string;
  likes: number;
  replies: number;
  membersOnly?: boolean;
  photo?: { src: string; alt: string; credit: string };
};

export const posts: Post[] = [
  { id: 1, author: "Marcus Bell", initials: "MB", city: "Las Vegas", ago: "2h", text: "Patio was perfect this morning. 68 degrees, double espresso, and a Hemingway Short Story. Who's in for next Sunday?", cigarId: "hemingway-short-story", likes: 14, replies: 6, photo: { src: "https://images.unsplash.com/photo-1536303158031-c868b371399f?auto=format&fit=crop&w=1000&q=70", alt: "A man seated in a chair, smoking a cigar", credit: "Adrien King / Unsplash" } },
  { id: 2, author: "Dana Ortiz", initials: "DO", city: "Las Vegas", ago: "5h", text: "Picked up a box of Pledge Prequel. Dark chocolate and black pepper from the first draw. Bringing a few to the Big Smoke outing to share.", cigarId: "epc-pledge-prequel", likes: 22, replies: 9, membersOnly: true },
  { id: 3, author: "Greg Whitfield", initials: "GW", city: "Scottsdale", ago: "Yesterday", text: "Looking for a mild morning smoke that isn't just cream and nothing else. Recommendations?", likes: 8, replies: 15 },
  { id: 4, author: "Andre Kim", initials: "AK", city: "Las Vegas", ago: "Yesterday", text: "Ran the Cigar Finder with medium, Habano, cedar and citrus. It matched Four Kicks and it nailed it. Lemon zest in the first third.", cigarId: "four-kicks", likes: 17, replies: 4, photo: { src: "https://images.unsplash.com/photo-1493328628492-54491d37daba?auto=format&fit=crop&w=1000&q=70", alt: "A man lighting a cigar, the flame lighting his face", credit: "Jeff Brown / Unsplash" } },
  { id: 5, author: "Lauren Hayes", initials: "LH", city: "Miami", ago: "2 days ago", text: "Heading to Vegas the first week of November. Any members open to a herf before the Big Smoke Friday night?", likes: 11, replies: 7 },
  { id: 6, author: "Victor Chen", initials: "VC", city: "Las Vegas", ago: "3 days ago", text: "Humidor check: 69% and holding after the seasoning. Le Bijou is resting until Thanksgiving.", cigarId: "le-bijou-1922", likes: 9, replies: 3, membersOnly: true },
];

export type Meetup = {
  id: number;
  title: string;
  city: string;
  venue: string;
  date: string; // display
  time: string;
  host: string;
  going: number;
  capacity: number;
  membersOnly: boolean;
  note: string;
};

export const meetups: Meetup[] = [
  { id: 1, title: "Sunday Morning Herf", city: "Las Vegas", venue: "Partner lounge, Summerlin", date: "Sun, Oct 18", time: "9:00 AM", host: "Marcus Bell", going: 18, capacity: 24, membersOnly: false, note: "Coffee pairing. Bring one to share." },
  { id: 2, title: "Founders Circle Private Herf", city: "Las Vegas", venue: "Private residence, The Ridges", date: "Sun, Oct 25", time: "10:00 AM", host: "Club founders", going: 11, capacity: 14, membersOnly: true, note: "Vintage Padrón vertical. Address sent after RSVP." },
  { id: 3, title: "Maduro and Bourbon Night", city: "Las Vegas", venue: "Partner lounge, Downtown", date: "Thu, Oct 29", time: "7:00 PM", host: "Dana Ortiz", going: 15, capacity: 30, membersOnly: true, note: "Three maduros, three pours, one vote." },
  { id: 4, title: "Big Smoke Las Vegas Group Outing", city: "Las Vegas", venue: "Horseshoe Las Vegas", date: "Fri, Nov 6", time: "7:00 PM", host: "Andre Kim", going: 26, capacity: 30, membersOnly: true, note: "Meet at the bar first. Tickets bought separately." },
  { id: 5, title: "Desert Golf and Cigars", city: "Scottsdale", venue: "Partner course, North Scottsdale", date: "Sat, Nov 14", time: "8:30 AM", host: "Greg Whitfield", going: 7, capacity: 12, membersOnly: false, note: "Nine holes, mild smokes, lunch after." },
  { id: 6, title: "Little Havana Walk and Roll", city: "Miami", venue: "Calle Ocho", date: "Sun, Nov 22", time: "11:00 AM", host: "Lauren Hayes", going: 9, capacity: 16, membersOnly: false, note: "Watch the torcedores, then lunch and a smoke." },
];

export type Episode = { n: number; title: string; guest: string; length: string; summary: string };

export const episodes: Episode[] = [
  { n: 3, title: "Building a humidor that holds", guest: "A local tobacconist", length: "48 min", summary: "Seasoning, beads versus packs, and why 69% beats 72% in the desert." },
  { n: 2, title: "Connecticut is not a strength", guest: "Club founders", length: "41 min", summary: "Wrapper color, body and strength are three different things. We smoke through the difference." },
  { n: 1, title: "Why Sunday morning?", guest: "Club founders", length: "36 min", summary: "How a coffee-and-cigar habit turned into a club, and what we want it to become." },
];

export const cities = ["All cities", "Las Vegas", "Scottsdale", "Miami"];
