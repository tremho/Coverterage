/** class that reads from the S3 secrets */
/** class that publishes to the S3 secrets */

import { s3GetObject, s3ListObjects, s3Delete, s3PutObject, s3CreateBucket, s3DeleteBucket } from '@tremho/basic-s3-actions'

export class S3SecretReader {
  public async getSecrets (domain: string, subject: string, prop?: string): Promise<object | string | undefined> {
    const secretBucket = 'secret-' + domain
    const obj = await s3GetObject(secretBucket, subject)
    if (prop !== undefined) {
      return obj[prop]
    }
    return obj
  }
}
export class S3SecretWriter {
  public async publish (map: any, domain?: string): Promise<void> {
    const scopes = Object.getOwnPropertyNames(map)
    for (const s of scopes) {
      if (domain !== undefined && s !== domain) continue
      console.log('publishing domain ' + s)
      const secretBucket = 'secret-' + s
      try {
        await s3CreateBucket(secretBucket)
      } catch(e:any) {
        // already exists
      }
      const existingSubjects = await s3ListObjects(secretBucket)
      const keys = Object.getOwnPropertyNames(map[s])
      for (const k of keys) {
        const v = map[s][k]
        console.log(`adding subject ${k} to cloud`)
        await s3PutObject(secretBucket, k, v)
        const i = existingSubjects.indexOf(k)
        if (i !== -1) {
          existingSubjects.splice(i, 1)
        }
      }
      for (const s of existingSubjects) {
        console.log(`removing deleted subject ${s} from cloud`)
        await s3Delete(secretBucket, s)
      }
    }
  }

  public static async removeDomainBucket(domain:string) {

    const secretBucket = 'secret-' + domain
    const existingSubjects = await s3ListObjects(secretBucket)
    for (const s of existingSubjects) {
      try {
        await s3Delete(secretBucket, s)
      } catch(e:any) {
      }
    }
    try {
      await s3DeleteBucket(secretBucket)
    } catch(e:any) {
      // ignore not found errors
    }
  }
}
