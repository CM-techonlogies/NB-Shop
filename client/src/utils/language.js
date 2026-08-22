/**
 * Utility functions for Hindi / English Product & Category Localization
 */

// Dictionary mapping common Kirana terms to Hindi Devnagari script
const KIRANA_DICTIONARY = {
  'aata': 'आटा',
  'atta': 'आटा',
  'wheat flour': 'गेहूं का आटा',
  'suji': 'सूजी',
  'sooji': 'सूजी',
  'semolina': 'सूजी',
  'maida': 'मैदा',
  'besan': 'बेसन',
  'gram flour': 'बेसन',
  'chawal': 'चावल',
  'rice': 'चावल',
  'basmati rice': 'बासमती चावल',
  'basmati rice - loose': 'बासमती चावल (खुला)',
  'sarso tel': 'सरसों का तेल',
  'sarso tel / mustard oil': 'सरसों का तेल',
  'mustard oil': 'सरसों का तेल',
  'refined oil': 'रिफाइंड तेल',
  'oil': 'तेल',
  'ghee': 'शुद्ध देसी घी',
  'sugar': 'चीनी',
  'cheeni': 'चीनी',
  'doodh': 'दूध',
  'milk': 'दूध',
  'namak': 'नमक',
  'salt': 'नमक',
  'chai': 'चाय की पत्ती',
  'tea': 'चाय',
  'coffee': 'कॉफी',
  'haldi': 'हल्दी',
  'turmeric': 'हल्दी',
  'mirch': 'लाल मिर्च',
  'chilli': 'मिर्च',
  'dhania': 'धनिया पाउडर',
  'coriander': 'धनिया',
  'jeera': 'जीरा',
  'cumin': 'जीरा',
  'dal': 'दाल',
  'pulses': 'दालें',
  'toor dal': 'अरहर / तुअर दाल',
  'arhar dal': 'अरहर दाल',
  'moong dal': 'मूंग दाल',
  'chana dal': 'चना दाल',
  'urad dal': 'उड़द दाल',
  'rajma': 'राजमा',
  'chole': 'चना / छोले',
  'chana': 'चना',
  'potato': 'आलू',
  'aloo': 'आलू',
  'onion': 'प्याज़',
  'pyaz': 'प्याज़',
  'tomato': 'टमाटर',
  'tamatar': 'टमाटर',
  'cold drink': 'कोल्ड ड्रिंक',
  'soft drink': 'कोल्ड ड्रिंक',
  'coke': 'कोका कोला',
  'water bottle': 'पानी की बोतल',
  'soap': 'साबुन',
  'detergent': 'डिटर्जेंट पाउडर',
  'surf': 'सर्फ / डिटर्जेंट',
  'tide': 'टाइड डिटर्जेंट',
  'tide-2l': 'टाइड 2 लीटर',
  'purex': 'प्योरेक्स',
  'notebook': 'नोटबुक / कॉपी',
  'classmate notebook': 'क्लासमेट नोटबुक',
  'pen': 'पेन / कलम',
};

/**
 * Extract custom Hindi name from product.name_hi or tags array (e.g. "hi:हिंदी नाम")
 */
export function getHindiFromTags(tags) {
  if (!Array.isArray(tags)) return null;
  const tag = tags.find(t => typeof t === 'string' && (t.startsWith('hi:') || t.startsWith('name_hi:')));
  if (tag) {
    return tag.replace(/^(hi:|name_hi:)/, '').trim();
  }
  return null;
}

/**
 * Get product name localized to current language ('en' | 'hi')
 */
export function getProductName(product, lang = 'en') {
  if (!product) return '';
  const rawName = typeof product === 'string' ? product : (product.name || '');

  // If language is English
  if (lang !== 'hi') {
    // If rawName is "English / Hindi", extract English part
    if (rawName.includes('/') && /[\u0900-\u097F]/.test(rawName)) {
      const parts = rawName.split('/');
      return parts[0].trim();
    }
    return rawName;
  }

  // Language is Hindi ('hi'):
  // 1. Check if product object has explicit name_hi or tag hi:...
  if (typeof product === 'object' && product !== null) {
    if (product.name_hi) return product.name_hi;
    const tagHindi = getHindiFromTags(product.tags);
    if (tagHindi) return tagHindi;
  }

  // 2. Check if rawName already contains Hindi Devnagari script
  if (/[\u0900-\u097F]/.test(rawName)) {
    return rawName;
  }

  // 3. Check dictionary for exact or partial matches
  const lower = rawName.trim().toLowerCase();
  if (KIRANA_DICTIONARY[lower]) {
    return KIRANA_DICTIONARY[lower];
  }

  // Try matching words in title
  for (const [key, val] of Object.entries(KIRANA_DICTIONARY)) {
    if (lower.includes(key)) {
      return KIRANA_DICTIONARY[key];
    }
  }

  return rawName;
}

/**
 * Get product description localized to current language
 */
export function getProductDescription(product, lang = 'en') {
  if (!product) return '';
  if (typeof product === 'string') return product;
  
  if (lang === 'hi') {
    if (product.description_hi) return product.description_hi;
    if (product.description && /[\u0900-\u097F]/.test(product.description)) {
      return product.description;
    }
  }
  return product.description || '';
}
