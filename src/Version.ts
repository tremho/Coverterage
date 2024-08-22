
import * as path from 'path'
import * as fs from 'fs'

const packagePath = path.normalize(path.join(__dirname, '..', '..', 'package.json'))

export class VersionInfo {
  public major: number = 0
  public minor: number = 0
  public revision: number = 0
  public suffix: string = ''

  constructor (vstr: string) {
    this.parse(vstr)
  }

  public toString = (): string => {
    let sfx = ''
    if (this.suffix !== '') sfx = '-' + this.suffix
    return `${this.major}.${this.minor}.${this.revision}${sfx}`
  }

  public parse = (vstr: string): VersionInfo => {
    const sn = vstr.indexOf('-')
    let suffix = ''
    if (sn !== -1) {
      suffix = vstr.substring(sn + 1)
      vstr = vstr.substring(0, sn)
    }
    const parts = vstr.split('.')
    while (parts.length < 3) parts.push('0')
    this.major = parseInt(parts[0])
    this.minor = parseInt(parts[1])
    this.revision = parseInt(parts[2])
    if (!isFinite(this.major)) this.major = 0
    if (!isFinite(this.minor)) this.minor = 0
    if (!isFinite(this.revision)) this.revision = 0
    this.suffix = suffix
    return this
  }

  public equals (other: VersionInfo | string): boolean {
    // Note: not really a valid SemVer comparison
    if (typeof other === 'string') other = new VersionInfo(other)
    return this.major === other.major &&
           this.minor === other.minor &&
           this.revision === other.revision
  }

  public isGreaterThan (other: VersionInfo | string): boolean {
    // Note: not really a valid SemVer comparison
    if (typeof other === 'string') other = new VersionInfo(other)
    if (this.major > other.major) return true
    if (this.major < other.major) return false
    if (this.minor > other.minor) return true
    if (this.minor < other.minor) return false
    return (this.revision > other.revision)
  }
}

// read version from this app's package.json
export function getPackageVersion (): VersionInfo {
  const pkg = path.join(__dirname, '..', 'package.json')
  return readPackageVersion(pkg)
}
// read version from project's package.json
export function getProjectVersion (): VersionInfo {
  return readPackageVersion(packagePath)
}

export function getProjectName (): string {
  let pkgJson: { name?: string } = {}
  try {
    pkgJson = JSON.parse(fs.readFileSync(packagePath).toString())
  } catch (e) {}
  return pkgJson.name ?? ''
}

function readPackageVersion (pkgPath: string): VersionInfo {
  let pkgJson: { version?: string } = {}
  try {
    pkgJson = JSON.parse(fs.readFileSync(pkgPath).toString())
  } catch (e) {}

  return new VersionInfo(pkgJson.version ?? '')
}
