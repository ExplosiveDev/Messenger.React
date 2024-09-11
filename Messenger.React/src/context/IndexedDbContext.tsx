// IndexedDBContext.tsx
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import useIndexedDB from '../hooks/indexedDb.hook'; // Вказати правильний шлях до вашого хука

interface IndexedDBContextType {
  db: IDBDatabase | null;
  openDb: () => Promise<IDBDatabase>;
  addData: (data: { id: string; value: any }) => Promise<void>;
  getData: (id: string) => Promise<any>;
  addDataRange: (data: any[]) => Promise<void>;
}

const defaultIndexedDBContext: IndexedDBContextType = {
  db: null,
  openDb: async () => Promise.reject("Database not initialized"),
  addData: async () => {},
  getData: async () => {},
  addDataRange: async () => {},
};

export const IndexedDBContext = createContext<IndexedDBContextType>(defaultIndexedDBContext);

interface IndexedDBProviderProps {
  children: ReactNode;
}

export const IndexedDBProvider: React.FC<IndexedDBProviderProps> = ({ children }) => {
  const { openDb, addData, getData, addDataRange, db } = useIndexedDB('Messages');

  useEffect(() => {
    openDb().catch(error => {
      console.error('Error opening IndexedDB:', error);
    });
  }, []);

  return (
    <IndexedDBContext.Provider value={{ db, openDb, addData, getData, addDataRange }}>
      {children}
    </IndexedDBContext.Provider>
  );
};
