export interface CryptoCtx {
  iv?: string
  key?: string
}

export interface Crypto {
  setKey(key: string): voidCrypto
  /**
   * @name 加密
   * @template T
   * @param {T} data
   * @return {*}  {(string | null)}
   * @example
   *
   *     const res = encrypt('message')
   * @memberof Crypto
   */
  encrypt(data: string): string | null
  /**
   * @name 解密
   * @template T
   * @param {T} data
   * @return {*}  {(string | null)}
   * @example
   *
   *     const res = decrypt('message', {parse: true})
   * @memberof Crypto
   */
  decrypt(data: string): string | null
}

export interface CryptoConstructor {
  new (ctx?: CryptoCtx): Crypto
}

export class use implements CryptoConstructor {
  private ctx
  private iv
  private key
  constructor(ctx?: CryptoCtx)
  setKey(key: string): void
  encrypt(data: string): string | null
  decrypt(data: string): string | null
}
