import {
  callReadOnlyFunction,
  cvToJSON,
  noneCV,
  standardPrincipalCV,
} from '@stacks/transactions'

export async function readOnly({
  network,
  contractAddress,
  contractName,
  functionName,
  functionArgs,
  senderAddress,
}) {
  const resultCv = await callReadOnlyFunction({
    network,
    contractAddress,
    contractName,
    functionName,
    functionArgs,
    senderAddress,
  })

  return cvToJSON(resultCv)
}

export function none() {
  return noneCV()
}

export function principal(address) {
  return standardPrincipalCV(address)
}
