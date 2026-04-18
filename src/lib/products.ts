export interface Category {
  slug: string;
  name: string;
}

export interface product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  category: string;
}

export type Product = product;

export type ProductLike = Partial<product> & {
  _id?: { toString(): string };
  id?: string;
  title?: string;
  img?: string;
};

export function normalizeProductRecord(product: ProductLike): product {
  return {
    id: product._id?.toString() ?? product.id ?? "",
    name: product.name ?? product.title ?? "Product",
    description: product.description ?? "",
    price: typeof product.price === "number" ? product.price : Number(product.price) || 0,
    unit: product.unit ?? "",
    image:
      product.image ??
      product.img ??
      "https://res.cloudinary.com/dehccrol4/image/upload/v1763832952/apple-colorful-vector-design_341269-1123_af1e0a.jpg",
    category: product.category ?? "uncategorized",
  };
}

export const categories: Category[] = [
  {
    slug: 'fruits',
    name: 'Fresh Fruits'
  },
  {
    slug: 'vegetables',
    name: 'Vegetables'
  },
  {
    slug: 'dairy',
    name: 'Dairy & Eggs'
  },
  {
    slug: 'bakery',
    name: 'Bakery'
  },
  {
    slug: 'beverages',
    name: 'Beverages'
  },
  {
    slug: 'snacks',
    name: 'Snacks'
  },
  {
    slug: 'personal-care',
    name: 'Personal Care'
  },
  {
    slug: 'household',
    name: 'Household'
  }
];

export const products: product[] = [
  {
    id: 'apple',
    name: 'Red Apples',
    description: 'Crisp and juicy seasonal apples.',
    price: 120,
    unit: '1 kg',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1763832952/apple-colorful-vector-design_341269-1123_af1e0a.jpg',
    category: 'fruits'
  },
  {
    id: 'banana',
    name: 'Bananas',
    description: 'Ripe yellow bananas rich in potassium.',
    price: 60,
    unit: '1 dozen',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1763831001/Standrad_Banana_WAnKgF3_eb7f7l.jpg',
    category: 'fruits'
  },
   {
    id: 'orange',
    name: 'Oranges',
    description: 'Sweet and juicy oranges.',
    price: 60,
    unit: '500 gm',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764394087/images_jmypcp.jpg',
    category: 'fruits'
  },
  {
    id: 'kiwi',
    name: 'Kiwis',
    description: 'Fresh and tangy kiwis.',
    price: 40,
    unit: '500 g',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764393979/41HBiAwssdS._AC_UF894_1000_QL80__pt2zwj.jpg',
    category: 'fruits'
  },
  {
    id: 'potato',
    name: 'Potatoes',
    description: 'Staple kitchen vegetable.',
    price: 60,
    unit: '1 kg',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1763833983/360_F_85799278_0BBGV9OAdQDTLnKwAPBCcg1J7QtiieJY_ekod71.jpg',
    category: 'vegetables'
  },
  {
    id: 'cabbage',
    name: 'Cabbage',
    description: 'Staple kitchen vegetable.',
    price: 50,
    unit: '1 kg',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764601277/images_kiskt9.jpg',
    category: 'vegetables'
  },
  {
    id: 'cauliflower',
    name: 'Cauliflower',
    description: 'Staple kitchen vegetable.',
    price: 20,
    unit: '500 gm',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764601356/91EdPVzD99L_ctrnyg.jpg',
    category: 'vegetables'
  },
  {
    id: 'Lady finger',
    name: 'Lady finger',
    description: 'Staple kitchen vegetable.',
    price: 25,
    unit: '500 gm',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764601428/51yqai2b3nL._AC_UF1000_1000_QL80__abk2zl.jpg',
    category: 'vegetables'
  },
  {
    id: 'milk',
    name: 'Amul milk',
    description: 'Pasteurized fresh dairy milk.',
    price: 29,
    unit: '500 ml',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1763919862/FullSizeRender_grande_apiuqt.jpg',
    category: 'dairy'
  },
  {
    id: 'bread',
    name: 'Whole Wheat Bread',
    description: 'Soft and healthy bread loaf.',
    price: 45,
    unit: '400 g',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1763919903/shopping_vhxeyz.webp ',
    category: 'bakery'
  },
  {
    id: 'Cake',
    name: 'Cake',
    description: 'Chochlaty cake.',
    price: 260,
    unit: '700 g',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764401585/x8i2a54tpp1754035623750_pbfrhv.webp',
    category: 'bakery'
  },
  {
    id: 'Cookies',
    name: 'Cookies',
    description: 'Chochlate cookies.',
    price: 100,
    unit: '200 g',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764401694/WEB1clsoe_up_of_chocolate_chip_cookies._stacked_on_whi_07bc1482-455e-4c1a-969c-b0c7eaad50e1_3-720x720_hn9djs.jpg',
    category: 'bakery'
  },
  {
    id: 'Buns',
    name: 'Buns',
    description: 'soft buns.',
    price: 70,
    unit: '100 g',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764401787/images_cgr0ok.jpg',
    category: 'bakery'
  },
  {
    id: 'chips',
    name: 'Lays Chips',
    description: 'Crunchy salted chips.',
    price: 20,
    unit: '1 pack',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764400302/tr_w-3840_c-at_max_cm-pad_resize_ar-1210-700_pr-true_f-auto_q-70_l-image_i-Wellness_logo_BDwqbQao9_eoc0tl.jpg',
    category: 'snacks'
  },
  {
    id: 'Biscuits',
    name: 'Biscuits',
    description: 'Crunchy tasty biscuits.',
    price: 20,
    unit: '1 pack',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764402279/custard-creams_0501_dsxkok.jpg',
    category: 'snacks'
  },
  {
    id: 'Chochlate',
    name: 'chochlate',
    description: 'chochlates.',
    price: 25,
    unit: '2 pack',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764402366/-original-imah2yr7ycffpx2v_zph8zj.jpg',
    category: 'snacks'
  },
  {
    id: 'Namkeen',
    name: 'Namkeen',
    description: 'Bhujiya and more.',
    price: 40,
    unit: '1 pack',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764402586/fed43cd3-2802-49af-89a4-807337012661_38656_1_vl1o3l.png',
    category: 'snacks'
  },
  {
    id: 'drinks',
    name: 'Diet Coke',
    description: 'Refreshing carbonated beverage.',
    price: 40,
    unit: '500 ml',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764400063/coca-cola-diet-coke-24-pack-300ml-cans_k2lnc8.jpg',
    category: 'beverages'
  },
  {
    id: 'Ice cream',
    name: 'Ice cream',
    description: 'Refreshing carbonated beverage.',
    price: 40,
    unit: ' 100 ml',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764400902/abfe414d05b64ccac67f462caabe3fb8_o2_featured_v2_swej2a.jpg',
    category: 'beverages'
  },
  {
    id: 'Mojito',
    name: 'Mojito',
    description: 'pure fresh mojito.',
    price: 60,
    unit: '300 ml',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764401048/images_anns5b.jpg',
    category: 'beverages'
  },
  {
    id: 'Cold Coffee',
    name: 'Cold Coffee',
    description: 'pure fresh cold coffee.',
    price: 80,
    unit: '300 ml',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764401088/Cafe-style-cold-coffee-with-icecream_emidj2.jpg',
    category: 'beverages'
  },
  {
    id: 'soap',
    name: 'Herbal Soap',
    description: 'Gentle cleansing soap bar.',
    price: 50,
    unit: '100 g',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764410913/ac_m_182392_uecufj.webp',
    category: 'personal-care'
  },
  {
    id: 'Body wash',
    name: 'Body Wash',
    description: 'Gentle cleansing wash.',
    price: 130,
    unit: '400 ml',
    image: 'https://res.cloudinary.com/dehccrol4/image/upload/v1764410978/nGq757qz_46bb08e1bea74b3e91cc6e289472e67d_opa8rz.webp',
    category: 'personal-care'
  }
];
