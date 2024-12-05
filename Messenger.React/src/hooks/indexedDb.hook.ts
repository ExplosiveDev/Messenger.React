import { useContext, useState } from "react";
import Message from "../Models/Message";
import IndexedDbMessageEntity from "../Models/IndexedDbMessageEntity";
import User from "../Models/User";
import { MessageContex } from "../context/MessageContext";

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
      };

      request.onerror = () => {
        console.error("Failed to open IndexedDB:", request.error);
        reject(request.error);
      };
    });
  };

  const addDataEntity = (data: IndexedDbMessageEntity): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject("Database is not initialized");
        return;
      }

      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(data); 

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  const addNewMessageIntoData = (message: Message, id:string): Promise<void> => {
    return new Promise((resolve, reject) => {

      if (!db) {
        reject("Database is not initialized");
        return;
      }
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const object: IndexedDbMessageEntity = getRequest.result;
        if (object) {
          // Додаємо новий Message
          console.log(object);
          object.messages.push(message);

          //Оновлюємо об'єкт в IndexedDB
          const updateRequest = store.put(object);
          updateRequest.onsuccess = () => {
            console.log('Message added successfully!');
          };
          updateRequest.onerror = function () {
            console.log('Error updating object:', updateRequest.error);
          };
        } else {
          console.log('Object not found');
          const msgs:Message[] = [message];
          if(message.sender.id == id)
            addDataEntity({id:id, user:message.sender, messages:msgs});
          else
            addDataEntity({id:id, user:message.receive, messages:msgs});

          
        }
      };

      getRequest.onerror = () => {
        console.log('Error fetching object:', getRequest.error);
      };
    });
  }

  const addDataRange = (data: IndexedDbMessageEntity[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject("Database is not initialized");
        return;
      }

      // Використовуємо Promise.all, щоб зачекати на всі виклики addData
      Promise.all(data.map(item => addDataEntity(item)))
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  };


  const getData = (id: string): Promise<IndexedDbMessageEntity> => {
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
  const getAllMessages = (): Promise<IndexedDbMessageEntity[]> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject("Database is not initialized");
        return;
      }

      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {    
        resolve(request.result as IndexedDbMessageEntity[]);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  };

  const getAllSavedChats = (): Promise<User[]> => {
    return new Promise((resolve, reject) => {
      getAllMessages()
        .then((data) => {
          const chats: User[] = [];

          data.forEach(elemen => {
            chats.push(elemen.user)
          });

          resolve(chats);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  return { openDb, addDataEntity, getData, addDataRange, addNewMessageIntoData, getAllMessages, getAllSavedChats, db };
}

export default useIndexedDB;
