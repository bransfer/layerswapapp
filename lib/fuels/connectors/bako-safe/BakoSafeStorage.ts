import { StorageAbstract } from 'fuels';

export class BakoStorage extends StorageAbstract {
  data: { [key: string]: string } = {};

  async getItem(key: string): Promise<string | null | undefined> {
    return this.data[key];
  }

  async setItem(key: string, value: string): Promise<void> {
    this.data[key] = value;

    return;
  }

  async removeItem(key: string): Promise<void> {
    delete this.data[key];
  }

  async clear(): Promise<void> {
    this.data = {};
  }
}