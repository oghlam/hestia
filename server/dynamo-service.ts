import type {
  AccessLogEntry,
  Alert,
  Asset,
  AuditLogEntry,
  AutomationRule,
  CareTeamMember,
  HomeMapConfig,
  NotificationItem,
  Resident,
  RingEvent,
  Room,
  SceneEvent,
  SystemSettings,
} from '../src/domain/contracts'

export const DYNAMO_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'hestia_elder_care_prod'
export const DYNAMO_REGION = process.env.AWS_REGION || 'us-east-1'
export const DYNAMO_ENDPOINT = process.env.DYNAMODB_ENDPOINT || undefined

// Lazy-loaded AWS SDK client references
let awsSdk: any = null
let ddbClient: any = null

async function getSdk() {
  if (!awsSdk) {
    try {
      const clientModule = await import('@aws-sdk/client-dynamodb')
      const utilModule = await import('@aws-sdk/util-dynamodb')
      awsSdk = {
        DynamoDBClient: clientModule.DynamoDBClient,
        CreateTableCommand: clientModule.CreateTableCommand,
        DescribeTableCommand: clientModule.DescribeTableCommand,
        PutItemCommand: clientModule.PutItemCommand,
        GetItemCommand: clientModule.GetItemCommand,
        ScanCommand: clientModule.ScanCommand,
        DeleteItemCommand: clientModule.DeleteItemCommand,
        QueryCommand: clientModule.QueryCommand,
        marshall: utilModule.marshall,
        unmarshall: utilModule.unmarshall,
      }
    } catch {
      awsSdk = null
    }
  }
  return awsSdk
}

export async function getDynamoDBClient(region = DYNAMO_REGION, endpoint = DYNAMO_ENDPOINT) {
  if (!ddbClient) {
    const sdk = await getSdk()
    if (sdk) {
      ddbClient = new sdk.DynamoDBClient({
        region,
        ...(endpoint ? { endpoint } : {}),
        maxAttempts: 3,
      })
    }
  }
  return ddbClient
}

export function resetDynamoClient() {
  ddbClient = null
}

export interface DynamoItem {
  pk: string // e.g. "HOME#HGW-001", "ROOM#living_room", "RESIDENT#eleanor"
  sk: string // e.g. "METADATA", "SCENE#2026-09-15T12:00:00Z#scene_001", "ALERT#alert_001"
  entityType: string // 'room' | 'resident' | 'care_team' | 'rule' | 'scene' | 'alert' | 'audit_log' | 'access_log' | 'notification' | 'asset' | 'settings' | 'home_map'
  data: Record<string, any>
  updatedAt: string
}

// In-memory fallback simulated DynamoDB table for offline/dev environments
const mockDynamoTable = new Map<string, DynamoItem>()

export async function ensureDynamoTable(
  tableName = DYNAMO_TABLE_NAME,
  client?: any
): Promise<{ created: boolean; exists: boolean }> {
  const sdk = await getSdk()
  if (!sdk) {
    // Offline simulation
    return { created: true, exists: true }
  }

  const ddb = client || (await getDynamoDBClient())
  if (!ddb) return { created: false, exists: false }

  try {
    const describe = await ddb.send(new sdk.DescribeTableCommand({ TableName: tableName }))
    if (describe.Table?.TableStatus) {
      return { created: false, exists: true }
    }
  } catch (err: any) {
    if (err.name !== 'ResourceNotFoundException') {
      console.warn(`[DynamoDB] DescribeTable notice: ${err.message}`)
    }
  }

  try {
    await ddb.send(
      new sdk.CreateTableCommand({
        TableName: tableName,
        KeySchema: [
          { AttributeName: 'pk', KeyType: 'HASH' },
          { AttributeName: 'sk', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
          { AttributeName: 'pk', AttributeType: 'S' },
          { AttributeName: 'sk', AttributeType: 'S' },
          { AttributeName: 'entityType', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'EntityTypeIndex',
            KeySchema: [
              { AttributeName: 'entityType', KeyType: 'HASH' },
              { AttributeName: 'sk', KeyType: 'RANGE' },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          },
        ],
        BillingMode: 'PROVISIONED',
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      })
    )
    return { created: true, exists: true }
  } catch (err: any) {
    if (err.name === 'ResourceInUseException') {
      return { created: false, exists: true }
    }
    throw err
  }
}

export async function putEntityItem(
  entityType: string,
  pk: string,
  sk: string,
  data: Record<string, any>,
  tableName = DYNAMO_TABLE_NAME,
  client?: any
): Promise<void> {
  const item: DynamoItem = {
    pk,
    sk,
    entityType,
    data,
    updatedAt: new Date().toISOString(),
  }

  const sdk = await getSdk()
  const ddb = client || (await getDynamoDBClient())

  if (!sdk || !ddb) {
    // Record in simulated table
    mockDynamoTable.set(`${pk}#${sk}`, item)
    return
  }

  try {
    await ddb.send(
      new sdk.PutItemCommand({
        TableName: tableName,
        Item: sdk.marshall(item, { removeUndefinedValues: true }),
      })
    )
  } catch (err) {
    mockDynamoTable.set(`${pk}#${sk}`, item)
  }
}

export async function getEntityItem<T = any>(
  pk: string,
  sk: string,
  tableName = DYNAMO_TABLE_NAME,
  client?: any
): Promise<T | undefined> {
  const sdk = await getSdk()
  const ddb = client || (await getDynamoDBClient())

  if (!sdk || !ddb) {
    const item = mockDynamoTable.get(`${pk}#${sk}`)
    return item ? (item.data as T) : undefined
  }

  try {
    const res = await ddb.send(
      new sdk.GetItemCommand({
        TableName: tableName,
        Key: sdk.marshall({ pk, sk }),
      })
    )

    if (!res.Item) return undefined
    const unmarshalled = sdk.unmarshall(res.Item) as DynamoItem
    return unmarshalled.data as T
  } catch {
    const item = mockDynamoTable.get(`${pk}#${sk}`)
    return item ? (item.data as T) : undefined
  }
}

export async function deleteEntityItem(
  pk: string,
  sk: string,
  tableName = DYNAMO_TABLE_NAME,
  client?: any
): Promise<boolean> {
  const sdk = await getSdk()
  const ddb = client || (await getDynamoDBClient())

  mockDynamoTable.delete(`${pk}#${sk}`)

  if (!sdk || !ddb) {
    return true
  }

  try {
    await ddb.send(
      new sdk.DeleteItemCommand({
        TableName: tableName,
        Key: sdk.marshall({ pk, sk }),
      })
    )
  } catch {
    // ignore
  }
  return true
}

export async function listEntityItems<T = any>(
  entityType: string,
  tableName = DYNAMO_TABLE_NAME,
  client?: any
): Promise<T[]> {
  const sdk = await getSdk()
  const ddb = client || (await getDynamoDBClient())

  if (!sdk || !ddb) {
    return Array.from(mockDynamoTable.values())
      .filter((i) => i.entityType === entityType)
      .map((i) => i.data as T)
  }

  try {
    const res = await ddb.send(
      new sdk.QueryCommand({
        TableName: tableName,
        IndexName: 'EntityTypeIndex',
        KeyConditionExpression: 'entityType = :et',
        ExpressionAttributeValues: sdk.marshall({ ':et': entityType }),
      })
    )

    if (!res.Items || res.Items.length === 0) return []
    return res.Items.map((item: any) => sdk.unmarshall(item).data as T)
  } catch {
    try {
      const scan = await ddb.send(
        new sdk.ScanCommand({
          TableName: tableName,
          FilterExpression: 'entityType = :et',
          ExpressionAttributeValues: sdk.marshall({ ':et': entityType }),
        })
      )

      if (!scan.Items || scan.Items.length === 0) {
        return Array.from(mockDynamoTable.values())
          .filter((i) => i.entityType === entityType)
          .map((i) => i.data as T)
      }
      return scan.Items.map((item: any) => sdk.unmarshall(item).data as T)
    } catch {
      return Array.from(mockDynamoTable.values())
        .filter((i) => i.entityType === entityType)
        .map((i) => i.data as T)
    }
  }
}
