// ============================================
// UTILS/VALIDATORS.TS - Validazioni Riusabili
// ============================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// ============================================
// VALIDATORI GENERICI
// ============================================

export const validateBodyExists = (body: any): ValidationResult => {
  if (!body || Object.keys(body).length === 0) {
    return {
      isValid: false,
      error: 'Body richiesta mancante o vuoto'
    };
  }
  return { isValid: true };
};

export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  if (value === undefined || value === null || value === '') {
    return {
      isValid: false,
      error: `${fieldName} è obbligatorio`
    };
  }
  return { isValid: true };
};

export const validateNumber = (value: any, fieldName: string): ValidationResult => {
  if (typeof value !== 'number' || isNaN(value)) {
    return {
      isValid: false,
      error: `${fieldName} deve essere un numero valido`
    };
  }
  return { isValid: true };
};

export const validatePositive = (value: number, fieldName: string): ValidationResult => {
  if (value < 0) {
    return {
      isValid: false,
      error: `${fieldName} deve essere positivo o zero`
    };
  }
  return { isValid: true };
};

export const validateString = (
  value: any, 
  fieldName: string, 
  minLength: number = 1, 
  maxLength: number = 255
): ValidationResult => {
  if (typeof value !== 'string') {
    return {
      isValid: false,
      error: `${fieldName} deve essere una stringa`
    };
  }
  
  const trimmed = value.trim();
  
  if (trimmed.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} deve avere almeno ${minLength} caratteri`
    };
  }
  
  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} non può superare ${maxLength} caratteri`
    };
  }
  
  return { isValid: true };
};


export const validateId = (id: string): ValidationResult => {
  const numId = parseInt(id);
  
  if (isNaN(numId) || numId <= 0) {
    return {
      isValid: false,
      error: 'ID non valido'
    };
  }
  
  return { isValid: true };
};

// ============================================
// VALIDATORI SPECIFICI - SOCIETÀ
// ============================================
/**
 * Valida dati società per creazione (POST)
 */
export const validateSocietaCreate = (data: any): ValidationResult => {
  const nomeCheck = validateRequired(data.nome, 'nome');
  if (!nomeCheck.isValid) return nomeCheck;
  
  const nomeStringCheck = validateString(data.nome, 'nome', 2, 100);
  if (!nomeStringCheck.isValid) return nomeStringCheck;

  const fatturatoCheck = validateRequired(data.fatturato, 'fatturato');
  if (!fatturatoCheck.isValid) return fatturatoCheck;
  
  const fatturatoNumberCheck = validateNumber(data.fatturato, 'fatturato');
  if (!fatturatoNumberCheck.isValid) return fatturatoNumberCheck;
  
  const fatturatoPositiveCheck = validatePositive(data.fatturato, 'fatturato');
  if (!fatturatoPositiveCheck.isValid) return fatturatoPositiveCheck;
  
  const ebitdaCheck = validateRequired(data.ebitda, 'ebitda');
  if (!ebitdaCheck.isValid) return ebitdaCheck;
  
  const ebitdaNumberCheck = validateNumber(data.ebitda, 'ebitda');
  if (!ebitdaNumberCheck.isValid) return ebitdaNumberCheck;
  
  const ebitdaPositiveCheck = validatePositive(data.ebitda, 'ebitda');
  if (!ebitdaPositiveCheck.isValid) return ebitdaPositiveCheck;
  
  // Business logic: EBITDA <= fatturato
  if (data.ebitda > data.fatturato) {
    return {
      isValid: false,
      error: 'EBITDA non può essere maggiore del fatturato'
    };
  }

  const regioneCheck = validateRequired(data.regione, 'regione');
  if (!regioneCheck.isValid) return regioneCheck;
  
  const regioneStringCheck = validateString(data.regione, 'regione', 2, 50);
  if (!regioneStringCheck.isValid) return regioneStringCheck;
  
  const atecoCheck = validateRequired(data.codice_ateco, 'codice_ateco');
  if (!atecoCheck.isValid) return atecoCheck;
  
  const atecoStringCheck = validateString(data.codice_ateco, 'codice_ateco', 5, 10);
  if (!atecoStringCheck.isValid) return atecoStringCheck;
  
  // Formato ATECO: XX.XX.XX
  const atecoRegex = /^\d{2}\.\d{2}\.\d{2}$/;
  if (!atecoRegex.test(data.codice_ateco)) {
    return {
      isValid: false,
      error: 'Codice ATECO formato non valido (es: 62.01.00)'
    };
  }
  
  const settoreCheck = validateRequired(data.settore, 'settore');
  if (!settoreCheck.isValid) return settoreCheck;
  
  const settoreStringCheck = validateString(data.settore, 'settore', 2, 100);
  if (!settoreStringCheck.isValid) return settoreStringCheck;
  
  // DESCRIZIONE (opzionale)
  if (data.descrizione !== undefined && data.descrizione !== null && data.descrizione !== '') {
    const descrizioneStringCheck = validateString(data.descrizione, 'descrizione', 10, 1000);
    if (!descrizioneStringCheck.isValid) return descrizioneStringCheck;
  }
  
  return { isValid: true };
};

/**
 * Valida dati società per update parziale (PATCH)
 */
export const validateSocietaUpdate = (data: any): ValidationResult => {
  // Almeno un campo deve essere presente
  const hasFields = data.nome !== undefined || 
                    data.fatturato !== undefined || 
                    data.ebitda !== undefined ||
                    data.regione !== undefined ||
                    data.codice_ateco !== undefined ||
                    data.settore !== undefined ||
                    data.descrizione !== undefined;
  
  if (!hasFields) {
    return {
      isValid: false,
      error: 'Almeno un campo da aggiornare'
    };
  }
  
  // Valida solo i campi presenti
  if (data.nome !== undefined) {
    const nomeCheck = validateString(data.nome, 'nome', 2, 100);
    if (!nomeCheck.isValid) return nomeCheck;
  }
  
  if (data.fatturato !== undefined) {
    const fatturatoCheck = validateNumber(data.fatturato, 'fatturato');
    if (!fatturatoCheck.isValid) return fatturatoCheck;
    
    const fatturatoPositiveCheck = validatePositive(data.fatturato, 'fatturato');
    if (!fatturatoPositiveCheck.isValid) return fatturatoPositiveCheck;
  }
  
  if (data.ebitda !== undefined) {
    const ebitdaCheck = validateNumber(data.ebitda, 'ebitda');
    if (!ebitdaCheck.isValid) return ebitdaCheck;
    
    const ebitdaPositiveCheck = validatePositive(data.ebitda, 'ebitda');
    if (!ebitdaPositiveCheck.isValid) return ebitdaPositiveCheck;
  }

  if (data.regione !== undefined) {
    const regioneCheck = validateString(data.regione, 'regione', 2, 50);
    if (!regioneCheck.isValid) return regioneCheck;
  }
  
  if (data.codice_ateco !== undefined) {
    const atecoCheck = validateString(data.codice_ateco, 'codice_ateco', 5, 10);
    if (!atecoCheck.isValid) return atecoCheck;
    
    const atecoRegex = /^\d{2}\.\d{2}\.\d{2}$/;
    if (!atecoRegex.test(data.codice_ateco)) {
      return {
        isValid: false,
        error: 'Codice ATECO formato non valido (es: 62.01.00)'
      };
    }
  }
  
  if (data.settore !== undefined) {
    const settoreCheck = validateString(data.settore, 'settore', 2, 100);
    if (!settoreCheck.isValid) return settoreCheck;
  }
  
  if (data.descrizione !== undefined && data.descrizione !== null && data.descrizione !== '') {
    const descrizioneCheck = validateString(data.descrizione, 'descrizione', 10, 1000);
    if (!descrizioneCheck.isValid) return descrizioneCheck;
  }
  
  // Business logic: Se entrambi presenti, EBITDA <= fatturato
  if (data.fatturato !== undefined && data.ebitda !== undefined) {
    if (data.ebitda > data.fatturato) {
      return {
        isValid: false,
        error: 'EBITDA non può essere maggiore del fatturato'
      };
    }
  }
  
  return { isValid: true };
};

// ============================================
// VALIDATORI SPECIFICI - AUTENTICAZIONE
// ============================================
export const validateLoginCredentials = (data: any): ValidationResult => {
  const usernameCheck = validateRequired(data.username, 'username');
  if (!usernameCheck.isValid) return usernameCheck;
  
  const usernameStringCheck = validateString(data.username, 'username', 3, 50);
  if (!usernameStringCheck.isValid) return usernameStringCheck;
  
  const passwordCheck = validateRequired(data.password, 'password');
  if (!passwordCheck.isValid) return passwordCheck;
  
  const passwordStringCheck = validateString(data.password, 'password', 4, 100);
  if (!passwordStringCheck.isValid) return passwordStringCheck;
  
  return { isValid: true };
};
