import { AddressType, ExtendedPrivateKey, key, mnemonic } from '@ckb-lumos/hd'
import { getConfig } from '@ckb-lumos/config-manager'
import { Script } from '@ckb-lumos/base'
import { encodeToAddress } from '@ckb-lumos/helpers'

const MNEMONIC = ""
export interface Account {
  lockScript: Script
  address: string
  pubKey: string
  privKey: string
}

export const getSecp256k1Account = (mm: string, type: AddressType, index: number): Account => {
  const seed = mnemonic.mnemonicToSeedSync(mm)
  const extendedPrivateKey = ExtendedPrivateKey.fromSeed(seed)
  let priv = extendedPrivateKey.privateKeyInfo(type, index)
  return randomSecp256k1Account(priv.privateKey)
}

export const randomSecp256k1Account = (privKey: string): Account => {
  const pubKey = key.privateToPublic(privKey)
  const args = key.publicKeyToBlake160(pubKey)
  const template = getConfig().SCRIPTS['SECP256K1_BLAKE160']!
  const lockScript = {
    codeHash: template.CODE_HASH,
    hashType: template.HASH_TYPE,
    args: args,
  }

  const address = encodeToAddress({
    codeHash: template.CODE_HASH,
    hashType: 'type',
    args: args,
  })

  return {
    lockScript,
    address,
    pubKey,
    privKey: privKey,
  }
}

let account = getSecp256k1Account(
    MNEMONIC,
  AddressType.Receiving,
  0,
)
console.log(account)
