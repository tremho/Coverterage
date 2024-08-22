/** Class that deals with locally held secrets in the `.secrets` folder */

import fs from 'fs'
import path from 'path'
import os from 'os'
import * as ac from 'ansi-colors'
import {S3SecretWriter} from "./S3Secrets";
/* eslint @typescript-eslint/no-var-requires: "off" */
const readlineSync = require('readline-sync')

export enum SecretOps {
  Add,
  Edit,
  Remove
}

export class DotSecrets {
  private readonly _secretsRootPath: string = ''
  private _secretMap: any = {}

  constructor () {
    this._secretsRootPath = path.normalize(path.join(os.homedir(), '.coverterage', 'secrets'))
    if (fs.existsSync(this._secretsRootPath)) {
      this.readIntoMap()
    }
  }

  private readIntoMap (): void {
    this._secretMap = {}
    try {
      const scopes = fs.readdirSync(this._secretsRootPath)
      this.readScopes(scopes)
    } catch (e: any) {

    }
  }

  private readScopes (scopes: string[]): void {
    for (const s of scopes) {
      const spath = path.join(this._secretsRootPath, s)
      this._secretMap[s] = {}
      const files = fs.readdirSync(spath)
      for (const f of files) {
        const k = f.substring(0, f.lastIndexOf('.'))
        const fpath = path.join(spath, f)
        const obj = JSON.parse(fs.readFileSync(fpath).toString())
        this._secretMap[s][k] = obj
      }
    }
  }

  public getSecrets (domain: string, subject: string, prop?: string): object | string | undefined {
    if (typeof this._secretMap[domain] !== 'object') throw new Error('Unrecognized Domain "' + domain + '"')
    if (typeof this._secretMap[domain][subject] === 'undefined') throw new Error('Unrecognized Subject "' + subject + '"')
    const obj = this._secretMap[domain][subject]
    if (prop !== undefined) {
      return obj[prop]
    }
    return obj
  }

  public getMap (): any {
    return this._secretMap
  }

  public hasPath (domain: string, subject: string): boolean {
    const jname = subject.trim() + '.json'
    const xpath = path.join(this._secretsRootPath, domain, jname)
    return fs.existsSync(xpath)
  }

  public perform (op: SecretOps, domain: string, subject?: string, prop?: string, value?: string): void {
    if (subject === '') subject = undefined
    if (prop === '') prop = undefined
    if (value === '') value = undefined
    const spath = path.join(this._secretsRootPath, domain)
    if (!fs.existsSync(spath)) {
      fs.mkdirSync(spath, { recursive: true })
    }
    if (op === SecretOps.Remove && subject === undefined) {
      const files = fs.readdirSync(spath)
      if (areYouSure(`The entire ${domain} domain`, `(${files.length} subjects)`)) {
        fs.rmSync(spath, { recursive: true })
        S3SecretWriter.removeDomainBucket(domain);
      }
      return
    }
    const jname = (subject ?? '').trim() + '.json'
    const jpath = path.join(spath, jname)
    let obj: any = {}
    if (fs.existsSync(jpath)) {
      if (op === SecretOps.Remove && prop === undefined) {
        try { obj = JSON.parse(fs.readFileSync(jpath).toString()) } catch (e: any) {}
        if (areYouSure(`the entire subject at ${domain ?? ''}/${subject ?? ''}`, JSON.stringify(obj))) { fs.rmSync(jpath) }
        return
      }
      obj = JSON.parse(fs.readFileSync(jpath).toString())
    } else {
      if (op === SecretOps.Remove && prop === undefined) {
        throw new Error(`secret object '${domain ?? ''}/${subject ?? ''} does not exist to remove`)
      }
      if (op === SecretOps.Edit) {
        throw new Error(`secret object '${domain ?? ''}/${subject ?? ''} does not exist to edit`)
      }
    }
    if (op === SecretOps.Remove && prop !== undefined) {
      if (areYouSure(`the secret at ${domain ?? ''}/${subject ?? ''}/${prop}`, obj[prop])) {
        /* eslint @typescript-eslint/no-dynamic-delete: "off" */
        delete obj[prop]
      }
    } else {
      if (prop !== undefined) {
        if (obj[prop] !== undefined) {
          if (op === SecretOps.Add) {
            throw new Error(`property '${prop ?? ''} already exists for secret object '${domain ?? ''}/${subject ?? ''}'`)
          }
        }
        obj[prop] = value
      }
    }
    fs.writeFileSync(jpath, JSON.stringify(obj))
    this.readIntoMap()
  }
}

function areYouSure (
  removeWhat: string,
  value: any
): boolean {
  const vstr: string = value?.toString() ?? typeof value
  console.log(ac.dim.red(`Remove ${removeWhat}\nCurrent Value is ${vstr}`))
  let answer = ''
  while (true) {
    answer = readlineSync.question('Are you sure? ')
    answer = answer.trim().toLowerCase()
    if (answer === 'y' || answer === 'n') break
  }
  return answer === 'y'
}
