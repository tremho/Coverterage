
import * as ac from 'ansi-colors'

export function helpDefault (): void {
  console.log('Coverterage is a simple AWS-based secrets solution')
  console.log('')
  console.log('Secrets are organized into domain/subject/property groups')
  console.log('a domain is the realm of secrets for a purpose. This corresponds to an AWS bucket in deployment.')
  console.log('a subject is a JSON object that holds the secrets. This corresponds to an AWS object within the domain bucket.')
  console.log('a property is a property of the json object, and a value is the value of that object property.')
  console.log('individual secrets can be considered as these object property values.')
  console.log('')
  console.log('A path-like syntax is used to identify these in the command line.')
  console.log('For example, MySecrets/APIKeys/Google-Maps would refer to domain="MySecrets", subject="APIKeys", and Object="Google-Maps".')
  console.log('Properties within this object could be retrieved such as MySecrets/APIKeys/Google-Maps/clientId')
  console.log('or set with MySecrets/APIKeys/Google-Maps/clientId="Some Value"')
  console.log('')
  console.log(ac.bold('Usage: ' + ac.grey('coverterage ' + ac.grey.dim('command  [args]'))))
  console.log('where ' + ac.grey.dim('command') + ' is one of:')
  console.log('  ' + ac.blue.bold('help ') + ' -- this list\n')

  console.log('  ' + ac.blue.bold('get') + ac.grey.dim(' [--local | --cloud]') + ac.green.italic(' domain/subject') + ' -- ' +
        'read the recorded secret value for (domain) and (subject)\n' +
        ac.italic('\tIf the exists locally, the value will returned from the local files\n' +
        '\tOtherwise the value will be returned from the cloud (AWS S3) resource\n' +
        '\tuse of the optional --local or --cloud flags will force a retrieval from that source only\n'))

  console.log('  ' + ac.blue.bold('publish') + ac.green.italic(' domain') + ' -- ' +
        'publish all the values from local to the cloud for the named domain.\n')

  console.log('  ' + ac.blue.bold('retrieve') + ac.green.italic(' domain') + ' -- ' +
        'pulls the keys and values for ' + ac.italic.green('domain') + ' from the cloud and writes to local values\n')

  console.log('  ' + ac.blue.bold('add') + ac.green.italic(' domain/subject/prop=value') + ' -- ' +
        'add a single property to the local JSON object at (domain)/(subject)\n')
  console.log('  ' + ac.blue.bold('edit') + ac.green.italic(' domain/subject/prop=value') + ' -- ' +
        'modify a single property in the local JSON object at (domain)/(subject)\n')
  console.log('  ' + ac.blue.bold('remove') + ac.green.italic(' domain/subject/prop') + ' -- ' +
        'remove a single property in the local JSON object at (domain)/(subject)/prop\n' +
        '\tor the entire subject at (domain)/(subject)\n' +
        '\tor the entire domain at (domain)\n')

  console.log(ac.italic('use ' + ac.bold('coverterage version ' + ac.grey.dim('or coverterage -v or coverterage --version') + ac.grey(' to see current running version of Coverterage'))))
}
