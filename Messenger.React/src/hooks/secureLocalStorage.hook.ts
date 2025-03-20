import CryptoJS from 'crypto-js';

export const secureLocalStorage = () => {
    const secretKey = 'mySecretPassword';

    function saveEncryptedObject(key: string, obj: any, password: string): void {

        const jsonString = JSON.stringify(obj);
      
        const hashKey = CryptoJS.SHA256(password).toString();
      
        const encrypted = CryptoJS.AES.encrypt(jsonString, hashKey).toString();
      
        localStorage.setItem(key, encrypted);
      }
      

      function getDecryptedObject(key: string, password: string): any | null {

        const encrypted = localStorage.getItem(key);

        if (encrypted) {

          const hashKey = CryptoJS.SHA256(password).toString();
      
          const decrypted = CryptoJS.AES.decrypt(encrypted, hashKey).toString(CryptoJS.enc.Utf8);          

          return JSON.parse(decrypted);
        }
      
        return null;
      }

      return {secretKey, saveEncryptedObject, getDecryptedObject};
}