import { useState } from "react";
import PrivateChat from "../Models/PrivateChat";
import GroupChat from "../Models/GroupChat";
import Message from "../Models/Message";
import User from "../Models/User";
import Chat from "../Models/Chat";
import { parse } from 'date-fns';
import TextMessage from "../Models/TextMessage";
import MediaMessage from "../Models/MediaMessage";
import UserChat from "../Models/UserChat";
import { useAppSelector } from "../store/store";
import { StepId } from "framer-motion";

function useIndexedDBMessenger(dbName: string = "Messenger", version: number = 1) {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const { user, token } = useAppSelector(state => state.user);

  const storeNames = {
    TextMessages: "TextMessages",
    MediaMessages: "MediaMessages",
    PrivateChats: "PrivateChats",
    GroupChats: "GroupChats",
    Users: "Users",
  };
  const isPrivateChat = (chat: Chat): chat is PrivateChat => {
    return (chat as PrivateChat).user1 !== undefined && (chat as PrivateChat).user2 !== undefined;
  };

  const isGroupChat = (chat: Chat): chat is GroupChat => {
    return (chat as GroupChat).groupName !== undefined;
  };

  const isTextMessage = (message: Message): message is TextMessage => {
    return (message as TextMessage).content !== undefined && (message as MediaMessage).mediaType === undefined;
  }

  const isMediaMessage = (message: Message): message is MediaMessage => {
    return (message as MediaMessage).mediaType !== undefined && (message as MediaMessage).caption !== undefined;
  }


  const openDb = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, version);

      request.onupgradeneeded = () => {
        console.log("Upgrade needed for IndexedMessengerDB");
        const db = request.result;

        Object.values(storeNames).forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: "id" });
            console.log(`Object store "${storeName}" created.`);
          }
        });
      };

      request.onsuccess = () => {
        const database = request.result;
        setDb(database);
        // console.log("IndexedMessengerDB opened successfully.");
        resolve(database);
      };

      request.onerror = () => {
        console.error("Failed to open IndexedMessengerDB:", request.error);
        reject(request.error);
      };
    });
  };
  const clearDb = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (db) {
        db.close(); // Спочатку закриваємо, щоб уникнути блокування
      }

      const deleteRequest = indexedDB.deleteDatabase(dbName);

      deleteRequest.onsuccess = () => {
        console.log(`Database "${dbName}" deleted successfully`);
        setDb(null);
        resolve();
      };

      deleteRequest.onerror = () => {
        console.error(`Failed to delete database "${dbName}":`, deleteRequest.error);
        reject(deleteRequest.error);
      };

      deleteRequest.onblocked = () => {
        console.warn(`Deletion of database "${dbName}" is blocked`);
      };
    });
  };

  const addItem = <T>(storeName: string, data: T): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject("Database is not initialized");
        return;
      }


      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);

      const getRequest = store.get((data as any).id);

      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        // console.log(data);
        if (existing) {
          const updatedData = { ...existing, ...data }; //Оновлюємо існуючий запис
          const addRequest = store.put(updatedData);
          addRequest.onsuccess = () => resolve();
          addRequest.onerror = () => reject(addRequest.error);
        } else {
          const addRequest = store.put(data);
          addRequest.onsuccess = () => resolve();
          addRequest.onerror = () => reject(addRequest.error);
        }

      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  };


  const addItems = <T>(storeName: string, data: T[]): Promise<void> => {
    return Promise.all(data.map((item) => addItem(storeName, item))).then(() => undefined);
  };


  const getItem = <T>(storeName: string, id: string): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject("Database is not initialized");
        return;
      }

      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  };

  const removeItem = (storeName: string, id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject("Database is not initialized");
        return;
      }

      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };


  const getItems = <T>(storeName: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject("Database is not initialized");
        return;
      }

      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  };

  const getChats = async (): Promise<Chat[]> => {
    const privateChats = await getItems<PrivateChat>(storeNames.PrivateChats);
    const groupChats = await getItems<GroupChat>(storeNames.GroupChats);

    const chats: Chat[] = [...privateChats, ...groupChats];
    return chats;

  }

  const getMessages = async (): Promise<Message[]> => {
    const textMessages = await getItems<TextMessage>(storeNames.TextMessages);
    const mediaMessages = await getItems<MediaMessage>(storeNames.MediaMessages);

    const messages: Message[] = [...textMessages, ...mediaMessages];
    return messages;
  }

  const getMessage = async (messageId:string): Promise<Message> => {
    const textMessage = await getItem<TextMessage>(storeNames.TextMessages,messageId);
    if(textMessage) return textMessage;

    const mediaMessage = await getItem<MediaMessage>(storeNames.MediaMessages, messageId);
    if(mediaMessage) return mediaMessage;

    return {} as Message;
  }

  const getChat = async (chatId: string): Promise<Chat | undefined> => {
    const chats = await getChats();
    return chats.find(chat => chat.id === chatId);
  }

  const getChatsByName = async (name: string): Promise<Chat[]> => {
    const chats = await getChats();

    const normalizedName = name.toLowerCase();


    return chats.filter((chat: Chat) => {
      if (isPrivateChat(chat)) {
        const user1Name = chat.user1?.userName?.toLowerCase() || "unknown user";
        const user2Name = chat.user2?.userName?.toLowerCase() || "unknown user";
        const currentUserName = user?.userName?.toLowerCase() || "";
        const chatName = user1Name === currentUserName ? user2Name : user1Name;
        return chatName.includes(normalizedName);
      }
      if (isGroupChat(chat)) {
        return chat.groupName.toLowerCase().includes(normalizedName);
      }

      return false;
    });
  };

  const parseCustomDate = (timestamp: string): Date => {
    return parse(timestamp, "dd.MM.yyyy HH:mm:ss", new Date());
  };


  const getMessagesByChatId = async (chatId: string): Promise<Message[]> => {
    const allMessages: Message[] = await getMessages();
    const messages = allMessages.filter((message) => message.chatId === chatId);

    messages.sort((a, b) => parseCustomDate(a.timestamp).getTime() - parseCustomDate(b.timestamp).getTime());

    return messages;
  };

  const ChatMessagesUpdate = async (chat: Chat): Promise<void> => {
    chat.isMessagesUpdate = true;
    // console.log(chat);
    const storeName = isGroupChat(chat) ? storeNames.GroupChats : storeNames.PrivateChats;
    await addItem(storeName, chat);
  }

  const GetCountOfUnReadedMessages = async (chatId: string): Promise<number> => {
    const allMessages: Message[] = await getMessages();
    const messages = allMessages.filter((message: Message) => message.chatId === chatId);
    let unReaded: number = 0;
    messages.forEach((msg) => { if (!msg.isReaded && msg.senderId != user?.id) unReaded++; })
    return unReaded;
  }

  const GetUnReadedMessagIds = async (chatId: string): Promise<string[]> => {
    const allMessages: Message[] = await getMessages();
    return allMessages
      .filter(msg => msg.chatId === chatId && !msg.isReaded && msg.senderId !== user?.id)
      .map(msg => msg.id);
  }

  const SetReadedMessages = async (ids: string[]): Promise<void> => {
    const allMessages: Message[] = await getMessages();
    const messages = allMessages.filter((message) => ids.includes(message.id));

    messages.forEach(msg => msg.isReaded = true);
    console.log(messages);
    addItems(storeNames.TextMessages, messages);

  }

  const SetLastMessageToChat = async (chatId: string, message: Message): Promise<void> => {
    const chat = await getChat(chatId);
    if (chat) {

      chat.topMessage = isTextMessage(message) ? message as TextMessage : message as MediaMessage;
      const storeName = isGroupChat(chat) ? storeNames.GroupChats : storeNames.PrivateChats;
      await addItem(storeName, chat);
    }
  }

  const addMessages = async (messages: Message[]): Promise<void> => {
    messages.forEach((msg) => {
      addMessage(msg);
    });
  }

  const addMessage = async (message: Message): Promise<void> => {
    if (isTextMessage(message)) {
      await addItem(storeNames.TextMessages, message);
    }
    if (isMediaMessage(message)) {
      await addItem(storeNames.MediaMessages, message);
    }
    SetLastMessageToChat((message as Message).chatId, message as Message);
  }

  const addChat = async (chat: Chat): Promise<void> => {
    if (isPrivateChat(chat)) {
      await addItem(storeNames.PrivateChats, chat);
      return;
    }
    if (isGroupChat(chat)) {
      await addItem(storeNames.GroupChats, chat);
      return;
    }
  }

  const removeMemberDb = async (chatId: string, memberId: string) => {
    const chat = await getChat(chatId);

    if (chat) {
      const updatedUsersChat = chat.userChats.filter((uc: UserChat) => uc.userId !== memberId);

      const updatedChat = {
        ...chat,
        usersChat: updatedUsersChat
      };

      await addChat(updatedChat);
    }
  }

  const removeChat = async (chatId: string) => {
    const chat = await getChat(chatId);
    if (chat) {
      if (isPrivateChat(chat)) removeItem(storeNames.PrivateChats, chat.id);
      if (isGroupChat(chat)) removeItem(storeNames.GroupChats, chat.id);
    }
  }

  const isChatExist = async (chatId: string): Promise<boolean> => {
    const chat = await getChat(chatId);
    return chat ? true : false;
  }

  const editTextMessageDb = async (messageId: string, newTextMessageContent: string): Promise<void> => {
    const message:TextMessage = await getItem(storeNames.TextMessages, messageId);
    if (message) {
      const updatedMessage:TextMessage = {
        ...message,
        content: newTextMessageContent
      };
      await addItem(storeNames.TextMessages, updatedMessage);
    }
  }

  const getChatTopMessage = async (chatId:string): Promise<Message> => {
    const messages = await getMessagesByChatId(chatId);
    return messages[messages.length - 1] ? messages[messages.length - 1] : {} as Message;
  }

  const isChatTopMessage = async (chatId:string, messageId:string): Promise<boolean> => {
    const messages = await getMessagesByChatId(chatId);
    return messages[messages.length - 1].id === messageId;
  }

  const removeMessageDb = async (messageId:string): Promise<void> => {
    const message = await getMessage(messageId);
    if(isTextMessage(message)) removeItem(storeNames.TextMessages, messageId);
    if(isMediaMessage(message)) removeItem(storeNames.MediaMessages, messageId);
  }


  return {
    openDb, clearDb,
    // Private Chats
    addPrivateChat: (data: PrivateChat) => addItem(storeNames.PrivateChats, data),
    addPrivateChats: (data: PrivateChat[]) => addItems(storeNames.PrivateChats, data),
    removePrivateChat: (id: string) => removeItem(storeNames.PrivateChats, id),
    getPrivateChat: (id: string) => getItem<PrivateChat>(storeNames.PrivateChats, id),
    getPrivateChats: () => getItems<PrivateChat>(storeNames.PrivateChats),

    // Group Chats
    addGroupChat: (data: GroupChat) => addItem(storeNames.GroupChats, data),
    addGroupChats: (data: GroupChat[]) => addItems(storeNames.GroupChats, data),
    removeGroupChat: (id: string) => removeItem(storeNames.GroupChats, id),
    getGroupChat: (id: string) => getItem<GroupChat>(storeNames.GroupChats, id),
    getGroupChats: () => getItems<GroupChat>(storeNames.GroupChats),

    // Messages
    addTextMessage: (data: TextMessage) => addItem(storeNames.TextMessages, data),
    addTextMessages: (data: TextMessage[]) => addItems(storeNames.TextMessages, data),
    getTextMessage: (id: string) => getItem<TextMessage>(storeNames.TextMessages, id),
    getTextMessages: () => getItems<TextMessage>(storeNames.TextMessages),

    // Users
    addUser: (data: User) => addItem(storeNames.Users, data),
    addUsers: (data: User[]) => addItems(storeNames.Users, data),
    getUser: (id: string) => getItem<User>(storeNames.Users, id),
    getUsers: () => getItems<User>(storeNames.Users),

    db,

    getChat, getChats, isChatExist, getChatsByName, ChatMessagesUpdate,SetLastMessageToChat, addChat, removeChat, removeMemberDb,
    isPrivateChat, isGroupChat, isTextMessage, isMediaMessage, addMessage, editTextMessageDb,
    getMessagesByChatId, GetCountOfUnReadedMessages, GetUnReadedMessagIds, SetReadedMessages, addMessages, getMessage, removeMessageDb, getChatTopMessage, isChatTopMessage

  };
}

export default useIndexedDBMessenger;
