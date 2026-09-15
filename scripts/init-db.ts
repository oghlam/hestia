import { ensureDynamoTable } from '../server/dynamo-service'

async function run() {
  console.log('🚀 Initializing Amazon DynamoDB tables for HESTIA...')
  const tableName = process.env.DYNAMODB_TABLE_NAME || 'hestia_elder_care_prod'
  const region = process.env.AWS_REGION || 'us-east-1'

  console.log(`- Target Table: ${tableName}`)
  console.log(`- Target Region: ${region}`)

  try {
    const res = await ensureDynamoTable(tableName)
    if (res.created) {
      console.log(`✅ Table '${tableName}' created successfully with GSI 'EntityTypeIndex'.`)
    } else if (res.exists) {
      console.log(`✅ Table '${tableName}' already exists and is active.`)
    }
  } catch (err: any) {
    console.error(`❌ Table initialization error: ${err.message}`)
    console.log('💡 Ensure AWS credentials or LocalStack/DynamoDB Local endpoint is active.')
  }
}

run()
