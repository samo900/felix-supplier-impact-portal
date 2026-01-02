# Database Integration Examples

This file provides examples for integrating your existing supplier database with the portal.

## Database Schema Example

```sql
-- Suppliers table
CREATE TABLE Suppliers (
    AccountId VARCHAR(50) PRIMARY KEY,
    SupplierName NVARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Phone VARCHAR(50),
    Address NVARCHAR(500),
    Status VARCHAR(20) DEFAULT 'Active',
    CreatedDate DATETIME DEFAULT GETDATE()
);

-- Donations table
CREATE TABLE Donations (
    DonationId INT IDENTITY(1,1) PRIMARY KEY,
    AccountId VARCHAR(50) NOT NULL,
    DonationDate DATE NOT NULL,
    Items INT NOT NULL,
    WeightKg DECIMAL(10,2) NOT NULL,
    MealsProvided INT,
    CO2SavedKg DECIMAL(10,2),
    Category VARCHAR(50),
    Notes NVARCHAR(MAX),
    FOREIGN KEY (AccountId) REFERENCES Suppliers(AccountId)
);

-- Create index for better query performance
CREATE INDEX IX_Donations_AccountId ON Donations(AccountId);
CREATE INDEX IX_Donations_Date ON Donations(DonationDate);
```

## Connection Setup

### Install SQL Server package

```bash
cd api
npm install mssql
```

### Create database utility (`api/utils/database.ts`)

```typescript
import * as sql from 'mssql';

const config: sql.config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'SupplierDB',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true, // for Azure SQL
    trustServerCertificate: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await new sql.ConnectionPool(config).connect();
  }
  return pool;
}

export { sql };
```

## Update Azure Functions

### 1. Update `sendOTP/index.ts`

Replace the `getAccountIdForEmail` function:

```typescript
import { getConnection, sql } from '../utils/database';

async function getAccountIdForEmail(email: string): Promise<string | null> {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query(`
        SELECT AccountId, SupplierName, Status
        FROM Suppliers
        WHERE Email = @email AND Status = 'Active'
      `);
    
    if (result.recordset.length === 0) {
      return null; // Supplier not found or inactive
    }
    
    return result.recordset[0].AccountId;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}
```

### 2. Update `getSupplierData/index.ts`

Replace the `fetchSupplierData` function:

```typescript
import { getConnection, sql } from '../utils/database';

async function fetchSupplierData(accountId: string): Promise<SupplierData | null> {
  try {
    const pool = await getConnection();
    
    // Get supplier summary
    const summaryResult = await pool.request()
      .input('accountId', sql.VarChar, accountId)
      .query(`
        SELECT 
          s.AccountId,
          s.SupplierName,
          COUNT(d.DonationId) as TotalDonations,
          ISNULL(SUM(d.MealsProvided), 0) as MealsProvided,
          ISNULL(SUM(d.CO2SavedKg), 0) as CO2Saved
        FROM Suppliers s
        LEFT JOIN Donations d ON s.AccountId = d.AccountId
        WHERE s.AccountId = @accountId
        GROUP BY s.AccountId, s.SupplierName
      `);
    
    if (summaryResult.recordset.length === 0) {
      return null;
    }
    
    const summary = summaryResult.recordset[0];
    
    // Get recent donations
    const recentResult = await pool.request()
      .input('accountId', sql.VarChar, accountId)
      .query(`
        SELECT TOP 10
          DonationDate as date,
          Items as items,
          WeightKg as weight
        FROM Donations
        WHERE AccountId = @accountId
        ORDER BY DonationDate DESC
      `);
    
    return {
      accountId: summary.AccountId,
      supplierName: summary.SupplierName,
      totalDonations: summary.TotalDonations,
      mealsProvided: summary.MealsProvided,
      co2Saved: summary.CO2Saved,
      recentDonations: recentResult.recordset.map(d => ({
        date: d.date.toISOString().split('T')[0],
        items: d.items,
        weight: parseFloat(d.weight)
      }))
    };
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}
```

## Additional Query Examples

### Get monthly statistics

```typescript
async function getMonthlyStats(accountId: string, year: number, month: number) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('accountId', sql.VarChar, accountId)
    .input('year', sql.Int, year)
    .input('month', sql.Int, month)
    .query(`
      SELECT 
        COUNT(*) as DonationCount,
        SUM(Items) as TotalItems,
        SUM(WeightKg) as TotalWeight,
        SUM(MealsProvided) as TotalMeals,
        SUM(CO2SavedKg) as TotalCO2Saved,
        AVG(WeightKg) as AvgWeight
      FROM Donations
      WHERE AccountId = @accountId
        AND YEAR(DonationDate) = @year
        AND MONTH(DonationDate) = @month
    `);
  
  return result.recordset[0];
}
```

### Get year-over-year comparison

```typescript
async function getYearOverYearComparison(accountId: string) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('accountId', sql.VarChar, accountId)
    .query(`
      SELECT 
        YEAR(DonationDate) as Year,
        COUNT(*) as Donations,
        SUM(WeightKg) as TotalWeight,
        SUM(MealsProvided) as MealsProvided
      FROM Donations
      WHERE AccountId = @accountId
        AND DonationDate >= DATEADD(YEAR, -2, GETDATE())
      GROUP BY YEAR(DonationDate)
      ORDER BY Year DESC
    `);
  
  return result.recordset;
}
```

### Get category breakdown

```typescript
async function getCategoryBreakdown(accountId: string) {
  const pool = await getConnection();
  const result = await pool.request()
    .input('accountId', sql.VarChar, accountId)
    .query(`
      SELECT 
        Category,
        COUNT(*) as DonationCount,
        SUM(WeightKg) as TotalWeight,
        SUM(MealsProvided) as MealsProvided
      FROM Donations
      WHERE AccountId = @accountId
        AND DonationDate >= DATEADD(MONTH, -12, GETDATE())
      GROUP BY Category
      ORDER BY TotalWeight DESC
    `);
  
  return result.recordset;
}
```

## Environment Variables

Add to `api/local.settings.json`:

```json
{
  "Values": {
    "DB_SERVER": "your-server.database.windows.net",
    "DB_NAME": "SupplierDB",
    "DB_USER": "admin_user",
    "DB_PASSWORD": "your_password"
  }
}
```

## Azure SQL Connection String (Alternative)

```json
{
  "Values": {
    "DATABASE_CONNECTION_STRING": "Server=tcp:your-server.database.windows.net,1433;Database=SupplierDB;User ID=admin;Password=password;Encrypt=true;"
  }
}
```

Then use:

```typescript
const pool = await new sql.ConnectionPool(process.env.DATABASE_CONNECTION_STRING!).connect();
```

## Error Handling

```typescript
async function fetchSupplierDataSafe(accountId: string): Promise<SupplierData | null> {
  try {
    return await fetchSupplierData(accountId);
  } catch (error) {
    if (error instanceof sql.RequestError) {
      console.error('SQL Request Error:', error.message);
      // Handle specific SQL errors
    } else if (error instanceof sql.ConnectionError) {
      console.error('SQL Connection Error:', error.message);
      // Handle connection errors
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
}
```

## Performance Tips

1. **Use Connection Pooling**: Already configured in database.ts
2. **Create Indexes**: On AccountId and DonationDate
3. **Use Pagination**: For large result sets
4. **Cache Results**: Use Redis for frequently accessed data
5. **Optimize Queries**: Use EXPLAIN PLAN to optimize slow queries

## Testing Queries

Create a test script `api/test-db.ts`:

```typescript
import { getConnection, sql } from './utils/database';

async function testConnection() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log('Database connected:', result.recordset[0].version);
    
    // Test supplier query
    const suppliers = await pool.request()
      .query('SELECT TOP 5 AccountId, SupplierName, Email FROM Suppliers');
    console.log('Sample suppliers:', suppliers.recordset);
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();
```

Run with:
```bash
cd api
npx ts-node test-db.ts
```
