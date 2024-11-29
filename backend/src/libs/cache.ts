import { Redis } from 'ioredis'
import { REDIS_URI_CONNECTION } from '../configs/redis'
import * as crypto from 'crypto'
import util from "util"

// Inicia o Redis apenas se não estiver em desenvolvimento
const redis = process.env.NODE_ENV !== 'development' ? new Redis(REDIS_URI_CONNECTION) : null;

function encryptParams(params: any) {
  const str = JSON.stringify(params)
  return crypto.createHash('sha256').update(str).digest('base64')
}

export function setFromParams(
  key: string,
  params: any,
  value: string,
  option?: string,
  optionValue?: string | number
) {
  const finalKey = `${key}:${encryptParams(params)}`
  if (option !== undefined && optionValue !== undefined) {
    return set(finalKey, value, option, optionValue)
  } else {
    return set(finalKey, value)
  }
}

export function getFromParams(key: string, params: any) {
  const finalKey = `${key}:${encryptParams(params)}`
  return get(finalKey)
}

export function delFromParams(key: string, params: any) {
  const finalKey = `${key}:${encryptParams(params)}`
  return del(finalKey)
}

export async function set(
  key: string,
  value: string,
  option?: string,
  optionValue?: string | number
) {
  try {
    const setPromisefy = util.promisify(redis.set).bind(redis)
    if (option !== undefined && optionValue !== undefined) {
      return setPromisefy(key, value, option, optionValue)
    }

    return await setPromisefy(key, value)
  } catch (error: any) {
    console.error(`Erro ao definir chave no Redis: ${error.message}`);
    throw new Error("Erro ao salvar no cache.");
  }
}

export async function get(key: string) {
  try {
    const getPromisefy = util.promisify(redis.get).bind(redis)
    return await getPromisefy(key);
  } catch (error: any) {
    console.error(`Erro ao buscar chave no Redis: ${error.message}`);
    throw new Error("Erro ao recuperar do cache.");
  }
}

export async function getKeys(pattern: string) {
  try {
    const getKeysPromisefy = util.promisify(redis.keys).bind(redis)
    return await getKeysPromisefy(pattern)
  } catch (error: any) {
    console.error(`Erro ao buscar chaves no Redis: ${error.message}`);
    throw new Error("Erro ao recuperar chaves do cache.");
  }
}

export async function del(key: string) {
  try {
    const delPromisefy = util.promisify(redis.del).bind(redis)
    await delPromisefy(key)
  } catch (error: any) {
    console.error(`Erro ao deletar chave no Redis: ${error.message}`);
    throw new Error("Erro ao deletar chave do cache.");
  }
}

export async function delFromPattern(pattern: string) {
  const all = await getKeys(pattern)
  const pipeline = redis.pipeline()
  all.forEach((item) => pipeline.unlink(item))
  await pipeline.exec()
}

export const cacheLayer = {
  set,
  setFromParams,
  get,
  getFromParams,
  getKeys,
  del,
  delFromParams,
  delFromPattern,
}
