import type { Lang } from "../i18n/translations";

/** Curated crop-disease guidance shown for supported model predictions. */

export type DiseaseId =
  | "tomato-late-blight"
  | "corn-common-rust"
  | "rice-blast"
  | "apple-scab"
  | "healthy-leaf"
  | "unclassified-disease";

export type Severity = "mild" | "moderate" | "critical" | "healthy" | "unknown";

export interface LocalizedBlock {
  name: string;
  description: string;
  organic: string[];
  chemical: { product: string; dose: string };
  prevention: string[];
}

export interface Disease {
  id: DiseaseId;
  crop: "tomato" | "corn" | "potato" | "rice" | "apple" | "generic";
  family: "fungal" | "bacterial" | "viral" | "pest" | "none" | "unknown";
  en: LocalizedBlock;
  hi: LocalizedBlock;
  es: LocalizedBlock;
  kn: LocalizedBlock;
}

export const DISEASES: Record<DiseaseId, Disease> = {
  "tomato-late-blight": {
    id: "tomato-late-blight",
    crop: "tomato",
    family: "fungal",
    en: {
      name: "Tomato Late Blight",
      description:
        "A fast-spreading fungal disease. Dark, water-soaked patches appear on leaves and stems, often with white mold on the underside in humid weather.",
      organic: [
        "Spray a diluted copper-soap solution (5 ml per litre) every 10 days, in the morning.",
        "Use a baking-soda spray (1 tsp per litre water + a drop of soap) to slow fungal growth.",
        "Remove and burn infected leaves immediately — do not compost them.",
      ],
      chemical: { product: "Copper oxychloride (50% WP)", dose: "12 g per litre of water, spray weekly" },
      prevention: [
        "Water at the base of the plant — never splash the leaves.",
        "Space plants wider for airflow and prune lower leaves.",
        "Rotate tomatoes with non-solanum crops every season.",
      ],
    },
    hi: {
      name: "टमाटर का लेट ब्लाइट",
      description:
        "तेज़ी से फैलने वाला फफूंद रोग। पत्तियों पर गहरे भूरे, गीले धब्बे बनते हैं; नमी में पत्ती के नीचे सफ़ेद फफूंद दिखती है।",
      organic: [
        "ताँबा साबुन घोल (5 मिली प्रति लीटर) हर 10 दिन में सुबह छिड़कें।",
        "बेकिंग सोडा स्प्रे (1 चम्मच प्रति लीटर पानी + साबुन की बूँद) से फफूंद की वृद्धि धीमी करें।",
        "संक्रमित पत्तियों को तुरंत तोड़कर जला दें — कम्पोस्ट में न डालें।",
      ],
      chemical: { product: "कॉपर ऑक्सीक्लोराइड (50% WP)", dose: "12 ग्राम प्रति लीटर पानी, साप्ताहिक छिड़काव" },
      prevention: [
        "पौधे के जड़ के पास पानी दें, पत्तियों पर पानी न छिड़कें।",
        "पौधों में दूरी रखें और नीचे की पत्तियाँ तोड़ें ताकि हवा चले।",
        "हर मौसम में टमाटर का स्थान बदलें — नाइटशेड फसलें साथ न लगाएँ।",
      ],
    },
    es: {
      name: "Tizón tardío del tomate",
      description:
        "Enfermedad fúngica muy contagiosa: manchas marrones húmedas en hojas y tallos, con moho blanco bajo la hoja en clima húmedo.",
      organic: [
        "Rocía una solución de jabón de cobre (5 ml por litro) cada 10 días por la mañana.",
        "Usa un spray de bicarbonato (1 cucharadita por litro + gota de jabón) para frenar el hongo.",
        "Retira y quema las hojas infectadas de inmediato — nunca las compostes.",
      ],
      chemical: { product: "Oxicloruro de cobre (50% WP)", dose: "12 g por litro de agua, rociar cada semana" },
      prevention: [
        "Riega en la base del tomate, nunca sobre las hojas.",
        "Amplía la distancia entre plantas y poda las hojas bajas.",
        "Rota el cultivo con especies no solanáceas cada temporada.",
      ],
    },
    kn: {
      name: "ಟೊಮೇಟೊ ತಡ ಅಂಗಮಾರಿ",
      description:
        "ವೇಗವಾಗಿ ಹರಡುವ ಶಿಲೀಂಧ್ರ ರೋಗ. ಎಲೆ ಮತ್ತು ಕಾಂಡಗಳ ಮೇಲೆ ನೀರು ನೆನೆದಂತೆ ಕಾಣುವ ಕಪ್ಪು ಕಲೆಗಳು ಉಂಟಾಗುತ್ತವೆ; ತೇವ ವಾತಾವರಣದಲ್ಲಿ ಎಲೆಯ ಕೆಳಭಾಗದಲ್ಲಿ ಬಿಳಿ ಶಿಲೀಂಧ್ರ ಕಾಣಿಸಬಹುದು.",
      organic: [
        "ತಾಮ್ರ-ಸಾಬೂನು ದ್ರಾವಣವನ್ನು (ಪ್ರತಿ ಲೀಟರ್‌ಗೆ 5 ಮಿ.ಲೀ.) ಬೆಳಿಗ್ಗೆ ಪ್ರತಿ 10 ದಿನಕ್ಕೊಮ್ಮೆ ಸಿಂಪಡಿಸಿ.",
        "ಶಿಲೀಂಧ್ರದ ಬೆಳವಣಿಗೆ ನಿಧಾನಗೊಳಿಸಲು ಅಡುಗೆ ಸೋಡಾ ದ್ರಾವಣವನ್ನು (ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 1 ಟೀ ಚಮಚ ಮತ್ತು ಒಂದು ಹನಿ ಸಾಬೂನು) ಸಿಂಪಡಿಸಿ.",
        "ಸೋಂಕಿತ ಎಲೆಗಳನ್ನು ತಕ್ಷಣ ತೆಗೆದು ನಾಶಮಾಡಿ — ಕಾಂಪೋಸ್ಟ್‌ಗೆ ಹಾಕಬೇಡಿ.",
      ],
      chemical: {
        product: "ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ (50% WP)",
        dose: "ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 12 ಗ್ರಾಂ, ವಾರಕ್ಕೊಮ್ಮೆ ಸಿಂಪಡಿಸಿ",
      },
      prevention: [
        "ಸಸ್ಯದ ಬುಡಕ್ಕೆ ನೀರು ಹಾಕಿ — ಎಲೆಗಳ ಮೇಲೆ ನೀರು ಚಿಮುಕಿಸಬೇಡಿ.",
        "ಗಾಳಿಯಾಡಲು ಸಸ್ಯಗಳ ನಡುವೆ ಅಂತರವಿಟ್ಟು ಕೆಳಗಿನ ಎಲೆಗಳನ್ನು ಕತ್ತರಿಸಿ.",
        "ಪ್ರತಿ ಋತುವಿನಲ್ಲಿ ಟೊಮೇಟೊ ಬದಲು ಬೇರೆ ಕುಟುಂಬದ ಬೆಳೆಗಳನ್ನು ಪರ್ಯಾಯವಾಗಿ ಬೆಳೆಸಿ.",
      ],
    },
  },
  "corn-common-rust": {
    id: "corn-common-rust",
    crop: "corn",
    family: "fungal",
    en: {
      name: "Corn Common Rust",
      description:
        "Pustules of reddish-brown spores on both leaf surfaces. Usually breaks out in warm, humid spells and spreads by wind and rain splash.",
      organic: [
        "Spray a 2% neem-oil solution early in the morning to slow spore spread.",
        "Dust a sulfur powder when pustules first appear.",
        "Remove heavily infected lower leaves and keep the field weed-free.",
      ],
      chemical: { product: "Mancozeb 75% WP", dose: "30 g per 10 L water, spray every 10 days" },
      prevention: [
        "Plant rust-resistant hybrid varieties.",
        "Avoid excessive nitrogen and evening leaf wetness.",
        "Clear field debris after harvest to break the spore cycle.",
      ],
    },
    hi: {
      name: "मक्का का कॉमन रस्ट",
      description:
        "पत्तियों पर लाल-भूरे उठे हुए धब्बे (जंग)। गर्म-नम मौसम में फैलता है; हवा और पानी की बौछार से।",
      organic: [
        "2% नीम तेल घोल सुबह जल्दी छिड़कें ताकि रस्ट फैले नहीं।",
        "पहले उभार से गंधक धूल (सल्फर डस्ट) छिड़कें।",
        "नीचे की संक्रमित पत्तियाँ हटाएँ और खेत में खरपतवार न रखें।",
      ],
      chemical: { product: "मैनकोज़ेब 75% WP", dose: "30 ग्राम प्रति 10 लीटर पानी, हर 10 दिन में" },
      prevention: [
        "रस्ट प्रतिरोधी संकर किस्में लगाएँ।",
        "शाम को पत्तियों का गीला होना कम करें और अत्यधिक नाइट्रोजन से बचें।",
        "मौसम खत्म होने पर खेत की मलबा साफ करें।",
      ],
    },
    es: {
      name: "Roya común del maíz",
      description:
        "Pústulas rojizo-marrones en ambas caras de la hoja. Brota en climas cálidos y húmedos; se propaga por viento y salpicadura.",
      organic: [
        "Rocía aceite de neem al 2% a primera hora de la mañana.",
        "Aplica azufre en polvo apenas aparezcan las pústulas.",
        "Retira las hojas bajas infectadas y limpia las malezas.",
      ],
      chemical: { product: "Mancoceb 75% WP", dose: "30 g por 10 L de agua, cada 10 días" },
      prevention: [
        "Siembra variedades híbridas resistentes.",
        "Evita el exceso de nitrógeno y las hojas mojadas al anochecer.",
        "Limpia los restos de cosecha para cortar el ciclo del hongo.",
      ],
    },
    kn: {
      name: "ಮೆಕ್ಕೆಜೋಳದ ಸಾಮಾನ್ಯ ತುಕ್ಕು ರೋಗ",
      description:
        "ಎಲೆಯ ಎರಡೂ ಬದಿಗಳಲ್ಲಿ ಕೆಂಪು-ಕಂದು ಬಣ್ಣದ ಬೀಜಕ ಗುಳ್ಳೆಗಳು ಕಾಣಿಸುತ್ತವೆ. ಬೆಚ್ಚಗಿನ, ತೇವದ ವಾತಾವರಣದಲ್ಲಿ ಸಾಮಾನ್ಯವಾಗಿ ಕಾಣಿಸಿಕೊಂಡು ಗಾಳಿ ಮತ್ತು ಮಳೆಯ ಹನಿಗಳಿಂದ ಹರಡುತ್ತದೆ.",
      organic: [
        "ಬೀಜಕಗಳ ಹರಡುವಿಕೆ ಕಡಿಮೆ ಮಾಡಲು ಬೆಳಿಗ್ಗೆ 2% ಬೇವಿನ ಎಣ್ಣೆ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.",
        "ಮೊದಲ ಗುಳ್ಳೆಗಳು ಕಂಡಾಗ ಗಂಧಕದ ಪುಡಿಯನ್ನು ಸಿಂಪಡಿಸಿ.",
        "ತೀವ್ರವಾಗಿ ಸೋಂಕಿತ ಕೆಳಗಿನ ಎಲೆಗಳನ್ನು ತೆಗೆದು ಹೊಲವನ್ನು ಕಳೆರಹಿತವಾಗಿಡಿ.",
      ],
      chemical: {
        product: "ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP",
        dose: "10 ಲೀಟರ್ ನೀರಿಗೆ 30 ಗ್ರಾಂ, ಪ್ರತಿ 10 ದಿನಕ್ಕೊಮ್ಮೆ ಸಿಂಪಡಿಸಿ",
      },
      prevention: [
        "ತುಕ್ಕು ರೋಗ ನಿರೋಧಕ ಸಂಕರ ತಳಿಗಳನ್ನು ಬಿತ್ತಿರಿ.",
        "ಅತಿಯಾದ ಸಾರಜನಕ ಬಳಕೆ ಮತ್ತು ಸಂಜೆ ಎಲೆಗಳು ಒದ್ದೆಯಾಗುವುದನ್ನು ತಪ್ಪಿಸಿ.",
        "ಬೀಜಕಗಳ ಚಕ್ರವನ್ನು ಮುರಿಯಲು ಕೊಯ್ಲಿನ ನಂತರ ಹೊಲದ ಅವಶೇಷಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ.",
      ],
    },
  },
  "rice-blast": {
    id: "rice-blast",
    crop: "rice",
    family: "fungal",
    en: {
      name: "Rice Blast",
      description:
        "Diamond-shaped gray or brown lesions with darker edges on leaves; in severe cases the panicle neck rots and grain yield drops sharply.",
      organic: [
        "Amend soil with silica-rich rice-husk ash (20 kg/acre) — silica strengthens cell walls.",
        "Spray a 3% neem-oil solution at the first sign of spots.",
        "Keep water levels shallow and foliage dry to starve the fungus.",
      ],
      chemical: { product: "Tricyclazole 75% WP", dose: "0.6 g per litre (400–500 L/ha), spray 2–3 times from tillering" },
      prevention: [
        "Plant resistant varieties and certified disease-free seed.",
        "Split nitrogen doses instead of a single heavy application.",
        "Keep the field weed-free and thin the crop for airflow.",
      ],
    },
    hi: {
      name: "धान का ब्लास्ट",
      description:
        "पत्तियों पर गहरे किनारों वाले धूसर-भूरे लंबे धब्बे; गंभीर स्थिति में कणिश की गर्दन सड़कर दाने तेज़ी से घट जाते हैं।",
      organic: [
        "सिलिका आधारित खाद: धान की भूसी की राख (20 किलो/एकड़) डालें — सिलिका पौधे की दीवार मजबूत बनाती है।",
        "पहले लक्षण दिखते ही 3% नीम तेल घोल छिड़कें।",
        "पानी की गहराई कम रखें और पत्तियाँ सूखी रहें दें।",
      ],
      chemical: { product: "ट्राइसाइक्लाज़ोल 75% WP", dose: "0.6 ग्राम प्रति लीटर (400–500 L/ha), कल्ले निकलने से 2–3 स्प्रे" },
      prevention: [
        "प्रतिरोधी किस्में और प्रमाणित रोग-रहित बीज लगाएँ।",
        "नाइट्रोजन को बाँट कर दें, एक बार में भारी मात्रा नहीं।",
        "खेत को खरपतवार मुक्त रखें और पौधों में दूरी बनाएँ।",
      ],
    },
    es: {
      name: "Piricularia (añublo del arroz)",
      description:
        "Lesiones grises o marrones en forma de rombo con borde oscuro; en casos graves ataca el cuello de la panícula y baja el rendimiento.",
      organic: [
        "Aporta sílice al suelo (ceniza de cáscara de arroz, 20 kg/ha) — la sílice fortalece las paredes celulares.",
        "Rocía aceite de neem al 3% ante los primeros puntos.",
        "Mantén la lámina de agua baja y las hojas bien secas.",
      ],
      chemical: { product: "Triciclazol 75% WP", dose: "0,6 g/L (400–500 L/ha), 2–3 sprays desde el macollaje" },
      prevention: [
        "Variedades resistentes y semilla certificada libre de patógenos.",
        "Fracciona el nitrógeno en varias aplicaciones.",
        "Campos sin malezas y con buena aireación entre plantas.",
      ],
    },
    kn: {
      name: "ಭತ್ತದ ಬ್ಲಾಸ್ಟ್ ರೋಗ",
      description:
        "ಎಲೆಗಳ ಮೇಲೆ ಗಾಢ ಅಂಚುಗಳಿರುವ ಬೂದು ಅಥವಾ ಕಂದು ವಜ್ರಾಕಾರದ ಕಲೆಗಳು ಕಾಣಿಸುತ್ತವೆ. ತೀವ್ರವಾದರೆ ತೆನೆಯ ಕುತ್ತಿಗೆ ಕೊಳೆತು ಧಾನ್ಯದ ಇಳುವರಿ ಬಹಳ ಕಡಿಮೆಯಾಗುತ್ತದೆ.",
      organic: [
        "ಮಣ್ಣಿಗೆ ಸಿಲಿಕಾ ಸಮೃದ್ಧ ಭತ್ತದ ಹೊಟ್ಟು ಬೂದಿಯನ್ನು (ಎಕರೆಗೆ 20 ಕೆ.ಜಿ.) ಸೇರಿಸಿ — ಸಿಲಿಕಾ ಸಸ್ಯದ ಕೋಶಗೋಡೆಗಳನ್ನು ಬಲಪಡಿಸುತ್ತದೆ.",
        "ಮೊದಲ ಕಲೆಗಳು ಕಂಡ ತಕ್ಷಣ 3% ಬೇವಿನ ಎಣ್ಣೆ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.",
        "ಶಿಲೀಂಧ್ರದ ಬೆಳವಣಿಗೆ ತಡೆಯಲು ನೀರಿನ ಮಟ್ಟವನ್ನು ಕಡಿಮೆ ಇಟ್ಟು ಎಲೆಗಳನ್ನು ಒಣಗಿರಿಸಿ.",
      ],
      chemical: {
        product: "ಟ್ರೈಸೈಕ್ಲಜೋಲ್ 75% WP",
        dose: "ಪ್ರತಿ ಲೀಟರ್‌ಗೆ 0.6 ಗ್ರಾಂ (400–500 ಲೀ./ಹೆಕ್ಟೇರ್), ತೆಂಡೆ ಒಡೆಯುವ ಹಂತದಿಂದ 2–3 ಬಾರಿ ಸಿಂಪಡಿಸಿ",
      },
      prevention: [
        "ರೋಗ ನಿರೋಧಕ ತಳಿಗಳು ಮತ್ತು ಪ್ರಮಾಣೀಕೃತ ರೋಗಮುಕ್ತ ಬೀಜ ಬಳಸಿ.",
        "ಒಂದೇ ಬಾರಿ ಹೆಚ್ಚು ನೀಡುವ ಬದಲು ಸಾರಜನಕವನ್ನು ವಿಭಜಿಸಿ ನೀಡಿ.",
        "ಹೊಲವನ್ನು ಕಳೆರಹಿತವಾಗಿಟ್ಟು, ಗಾಳಿಯಾಟಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಸಸಿಗಳ ಸಾಂದ್ರತೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಿ.",
      ],
    },
  },
  "apple-scab": {
    id: "apple-scab",
    crop: "apple",
    family: "fungal",
    en: {
      name: "Apple Scab",
      description:
        "Olive-brown velvety spots on young leaves and fruit. In wet springs it can blister leaves and lower fruit quality.",
      organic: [
        "Rake and remove fallen leaves in autumn to interrupt the fungal cycle.",
        "Spray a raw-milk mix (1 part milk : 8 parts water) weekly early in the season.",
        "Give young leaves a kelp-extract foliar feed to strengthen them.",
      ],
      chemical: { product: "Captan 80% WDG", dose: "20 g per 10 L water, apply every 7 days" },
      prevention: [
        "Plant scab-resistant apple varieties.",
        "Prune an open canopy so leaves dry quickly after rain.",
        "Disinfect secateurs and avoid working in the tree when wet.",
      ],
    },
    hi: {
      name: "सेब का स्कैब",
      description:
        "नई पत्तियों और फलों पर जैतून-भूरे मखमली धब्बे। वसंत की नमी में पत्ते झुलस जाते हैं और फल की गुणवत्ता घटती है।",
      organic: [
        "पतझड़ में गिरी पत्तियों को झाड़कर हटा दें — फफूंद के चक्र को तोड़ें।",
        "मौसम की शुरुआत में कच्चे दूध का घोल (1 भाग दूध : 8 भाग पानी) साप्ताहिक छिड़कें।",
        "नई पत्तियों को केल्प सत्व पर्ण-खाद दें ताकि वे मजबूत हों।",
      ],
      chemical: { product: "कैप्टान 80% WDG", dose: "हर 7 दिन में छिड़काव (लेबल अनुसार मात्रा)" },
      prevention: [
        "स्कैब-प्रतिरोधी सेब किस्में ही लगाएँ।",
        "छाई से पेड़ का दायरा खुला रखें ताकि पत्तियाँ बारिश के बाद जल्दी सूखें।",
        "गीले मौसम में पेड़ पर काम न करें; औज़ार साफ़ रखें।",
      ],
    },
    es: {
      name: "Roña (Venturia) del manzano",
      description:
        "Manchas aterciopeladas verde-oliva en hojas y frutos jóvenes; en primaveras húmedas quema las hojas y baja la calidad del fruto.",
      organic: [
        "Rastrilla y retira las hojas caídas en otoño para cortar el ciclo del hongo.",
        "Rocía una mezcla de leche cruda (1 de leche : 8 de agua) cada semana al inicio de la temporada.",
        "Aplica un foliar de extracto de algas a las hojas jóvenes.",
      ],
      chemical: { product: "Captan 80% WDG", dose: "20 g por 10 L de agua, cada 7 días" },
      prevention: [
        "Planta variedades de manzano resistentes a la roña.",
        "Poda la copa abierta para que seque rápido tras la lluvia.",
        "Desinfecta las tijeras y no toques el árbol húmedo.",
      ],
    },
    kn: {
      name: "ಸೇಬಿನ ಸ್ಕ್ಯಾಬ್ ರೋಗ",
      description:
        "ಎಳೆಯ ಎಲೆಗಳು ಮತ್ತು ಹಣ್ಣುಗಳ ಮೇಲೆ ಆಲಿವ್-ಕಂದು ಬಣ್ಣದ ಮೃದುವಾದ ಕಲೆಗಳು ಕಾಣಿಸುತ್ತವೆ. ತೇವದ ವಸಂತಕಾಲದಲ್ಲಿ ಎಲೆಗಳಿಗೆ ಹಾನಿಯಾಗಿ ಹಣ್ಣಿನ ಗುಣಮಟ್ಟ ಕಡಿಮೆಯಾಗಬಹುದು.",
      organic: [
        "ಶಿಲೀಂಧ್ರದ ಚಕ್ರವನ್ನು ಮುರಿಯಲು ಶರತ್ಕಾಲದಲ್ಲಿ ಬಿದ್ದ ಎಲೆಗಳನ್ನು ಗುಡಿಸಿ ತೆಗೆದುಹಾಕಿ.",
        "ಋತುವಿನ ಆರಂಭದಲ್ಲಿ ಹಸಿ ಹಾಲು ಮತ್ತು ನೀರಿನ ಮಿಶ್ರಣವನ್ನು (1 ಭಾಗ ಹಾಲು : 8 ಭಾಗ ನೀರು) ವಾರಕ್ಕೊಮ್ಮೆ ಸಿಂಪಡಿಸಿ.",
        "ಎಳೆಯ ಎಲೆಗಳನ್ನು ಬಲಪಡಿಸಲು ಕಡಲಕಳೆ ಸಾರದ ಎಲೆಗೊಬ್ಬರ ನೀಡಿ.",
      ],
      chemical: {
        product: "ಕ್ಯಾಪ್ಟಾನ್ 80% WDG",
        dose: "10 ಲೀಟರ್ ನೀರಿಗೆ 20 ಗ್ರಾಂ, ಪ್ರತಿ 7 ದಿನಕ್ಕೊಮ್ಮೆ ಬಳಸಿ",
      },
      prevention: [
        "ಸ್ಕ್ಯಾಬ್ ರೋಗ ನಿರೋಧಕ ಸೇಬಿನ ತಳಿಗಳನ್ನು ನೆಡಿ.",
        "ಮಳೆಯ ನಂತರ ಎಲೆಗಳು ಬೇಗ ಒಣಗಲು ಮರದ ಕೊಂಬೆಗಳನ್ನು ವಿರಳವಾಗಿ ಕತ್ತರಿಸಿ.",
        "ಕತ್ತರಿಸುವ ಉಪಕರಣಗಳನ್ನು ಸೋಂಕುರಹಿತಗೊಳಿಸಿ; ಮರ ಒದ್ದೆಯಾಗಿರುವಾಗ ಕೆಲಸ ಮಾಡಬೇಡಿ.",
      ],
    },
  },
  "healthy-leaf": {
    id: "healthy-leaf",
    crop: "generic",
    family: "none",
    en: {
      name: "Healthy Leaf",
      description:
        "No disease patterns detected. The leaf shows an even green color and a natural, healthy texture.",
      organic: [
        "Keep a fixed watering schedule at the base of the plant.",
        "Add balanced organic compost twice a season.",
        "Mulch around the plant to keep soil moist and hold weeds back.",
      ],
      chemical: { product: "None needed", dose: "—" },
      prevention: [
        "Check the underside of leaves once a week.",
        "Keep the field free of weeds and standing water.",
        "Rotate crops each season to keep soil healthy.",
      ],
    },
    hi: {
      name: "स्वस्थ पत्ती",
      description:
        "कोई रोग संकेत नहीं मिला। पत्ती समान हरी और प्राकृतिक चमक के साथ लगती है, बिल्कुल स्वस्थ।",
      organic: [
        "पौधे की जड़ के पास नियत समय पर पानी दें।",
        "महीने में दो बार संतुलित जैविक खाद दें।",
        "पौधे के चारों ओर गीली घास (मल्च) बिछाएँ ताकि नमी बनी रहे।",
      ],
      chemical: { product: "कोई ज़रूरत नहीं", dose: "—" },
      prevention: [
        "हर हफ़्ते पत्तियों के नीचे की ओर जाँच करें।",
        "खेत में खरपतवार और ठहरा पानी न रहने दें।",
        "हर मौसम में फसल बदलें ताकि मिट्टी स्वस्थ रह सके।",
      ],
    },
    es: {
      name: "Hoja sana",
      description:
        "No se detectan patrones de enfermedad. La hoja muestra un verde uniforme y una textura sana y pareja.",
      organic: [
        "Mantén un horario fijo de riego a la base de la planta.",
        "Agrega compost orgánico balanceado dos veces por temporada.",
        "Pon acolchado en la base para conservar la humedad y frenar malezas.",
      ],
      chemical: { product: "No se requiere", dose: "—" },
      prevention: [
        "Revisa el envés de las hojas una vez a la semana.",
        "Mantén la parcela libre de malezas y estanques.",
        "Rota los cultivos cada temporada para conservar el suelo.",
      ],
    },
    kn: {
      name: "ಆರೋಗ್ಯಕರ ಎಲೆ",
      description:
        "ರೋಗದ ಲಕ್ಷಣಗಳು ಪತ್ತೆಯಾಗಿಲ್ಲ. ಎಲೆ ಸಮಾನ ಹಸಿರು ಬಣ್ಣ ಮತ್ತು ಸಹಜ ಆರೋಗ್ಯಕರ ಮೇಲ್ಮೈಯನ್ನು ಹೊಂದಿದೆ.",
      organic: [
        "ಸಸ್ಯದ ಬುಡಕ್ಕೆ ನಿಗದಿತ ವೇಳಾಪಟ್ಟಿಯಂತೆ ನೀರು ಹಾಕಿ.",
        "ಪ್ರತಿ ಋತುವಿನಲ್ಲಿ ಎರಡು ಬಾರಿ ಸಮತೋಲಿತ ಸಾವಯವ ಕಾಂಪೋಸ್ಟ್ ಸೇರಿಸಿ.",
        "ಮಣ್ಣಿನ ತೇವ ಉಳಿಸಲು ಮತ್ತು ಕಳೆ ತಡೆಯಲು ಸಸ್ಯದ ಸುತ್ತ ಮಲ್ಚ್ ಹಾಕಿ.",
      ],
      chemical: { product: "ಅಗತ್ಯವಿಲ್ಲ", dose: "—" },
      prevention: [
        "ವಾರಕ್ಕೊಮ್ಮೆ ಎಲೆಗಳ ಕೆಳಭಾಗವನ್ನು ಪರಿಶೀಲಿಸಿ.",
        "ಹೊಲವನ್ನು ಕಳೆ ಮತ್ತು ನಿಂತ ನೀರಿನಿಂದ ಮುಕ್ತವಾಗಿಡಿ.",
        "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾಪಾಡಲು ಪ್ರತಿ ಋತುವಿನಲ್ಲಿ ಬೆಳೆ ಪರಿವರ್ತನೆ ಮಾಡಿ.",
      ],
    },
  },
  "unclassified-disease": {
    id: "unclassified-disease",
    crop: "generic",
    family: "unknown",
    en: {
      name: "Possible crop disease",
      description:
        "The image model flagged a possible issue, but this condition does not have a verified guide in AgriGuard.",
      organic: [
        "Take clear photos of both sides of the leaf and monitor whether symptoms spread.",
        "Avoid applying pesticides based only on this automated prediction.",
        "Ask a local agricultural extension worker to confirm the diagnosis before treating the crop.",
      ],
      chemical: { product: "Not recommended without confirmation", dose: "—" },
      prevention: [
        "Check nearby plants for similar symptoms.",
        "Keep leaves dry when watering and allow air to circulate between plants.",
        "Use locally recommended practices for the selected crop.",
      ],
    },
    hi: {
      name: "संभावित फसल रोग",
      description:
        "चित्र मॉडल ने संभावित समस्या बताई है, लेकिन AgriGuard में इस स्थिति के लिए सत्यापित मार्गदर्शन उपलब्ध नहीं है।",
      organic: [
        "पत्ती के दोनों ओर की साफ़ तस्वीरें लें और लक्षणों के फैलने पर नज़र रखें।",
        "केवल इस स्वचालित अनुमान के आधार पर कीटनाशक न डालें।",
        "फसल का उपचार करने से पहले स्थानीय कृषि विशेषज्ञ से निदान की पुष्टि करें।",
      ],
      chemical: { product: "पुष्टि के बिना उपयोग न करें", dose: "—" },
      prevention: [
        "पास के पौधों में ऐसे ही लक्षण देखें।",
        "पानी देते समय पत्तियों को गीला न करें और पौधों के बीच हवा आने दें।",
        "चुनी गई फसल के लिए स्थानीय रूप से सुझाए गए तरीके अपनाएँ।",
      ],
    },
    es: {
      name: "Posible enfermedad del cultivo",
      description:
        "El modelo de imagen señaló un posible problema, pero AgriGuard no tiene una guía verificada para esta condición.",
      organic: [
        "Toma fotos claras de ambos lados de la hoja y observa si los síntomas se extienden.",
        "No apliques pesticidas basándote únicamente en esta predicción automática.",
        "Pide a un servicio agrícola local que confirme el diagnóstico antes de tratar el cultivo.",
      ],
      chemical: { product: "No recomendado sin confirmación", dose: "—" },
      prevention: [
        "Revisa si hay síntomas similares en las plantas cercanas.",
        "Evita mojar las hojas al regar y deja circular el aire entre las plantas.",
        "Sigue las prácticas recomendadas localmente para el cultivo seleccionado.",
      ],
    },
    kn: {
      name: "ಬೆಳೆಗೆ ಸಂಭವನೀಯ ರೋಗ",
      description:
        "ಚಿತ್ರ ಮಾದರಿಯು ಸಂಭವನೀಯ ಸಮಸ್ಯೆಯನ್ನು ಗುರುತಿಸಿದೆ, ಆದರೆ ಈ ಸ್ಥಿತಿಗೆ AgriGuard ನಲ್ಲಿ ಪರಿಶೀಲಿತ ಮಾರ್ಗದರ್ಶಿ ಇಲ್ಲ.",
      organic: [
        "ಎಲೆಯ ಎರಡೂ ಬದಿಗಳ ಸ್ಪಷ್ಟ ಚಿತ್ರಗಳನ್ನು ತೆಗೆದು, ಲಕ್ಷಣಗಳು ಹರಡುತ್ತಿವೆಯೇ ಗಮನಿಸಿ.",
        "ಈ ಸ್ವಯಂಚಾಲಿತ ಊಹೆಯ ಆಧಾರದ ಮೇಲೆ ಮಾತ್ರ ಕೀಟನಾಶಕಗಳನ್ನು ಬಳಸಬೇಡಿ.",
        "ಬೆಳೆಗೆ ಚಿಕಿತ್ಸೆ ನೀಡುವ ಮೊದಲು ಸ್ಥಳೀಯ ಕೃಷಿ ತಜ್ಞರಿಂದ ರೋಗನಿರ್ಣಯವನ್ನು ದೃಢಪಡಿಸಿಕೊಳ್ಳಿ.",
      ],
      chemical: { product: "ದೃಢೀಕರಣವಿಲ್ಲದೆ ಶಿಫಾರಸು ಮಾಡುವುದಿಲ್ಲ", dose: "—" },
      prevention: [
        "ಹತ್ತಿರದ ಸಸ್ಯಗಳಲ್ಲಿ ಇದೇ ರೀತಿಯ ಲಕ್ಷಣಗಳಿವೆಯೇ ಪರಿಶೀಲಿಸಿ.",
        "ನೀರು ಹಾಕುವಾಗ ಎಲೆಗಳನ್ನು ಒದ್ದೆ ಮಾಡಬೇಡಿ ಮತ್ತು ಸಸ್ಯಗಳ ನಡುವೆ ಗಾಳಿಯಾಡಲು ಬಿಡಿ.",
        "ಆಯ್ಕೆ ಮಾಡಿದ ಬೆಳೆಗೆ ಸ್ಥಳೀಯವಾಗಿ ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮಗಳನ್ನು ಅನುಸರಿಸಿ.",
      ],
    },
  },
};

export function getDisease(id: DiseaseId): Disease {
  return DISEASES[id];
}

export function getLocalized(disease: Disease, lang: Lang): LocalizedBlock {
  return disease[lang] ?? disease.en;
}

export const DISEASE_IDS = Object.keys(DISEASES) as DiseaseId[];