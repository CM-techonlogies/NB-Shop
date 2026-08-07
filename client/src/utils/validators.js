export const validatePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return 'Phone number must be 10 digits';
  if (!/^[6-9]/.test(cleaned)) return 'Enter a valid Indian mobile number';
  return null;
};

export const validatePincode = (pin) => {
  if (!/^[1-9][0-9]{5}$/.test(pin)) return 'Enter a valid 6-digit pincode';
  return null;
};

export const validateEmail = (email) => {
  if (!email) return null; // optional
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return null;
};
