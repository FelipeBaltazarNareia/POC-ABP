import { Injectable } from '@angular/core';

const CACHE_PREFIX = 'offline_cache_';
const CACHE_TIMESTAMP_PREFIX = 'offline_cache_ts_';

@Injectable({
  providedIn: 'root'
})
export class OfflineCacheService {

  /**
   * Salva dados no cache local
   */
  set<T>(key: string, data: T): void {
    try {
      const cacheKey = CACHE_PREFIX + this.hashKey(key);
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(CACHE_TIMESTAMP_PREFIX + this.hashKey(key), Date.now().toString());
    } catch (e) {
      console.warn('Failed to cache data:', e);
    }
  }

  /**
   * Recupera dados do cache local
   */
  get<T>(key: string): T | null {
    try {
      const cacheKey = CACHE_PREFIX + this.hashKey(key);
      const data = localStorage.getItem(cacheKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Failed to retrieve cached data:', e);
      return null;
    }
  }

  /**
   * Verifica se existe cache para uma chave
   */
  has(key: string): boolean {
    const cacheKey = CACHE_PREFIX + this.hashKey(key);
    return localStorage.getItem(cacheKey) !== null;
  }

  /**
   * Retorna a idade do cache em milissegundos
   */
  getAge(key: string): number | null {
    const timestampKey = CACHE_TIMESTAMP_PREFIX + this.hashKey(key);
    const timestamp = localStorage.getItem(timestampKey);
    if (!timestamp) return null;
    return Date.now() - parseInt(timestamp, 10);
  }

  /**
   * Remove item do cache
   */
  remove(key: string): void {
    const hashedKey = this.hashKey(key);
    localStorage.removeItem(CACHE_PREFIX + hashedKey);
    localStorage.removeItem(CACHE_TIMESTAMP_PREFIX + hashedKey);
  }

  /**
   * Limpa todo o cache offline
   */
  clear(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_TIMESTAMP_PREFIX))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Cria um hash simples para a chave (para evitar problemas com URLs longas)
   */
  private hashKey(key: string): string {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}
