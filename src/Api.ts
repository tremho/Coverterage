import { DotSecrets } from './DotSecrets'
import { S3SecretReader } from './S3Secrets'

const localSecrets = new DotSecrets()
const cloudSecrets = new S3SecretReader()

export async function getSecrets (domain: string, subject: string, prop?: string, fromLocal?: boolean, fromCloud?: boolean): Promise<object | string | undefined> {
  if (prop === '') prop = undefined
  if (fromCloud !== true) {
    if (fromLocal === true || localSecrets.hasPath(domain, subject)) {
      return localSecrets.getSecrets(domain, subject, prop)
    }
    return await cloudSecrets.getSecrets(domain, subject, prop)
  } else {
    return await cloudSecrets.getSecrets(domain, subject, prop)
  }
}
