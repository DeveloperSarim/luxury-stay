// Form Validation Utilities - Roman Urdu Messages

export const validateEmail = (email) => {
  if (!email) {
    return 'Email zaroori hai';
  }
  // Check if email starts with symbol or dot
  if (/^[^a-zA-Z0-9]/.test(email.trim())) {
    return 'Email symbol ya dot se shuru nahi ho sakta';
  }
  const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return 'Valid email address dalain (e.g., user@example.com)';
  }
  return '';
};

export const validatePhone = (phone) => {
  if (!phone) {
    return 'Phone number zaroori hai';
  }
  // Allow digits, spaces, dashes, and plus sign
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    return 'Sirf numbers, spaces, dashes allowed hain';
  }
  // Remove non-digits for length check
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    return 'Phone number kam se kam 10 digits ka hona chahiye';
  }
  if (digitsOnly.length > 15) {
    return 'Phone number zyada lamba hai (max 15 digits)';
  }
  return '';
};

export const validateText = (text, fieldName = 'Field', minLength = 1, maxLength = 100) => {
  if (!text || text.trim().length === 0) {
    return `${fieldName} zaroori hai`;
  }
  if (text.trim().length < minLength) {
    return `${fieldName} kam se kam ${minLength} characters ka hona chahiye`;
  }
  if (text.length > maxLength) {
    return `${fieldName} zyada lamba hai (max ${maxLength} characters)`;
  }
  // Check for only special characters
  if (!/[\w\u0600-\u06FF]/.test(text)) {
    return `${fieldName} mein kuch valid text hona chahiye`;
  }
  return '';
};

export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return 'Name zaroori hai';
  }
  // Check if name starts with symbol or dot
  if (/^[^a-zA-Z\u0600-\u06FF]/.test(name.trim())) {
    return 'Name symbol ya dot se shuru nahi ho sakta';
  }
  if (name.trim().length < 2) {
    return 'Name kam se kam 2 characters ka hona chahiye';
  }
  if (name.length > 50) {
    return 'Name zyada lamba hai (max 50 characters)';
  }
  // Allow only letters and spaces (no symbols, no dots)
  const nameRegex = /^[a-zA-Z\u0600-\u06FF\s]+$/;
  if (!nameRegex.test(name)) {
    return 'Name mein sirf letters aur spaces allowed hain (symbols allowed nahi)';
  }
  return '';
};

export const validatePassword = (password, minLength = 6) => {
  if (!password) {
    return 'Password zaroori hai';
  }
  if (password.length < minLength) {
    return `Password kam se kam ${minLength} characters ka hona chahiye`;
  }
  if (password.length > 128) {
    return 'Password zyada lamba hai (max 128 characters)';
  }
  return '';
};

export const validateNumber = (value, fieldName = 'Number', min = null, max = null, allowDecimal = false) => {
  if (value === '' || value === null || value === undefined) {
    return `${fieldName} zaroori hai`;
  }
  
  const numValue = allowDecimal ? parseFloat(value) : parseInt(value, 10);
  
  if (isNaN(numValue)) {
    return `${fieldName} valid number hona chahiye`;
  }
  
  if (!allowDecimal && !Number.isInteger(numValue)) {
    return `${fieldName} integer hona chahiye (decimal allowed nahi)`;
  }
  
  if (min !== null && numValue < min) {
    return `${fieldName} kam se kam ${min} hona chahiye`;
  }
  
  if (max !== null && numValue > max) {
    return `${fieldName} zyada se zyada ${max} hona chahiye`;
  }
  
  return '';
};

export const validateDate = (date, fieldName = 'Date', minDate = null, maxDate = null) => {
  if (!date) {
    return `${fieldName} zaroori hai`;
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return `Valid ${fieldName} dalain`;
  }
  
  if (minDate) {
    const minDateObj = new Date(minDate);
    if (dateObj < minDateObj) {
      return `${fieldName} ${minDate} se pehle nahi ho sakta`;
    }
  }
  
  if (maxDate) {
    const maxDateObj = new Date(maxDate);
    if (dateObj > maxDateObj) {
      return `${fieldName} ${maxDate} se baad nahi ho sakta`;
    }
  }
  
  return '';
};

export const validateDateRange = (startDate, endDate, startFieldName = 'Start Date', endFieldName = 'End Date') => {
  if (!startDate || !endDate) {
    return '';
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (end <= start) {
    return `${endFieldName} ${startFieldName} se baad hona chahiye`;
  }
  
  return '';
};

export const validateRequired = (value, fieldName = 'Field') => {
  if (value === '' || value === null || value === undefined) {
    return `${fieldName} zaroori hai`;
  }
  return '';
};

// Combined validation function
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach((field) => {
    const rules = validationRules[field];
    const value = formData[field];
    
    // Check required
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors[field] = rules.requiredMessage || `${field} zaroori hai`;
      return;
    }
    
    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return;
    }
    
    // Email validation
    if (rules.email) {
      const emailError = validateEmail(value);
      if (emailError) {
        errors[field] = emailError;
        return;
      }
    }
    
    // Phone validation
    if (rules.phone) {
      const phoneError = validatePhone(value);
      if (phoneError) {
        errors[field] = phoneError;
        return;
      }
    }
    
    // Text validation
    if (rules.text) {
      const textError = validateText(value, rules.fieldName || field, rules.minLength, rules.maxLength);
      if (textError) {
        errors[field] = textError;
        return;
      }
    }
    
    // Name validation
    if (rules.name) {
      const nameError = validateName(value);
      if (nameError) {
        errors[field] = nameError;
        return;
      }
    }
    
    // Password validation
    if (rules.password) {
      const passwordError = validatePassword(value, rules.minLength);
      if (passwordError) {
        errors[field] = passwordError;
        return;
      }
    }
    
    // Number validation
    if (rules.number) {
      const numberError = validateNumber(value, rules.fieldName || field, rules.min, rules.max, rules.allowDecimal);
      if (numberError) {
        errors[field] = numberError;
        return;
      }
    }
    
    // Date validation
    if (rules.date) {
      const dateError = validateDate(value, rules.fieldName || field, rules.minDate, rules.maxDate);
      if (dateError) {
        errors[field] = dateError;
        return;
      }
    }
    
    // Custom validation
    if (rules.custom && typeof rules.custom === 'function') {
      const customError = rules.custom(value, formData);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });
  
  return errors;
};

