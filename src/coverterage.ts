#!/usr/bin/env node

import { helpDefault } from './help'
import { getSecrets } from './Api'
import { SecretPath } from './SecretPath'
import { DotSecrets, SecretOps } from './DotSecrets'
import { S3SecretWriter } from './S3Secrets'
import { getPackageVersion } from './Version'
import {S3ActionsLog} from '@tremho/basic-s3-actions'
import process from 'process'
S3ActionsLog.setMinimumLevel('Console', 'fatal')

const command = process.argv[2] ?? 'help'
const args = process.argv.slice(3)

async function processCommand (): Promise<void> {
  try {
    switch (command) {
      case 'version':
      case '--version':
      case '-v':
        console.log(`Coverterage v${getPackageVersion().toString()}`)
        return
      case 'help':
        return helpDefault()
      case 'get':
        return await doGet(args)
      case 'publish':
        return await doPublish(args[0])
      case 'retrieve':
        return await doRetrieve(args)
      case 'add':
        return doAdd(args)
      case 'edit':
        return doEdit(args)
      case 'remove':
        return doRemove(args)
    }
  }
  catch(e:any) {
    return console.error(e.message);
  }
  return console.error("Unrecognized Coverterage command '" + command + "'")
}

if(process.argv[1].endsWith('coverterage')) {
  void processCommand()
}

async function doGet (args: string[]): Promise<void> {
  let pathstring = ''
  let isLocal = false
  let isCloud = false
  for (const a of args) {
    if (a === '--local') {
      isLocal = true
      continue
    }
    if (a === '--cloud') {
      isCloud = true
      continue
    }
    pathstring += a
  }
  const sec = new SecretPath(pathstring)
  const result = await getSecrets(sec.domain, sec.subject, sec.prop, isLocal, isCloud)
  console.log(result)
}

async function doPublish (domain?: string): Promise<void> {
  const local = new DotSecrets()
  const writer = new S3SecretWriter()
  await writer.publish(local.getMap(), domain)
}

async function doRetrieve (args: string[]): Promise<void> {
  console.error('Not implemented')
}

function doAdd (args: string[]): void {
  const local = new DotSecrets()
  let { domain, subject, prop, value } = new SecretPath(args.join(' '))
  if (value.charAt(0) === '"' || value.charAt(0) === "'") {
    value = value.substring(1, value.length - 1)
  }
  local.perform(SecretOps.Add, domain, subject, prop, value)
}

function doEdit (args: string[]): void {
  const local = new DotSecrets()
  let { domain, subject, prop, value } = new SecretPath(args.join(' '))
  if (value.charAt(0) === '"' || value.charAt(0) === "'") {
    value = value.substring(1, value.length - 1)
  }
  local.perform(SecretOps.Edit, domain, subject, prop, value)
}

function doRemove (args: string[]): void {
  const local = new DotSecrets()
  const { domain, subject, prop } = new SecretPath(args.join(' '))
  local.perform(SecretOps.Remove, domain, subject, prop)
}

export default async function Secret(domain:string, subject:string) : Promise<object|string|undefined> {
  return await getSecrets(domain, subject)
}