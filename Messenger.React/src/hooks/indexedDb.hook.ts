import { useState } from "react";
import Message from "../Models/Message";

function useIndexedDB(storeName: string, dbName: string = "myDatabase", version: number = 1) {
  const [db, setDb] = useState<IDBDatabase | null>(null);

  const openDb = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, version);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        const database = request.result;
        setDb(database);
        resolve(database);
        console.log("Database is opened");
      };

      request.onerror = () => {
        console.error("Failed to open IndexedDB:", request.error);
        reject(request.error);
      };
    });
  };

  const addData = (data: { id: string; value: any }): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject("Database is not initialized");
        return;
      }

      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(data); // Використання put замість add

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  const addDataRange = (data: Message[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject("Database is not initialized");
        return;
      }
  
      // Використовуємо Promise.all, щоб зачекати на всі виклики addData
      Promise.all(data.map(item => addData({ id: item.id, value: item })))
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
  

  const getData = (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject("Database is not initialized");
        return;
      }

      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  return { openDb, addData, getData, addDataRange, db };
}

export default useIndexedDB;
