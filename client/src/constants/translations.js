// ── Category Hindi Name Mapping ────────────────────────────────────────────
// Maps English category names (from DB) → Hindi names
// Add new categories here as they are created in admin panel
export const CATEGORY_HINDI_MAP = {
  "oil's":       "तेल",
  "oils":        "तेल",
  "oil":         "तेल",
  "vegetables":  "सब्ज़ियाँ",
  "grains":      "अनाज",
  "bottles":     "बोतलें",
  "detergents":  "डिटर्जेंट",
  "soft drink":  "कोल्ड ड्रिंक",
  "soft drinks": "कोल्ड ड्रिंक",
  "study":       "स्टेशनरी",
};

/**
 * Returns category name in current language.
 * Falls back to English name if no Hindi mapping found.
 * @param {string} name - English category name from DB
 * @param {string} language - 'en' or 'hi'
 */
export const getCategoryName = (name, language) => {
  if (!name) return '';
  if (language !== 'hi') return name;
  return CATEGORY_HINDI_MAP[name.trim().toLowerCase()] || name;
};

export const TRANSLATIONS = {
  en: {
    // Navigation
    home: "Home",
    categories: "Categories",
    cart: "Cart",
    orders: "My Orders",
    profile: "Profile",
    login: "Login",
    logout: "Logout",
    search_placeholder: "Search rice, oil, spices...",
    search_btn: "Search",
    
    // Homepage
    shop_by_category: "Shop by Category",
    see_all: "See all",
    express_delivery: "Express Delivery",
    express_desc: "Get your order delivered fast",
    best_offers: "Best Offers",
    offers_desc: "Grab exciting discounts & offers",
    repeat_order: "Repeat Order",
    repeat_desc: "Order your previous items again",
    new_arrivals: "New Arrivals",
    arrivals_desc: "Explore newly added products",
    cant_find: "Can't find what you're looking for?",
    browse_all_products: "Browse All Products →",
    
    // Product Card & Cart Page
    add_to_cart: "+ Add to Cart",
    in_cart: "in cart",
    out_of_stock: "Out of Stock",
    in_stock: "In Stock",
    view_cart: "View Cart",
    my_cart: "My Cart",
    clear_cart: "Clear Cart",
    add_more_items: "Add More Items",
    your_cart_is_empty: "Your cart is empty",
    cart_empty_desc: "Looks like you haven't added anything to your cart yet. Browse our products and find something you like!",
    shop_now: "Shop Now",
    select_qty: "⚖️ Select Qty",
    loose: "LOOSE",
    fast_delivery: "⚡ Fast Delivery",
    free_delivery: "🚚 Free Delivery",

    // Product Detail Page
    inclusive_of_taxes: "Inclusive of all taxes",
    quality_assured: "Quality Assured",
    product_details: "Product Details",
    similar_products: "Similar Products",
    quantity_in_cart: "Quantity in Cart:",

    // Profile Page
    edit_profile: "Edit Profile",
    cancel: "Cancel",
    full_name_label: "Full Name",
    phone_number_label: "Phone Number",
    email_label: "Email",
    save_changes: "Save Changes",
    saving: "Saving...",
    member_since: "Member since",

    // Cart Summary
    order_summary: "Order Summary",
    item_total: "Item Total",
    add_more_for_free: "Add {{amount}} more for free delivery",
    delivery_charge: "Delivery Charge",
    free: "FREE",
    to_pay: "To Pay",
    proceed_checkout: "Proceed to Checkout",
    safe_checkout: "100% Safe & Verified Checkout",
    
    // Checkout Page
    secure_checkout: "Secure Checkout",
    delivery_details: "Delivery Details",
    detect_gps: "Detect Current GPS Location (Required *)",
    gps_attached: "GPS Location Attached ✓",
    gps_locating: "Locating GPS...",
    gps_required_msg: "GPS Location Required: Please tap the button above to detect your delivery coordinates before placing your order.",
    full_name: "Full Name *",
    phone_number: "Phone Number *",
    complete_address: "Complete Address *",
    pincode: "Pincode *",
    city: "City *",
    landmark: "Landmark (Optional)",
    delivery_notes: "Delivery Notes (Optional)",
    payment_method: "Payment Method",
    cod_title: "Cash on Delivery (COD)",
    cod_desc: "Pay in cash directly to the delivery agent at your doorstep.",
    need_change: "Need Change?",
    upi_title: "Online UPI / QR Code Payment",
    upi_desc: "Pay using Google Pay, PhonePe, Paytm, or BHIM UPI.",
    store_upi_id: "Store UPI ID:",
    copy: "Copy",
    place_order: "Place Order",
    processing: "Processing...",
    
    // Order Detail
    order_status: "Order Status",
    items_ordered: "Items Ordered",
    payment_verification: "Payment Verification",
    upload_screenshot: "📤 Upload Payment Screenshot",
    reorder_items: "🔄 Reorder Items",

    // PWA Prompt
    install_app_title: "Install NB Shop App",
    install_app_desc: "Add to your Home Screen for fast 1-tap grocery access",
    add_to_home_screen: "Add to Home Screen",
    how_to_install: "📖 How to Install",
    
    // Language Switcher
    language: "Language",
  },
  hi: {
    // Navigation
    home: "होम",
    categories: "कैटेगरी",
    cart: "कार्ट",
    orders: "मेरे ऑर्डर",
    profile: "प्रोफाइल",
    login: "लॉगिन",
    logout: "लॉगआउट",
    search_placeholder: "चावल, तेल, मसाले खोजें...",
    search_btn: "खोजें",
    
    // Homepage
    shop_by_category: "कैटेगरी अनुसार खरीदें",
    see_all: "सभी देखें",
    express_delivery: "एक्सप्रेस डिलीवरी",
    express_desc: "तेज़ डिलीवरी सीधे आपके घर",
    best_offers: "बेस्ट ऑफर्स",
    offers_desc: "विशेष छूट और ऑफर्स पाएं",
    repeat_order: "दोबारा ऑर्डर करें",
    repeat_desc: "पुराने सामान फिर से मंगाएं",
    new_arrivals: "नए सामान",
    arrivals_desc: "स्टोर में नए जुड़े उत्पाद",
    cant_find: "क्या आपको वह नहीं मिला जो आप खोज रहे हैं?",
    browse_all_products: "सभी उत्पाद देखें →",
    
    // Product Card & Cart Page
    add_to_cart: "+ कार्ट में जोड़ें",
    in_cart: "कार्ट में हैं",
    out_of_stock: "आउट ऑफ स्टॉक",
    in_stock: "स्टॉक में है",
    view_cart: "कार्ट देखें",
    my_cart: "मेरी कार्ट",
    clear_cart: "कार्ट खाली करें",
    add_more_items: "और सामान जोड़ें",
    your_cart_is_empty: "आपकी कार्ट खाली है",
    cart_empty_desc: "आपने अभी तक कार्ट में कोई सामान नहीं जोड़ा है। हमारे प्रॉडक्ट्स देखें और अपनी पसंद का सामान चुनें!",
    shop_now: "अभी खरीदारी करें",
    select_qty: "⚖️ मात्रा चुनें",
    loose: "खुला",
    fast_delivery: "⚡ तेज़ डिलीवरी",
    free_delivery: "🚚 मुफ़्त डिलीवरी",

    // Product Detail Page
    inclusive_of_taxes: "सभी करों सहित",
    quality_assured: "गुणवत्ता की गारंटी",
    product_details: "उत्पाद विवरण",
    similar_products: "समान उत्पाद",
    quantity_in_cart: "कार्ट में मात्रा:",

    // Profile Page
    edit_profile: "प्रोफाइल एडिट करें",
    cancel: "रद्द करें",
    full_name_label: "पूरा नाम",
    phone_number_label: "फोन नंबर",
    email_label: "ईमेल",
    save_changes: "बदलाव सेव करें",
    saving: "सेव हो रहा है...",
    member_since: "सदस्यता:",

    // Cart Summary
    order_summary: "ऑर्डर सारांश",
    item_total: "सामान का कुल मूल्य",
    add_more_for_free: "मुफ्त डिलीवरी के लिए {{amount}} का सामान और जोड़ें",
    delivery_charge: "डिलीवरी शुल्क",
    free: "मुफ्त (FREE)",
    to_pay: "कुल देय राशि",
    proceed_checkout: "चेकआउट करें",
    safe_checkout: "100% सुरक्षित और सत्यापित चेकआउट",
    
    // Checkout Page
    secure_checkout: "सुरक्षित चेकआउट",
    delivery_details: "डिलीवरी का पता",
    detect_gps: "GPS लोकेशन पता करें (अनिवार्य *)",
    gps_attached: "GPS लोकेशन जुड़ गई ✓",
    gps_locating: "लोकेशन खोज रहे हैं...",
    gps_required_msg: "GPS लोकेशन अनिवार्य है: कृपया ऑर्डर प्लेस करने से पहले ऊपर दिए गए बटन पर टैप करें।",
    full_name: "पूरा नाम *",
    phone_number: "मोबाइल नंबर *",
    complete_address: "पूरा पता (मकान नंबर, गली) *",
    pincode: "पिनकोड *",
    city: "शहर *",
    landmark: "लैंडमार्क (ऐच्छिक)",
    delivery_notes: "डिलीवरी नोट (ऐच्छिक)",
    payment_method: "भुगतान का तरीका",
    cod_title: "कैश ऑन डिलीवरी (COD)",
    cod_desc: "सामान मिलने पर डिलीवरी वाले को नकद भुगतान करें।",
    need_change: "छुट्टे पैसे चाहिए?",
    upi_title: "ऑनलाइन UPI / QR कोड भुगतान",
    upi_desc: "Google Pay, PhonePe, Paytm या BHIM से भुगतान करें।",
    store_upi_id: "स्टोर UPI ID:",
    copy: "कॉपी करें",
    place_order: "ऑर्डर प्लेस करें",
    processing: "प्रोसेस हो रहा है...",
    
    // Order Detail
    order_status: "ऑर्डर की स्थिति",
    items_ordered: "ऑर्डर किए गए सामान",
    payment_verification: "भुगतान सत्यापन",
    upload_screenshot: "📤 पेमेंट स्क्रीनशॉट अपलोड करें",
    reorder_items: "🔄 दोबारा मंगाएं",

    // PWA Prompt
    install_app_title: "NB Shop ऐप इंस्टॉल करें",
    install_app_desc: "1-टैप में किराने के सामान के लिए होम स्क्रीन पर जोड़ें",
    add_to_home_screen: "होम स्क्रीन पर जोड़ें",
    how_to_install: "📖 कैसे इंस्टॉल करें",
    
    // Language Switcher
    language: "भाषा",
  }
};
