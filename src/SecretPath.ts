
export class SecretPath {
  public domain: string = ''
  public subject: string = ''
  public prop: string = ''
  public value: string = ''

  constructor (pathString?: string) {
    if (pathString !== undefined) {
      const parts = pathString.split('/')
      this.domain = (parts[0] ?? '').trim()
      this.subject = (parts[1] ?? '').trim()
      this.prop = (parts[2] ?? '').trim()
      if (this.prop.includes('=')) {
        const kv = this.prop.split('=')
        this.prop = (kv[0] ?? '').trim()
        this.value = (kv[1] ?? '').trim()
      }
    }
  }
}
