interface ApiKeyRecord {
  id: string;
  apiUrl: string;
  apiKey: string;
}

interface ImageRecord {
  id: string;
  blob: Blob;
  filename: string;
  roomType: string
}

class AidTestDB{
  private dbName = "AidTestDB";
  private dbVersion = 1;
  private storeName = "AidTestStore";
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "id" });
        }
      };
    });
  }

  async getApiKeyByUrl(apiUrl: string): Promise<string | undefined> {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(apiUrl);

      request.onsuccess = () => {
        const record = request.result as ApiKeyRecord;
        resolve(record?.apiKey);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async setApiKeyByUrl(apiUrl: string, apiKey: string): Promise<void> {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const record: ApiKeyRecord = {
        id: apiUrl, // 使用apiUrl作为主键
        apiUrl,
        apiKey,
      };
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async batchSaveImages(images: File[]): Promise<string[]> {
    if (!this.db) await this.initDB();
    
    const imageKeys: string[] = [];
    const store = this.db!.transaction([this.storeName], "readwrite").objectStore(this.storeName);
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const originalFilename = image.name;
      const imageId = `img_${originalFilename}_${Date.now()}`;
      const imageRecord: ImageRecord = {
        id: imageId,
        blob: image,
        filename: originalFilename,
        roomType: ""
      };
      
      await new Promise<void>((resolve, reject) => {
        const request = store.add(imageRecord);
        request.onsuccess = () => {
          imageKeys.push(imageId);
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    }
    
    return imageKeys;
  }

  async getImageById(imageId: string): Promise<Blob | null> {
    if (!this.db) await this.initDB();
    
    const store = this.db!.transaction([this.storeName], "readonly").objectStore(this.storeName);
    const record = await new Promise<ImageRecord>((resolve, reject) => {
      const request = store.get(imageId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    return record?.blob || null;
  }

  async getImagesForPreview(imageIds: string[]): Promise<{ blob: Blob; title: string;  roomeType: string, id: string}[]> {
    if (!this.db) await this.initDB();
    
    const store = this.db!.transaction([this.storeName], "readonly").objectStore(this.storeName);
    const previewList: {id: string, blob: Blob; title: string; roomeType: string }[] = [];
    
    for (const imageId of imageIds) {
      const record = await new Promise<ImageRecord>((resolve, reject) => {
        const request = store.get(imageId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (record?.blob) {
        previewList.push({
          id: record.id,
          blob: record.blob,
          title: record.filename,
          roomeType: record.roomType
        });
      }
    }
    return previewList;
  }

  async updateImageType(imageId: string, roomType: string){
    if (!this.db) await this.initDB();
    const store = this.db!.transaction([this.storeName], "readwrite").objectStore(this.storeName);
    const getRequest = store.get(imageId)
    getRequest.onsuccess = () => {
      const data = getRequest.result;
      data.roomType = roomType
      store.put(data)
    };
  }


  async getAllImageIds(): Promise<string[]> {
    if (!this.db) await this.initDB();
    
    const store = this.db!.transaction([this.storeName], "readonly").objectStore(this.storeName);
    const records = await new Promise<ImageRecord[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    return records
      .filter(record => record.id.startsWith('img_'))
      .map(record => record.id);
  }

  async deleteAllImages(): Promise<void> {
    if (!this.db) await this.initDB();
    
    const imageIds = await this.getAllImageIds();
    const store = this.db!.transaction([this.storeName], "readwrite").objectStore(this.storeName);
    
    for (const imageId of imageIds) {
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(imageId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  async deleteDatabase(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbName);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async deleteById(id: string): Promise<void> {
    if (!this.db) await this.initDB();
    
    const store = this.db!.transaction([this.storeName], "readwrite").objectStore(this.storeName);
    
    return new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Create a shared instance for API testing
const apiTestDB = new AidTestDB();

// Export both the class and the shared instance
export { AidTestDB };
export default apiTestDB;
