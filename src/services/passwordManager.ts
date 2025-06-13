import CryptoJS from 'crypto-js';

const MASTER_PASSWORD_KEY = 'noteflow_master_password';
const PASSWORD_VERIFICATION_KEY = 'noteflow_password_verification';

export const passwordManager = {
  setMasterPassword: (password: string) => {
    // Create a random verification string that will be used to verify the password
    const verificationString = CryptoJS.lib.WordArray.random(128 / 8).toString();
    
    // Hash the password
    const passwordHash = CryptoJS.SHA256(password).toString();
    
    // Encrypt the verification string with the password
    const encryptedVerification = CryptoJS.AES.encrypt(verificationString, password).toString();
    
    // Store both the encrypted verification string and its original value
    localStorage.setItem(MASTER_PASSWORD_KEY, passwordHash);
    localStorage.setItem(PASSWORD_VERIFICATION_KEY, JSON.stringify({
      encrypted: encryptedVerification,
      original: verificationString
    }));
    
    return true;
  },

  verifyPassword: (password: string): boolean => {
    try {
      // Get the stored verification data
      const verificationData = localStorage.getItem(PASSWORD_VERIFICATION_KEY);
      if (!verificationData) return false;
      
      const { encrypted, original } = JSON.parse(verificationData);
      
      // Try to decrypt the verification string
      const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
      
      // Compare with the original verification string
      return decrypted === original;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  },

  hasMasterPassword: (): boolean => {
    return !!localStorage.getItem(MASTER_PASSWORD_KEY);
  },

  clearMasterPassword: () => {
    localStorage.removeItem(MASTER_PASSWORD_KEY);
    localStorage.removeItem(PASSWORD_VERIFICATION_KEY);
  }
}; 