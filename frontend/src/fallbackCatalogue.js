// Fallback catalogue used only when the API is unreachable (e.g. the static
// GitHub Pages build). It intentionally contains no prices: every price must
// come from a live retailer source, never from a bundled fixture.
export const FALLBACK_CATALOGUE = {
  "products": [
    {
      "id": "prod-anua-pdrn",
      "name": "ANUA PDRN Hyaluronic Acid Hydrating Capsule Mist",
      "slug": "anua-pdrn-hydra",
      "size": "30ml",
      "ean": "8806094821231",
      "brandName": "ANUA",
      "category_slug": "k-beauty",
      "imageUrl": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80"
    },
    {
      "id": "prod-cosrx-snail",
      "name": "COSRX Advanced Snail 96 Mucin Power Essence",
      "slug": "cosrx-snail-essence",
      "size": "100ml",
      "ean": "8809598622121",
      "brandName": "COSRX",
      "category_slug": "k-beauty",
      "imageUrl": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80"
    },
    {
      "id": "prod-hada-labo-lotion",
      "name": "Hada Labo Gokujyun Hyaluronic Acid Lotion",
      "slug": "hada-labo-lotion",
      "size": "170ml",
      "ean": "4901301342981",
      "brandName": "Hada Labo",
      "category_slug": "j-beauty",
      "imageUrl": "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80"
    },
    {
      "id": "prod-innisfree-green-tea",
      "name": "INNISFREE Green Tea Seed Serum",
      "slug": "innisfree-green-tea-serum",
      "size": "80ml",
      "ean": "8806202131231",
      "brandName": "INNISFREE",
      "category_slug": "k-beauty",
      "imageUrl": "https://images.unsplash.com/photo-1601049541289-9a82eb3e4e7d?w=600&q=80"
    },
    {
      "id": "prod-somebymi-miracle",
      "name": "SOME BY MI AHA BHA PHA 30 Days Miracle Serum",
      "slug": "somebymi-miracle-serum",
      "size": "50ml",
      "ean": "8809644730171",
      "brandName": "SOME BY MI",
      "category_slug": "k-beauty",
      "imageUrl": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80"
    },
    {
      "id": "prod-shiseido-ubl",
      "name": "Shiseido Ultimune Power Infusing Concentrate",
      "slug": "shiseido-ubl",
      "size": "30ml",
      "ean": "4909978202511",
      "brandName": "Shiseido",
      "category_slug": "j-beauty",
      "imageUrl": "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80"
    }
  ],
  "retailers": [
    {
      "id": "yesstyle",
      "name": "YesStyle",
      "slug": "yesstyle",
      "baseUrl": "https://www.yesstyle.com",
      "apiType": "scraping",
      "status": "ACTIVE",
      "currency": "EUR",
      "country": "Germany"
    },
    {
      "id": "stylevana",
      "name": "Stylevana",
      "slug": "stylevana",
      "baseUrl": "https://www.stylevana.com",
      "apiType": "scraping",
      "status": "ACTIVE",
      "currency": "EUR",
      "country": "Germany"
    },
    {
      "id": "douglas",
      "name": "Douglas Germany",
      "slug": "douglas-de",
      "baseUrl": "https://www.douglas.de",
      "apiType": "official_api",
      "status": "ACTIVE",
      "currency": "EUR",
      "country": "Germany"
    },
    {
      "id": "flaconi",
      "name": "Flaconi",
      "slug": "flaconi",
      "baseUrl": "https://www.flaconi.de",
      "apiType": "official_api",
      "status": "ACTIVE",
      "currency": "EUR",
      "country": "Germany"
    },
    {
      "id": "notino",
      "name": "Notino Germany",
      "slug": "notino-de",
      "baseUrl": "https://www.notino.de",
      "apiType": "official_api",
      "status": "ACTIVE",
      "currency": "EUR",
      "country": "Germany"
    },
    {
      "id": "sephora",
      "name": "Sephora Germany",
      "slug": "sephora-de",
      "baseUrl": "https://www.sephora.de",
      "apiType": "official_api",
      "status": "ACTIVE",
      "currency": "EUR",
      "country": "Germany"
    },
    {
      "id": "lookfantastic",
      "name": "Lookfantastic Germany",
      "slug": "lookfantastic-de",
      "baseUrl": "https://www.lookfantastic.de",
      "apiType": "official_api",
      "status": "ACTIVE",
      "currency": "EUR",
      "country": "Germany"
    },
    {
      "id": "shop_apotheke",
      "name": "Shop Apotheke",
      "slug": "shop-apotheke",
      "baseUrl": "https://www.shop-apotheke.de",
      "apiType": "official_api",
      "status": "ACTIVE",
      "currency": "EUR",
      "country": "Germany"
    },
    {
      "id": "dm",
      "name": "dm.de",
      "slug": "dm-de",
      "baseUrl": "https://www.dm.de",
      "apiType": "third_party",
      "status": "ACTIVE",
      "currency": "EUR",
      "country": "Germany"
    },
    {
      "id": "rossmann",
      "name": "Rossmann.de",
      "slug": "rossmann-de",
      "baseUrl": "https://www.rossmann.de",
      "apiType": "third_party",
      "status": "ACTIVE",
      "currency": "EUR",
      "country": "Germany"
    }
  ]
};
