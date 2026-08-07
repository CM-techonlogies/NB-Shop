const Setting = require('../models/Setting');

const generateInvoiceId = async () => {
  const settings = await Setting.getSetting();
  const counter = settings.invoiceCounter || 10000;
  
  settings.invoiceCounter = counter + 1;
  await settings.save();
  
  const prefix = settings.invoicePrefix || 'INV';
  return `${prefix}-${counter}`;
};

module.exports = generateInvoiceId;
