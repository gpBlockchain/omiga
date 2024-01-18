import { LightClientRPC } from '@ckb-lumos/light-client'
import { CKB_INDEXER, CKB_LIGHT_CLIENT, CKB_NODE } from './config'
import { append0x, Collector, getInscriptionInfoTypeScript, InscriptionInfoException } from '../src'

const inscriptionId = '0x55c4075afe3894e6f07e8feea708fc905c42dc4c93ac308f8addde0c04993301'

const fetchLightDeps = async () => {
  const lightRpc = new LightClientRPC(CKB_LIGHT_CLIENT)
  let ret = await lightRpc.fetchTransaction('0x8fad0595d9dbf09477d23b5ca815287ae321529bbb1e30bcc2bda00147faba7e') //
  console.log(ret.status)
  ret = await lightRpc.fetchTransaction('0xc07844ce21b38e4b071dd0e1ee3b0e27afd8d7532491327f39b786343f558ab7') // xudt
  console.log(ret.status)
  ret = await lightRpc.fetchTransaction('0xd0576d843c36dbad70b1ae92e8600fcdbaf14d6606eb0beadb71a5b3b52dfff7')
  console.log(ret.status)
}

const setInscritionIdCell = async () => {
  const infoType: CKBComponents.Script = {
    ...getInscriptionInfoTypeScript(true),
    args: append0x(inscriptionId),
  }
  let collector = new Collector({
    ckbNodeUrl: CKB_NODE,
    ckbIndexerUrl: CKB_INDEXER,
  })

  const inscriptionInfoCells = await collector.getCells({ type: infoType })
  if (!inscriptionInfoCells || inscriptionInfoCells.length === 0) {
    throw new InscriptionInfoException('There is no inscription info cell with the given inscription id')
  }

  const lightRpc = new LightClientRPC(CKB_LIGHT_CLIENT)
  let cells = await lightRpc.getScripts()
  if (cells.some((script=>
    script.script.args == append0x(inscriptionId)
  ))){
    console.log("already set script ");
    return;
  }
  await lightRpc.setScripts(
    [
      {
        script: {
          codeHash: infoType.codeHash,
          hashType: infoType.hashType,
          args: append0x(inscriptionId),
        },
        scriptType: 'type',
        blockNumber: `0x${BigInt(BigInt(inscriptionInfoCells[0].blockNumber) - BigInt(1)).toString(16)}`,
      },
    ],
    'partial',
  )
  console.log('wait light node sync tip number')
}

fetchLightDeps()
setInscritionIdCell()
