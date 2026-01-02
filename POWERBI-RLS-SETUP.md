# PowerBI Row-Level Security Configuration

This document explains how to configure Row-Level Security (RLS) in PowerBI for the Supplier Impact Portal.

## Overview

RLS ensures each supplier only sees their own data by filtering based on their `accountId`. The portal passes the authenticated user's `accountId` to PowerBI through the embed token.

## Step 1: Create RLS Role in PowerBI Desktop

1. Open your PowerBI report in PowerBI Desktop
2. Go to **Modeling** tab → **Manage Roles**
3. Click **Create** and name it "Supplier"
4. Select your main data table (e.g., `Donations` or `Suppliers`)
5. Add this DAX filter expression:

### Option A: Using USERPRINCIPALNAME (if passing email)

```dax
[SupplierEmail] = USERPRINCIPALNAME()
```

### Option B: Using CUSTOMDATA (Recommended - passing accountId)

```dax
[AccountId] = CUSTOMDATA()
```

### Option C: Complex filtering across multiple tables

```dax
[AccountId] IN 
CALCULATETABLE(
    VALUES(Suppliers[AccountId]),
    FILTER(Suppliers, Suppliers[AccountId] = CUSTOMDATA())
)
```

6. Click **Save**
7. Test the role using **View as Role** feature

## Step 2: Publish Report to PowerBI Service

1. Publish the report to your PowerBI workspace
2. Note the Workspace ID and Report ID from the URL:
   ```
   https://app.powerbi.com/groups/{WORKSPACE_ID}/reports/{REPORT_ID}
   ```

## Step 3: Configure Dataset Security

1. Go to PowerBI Service → Your Workspace
2. Find your dataset → Click **...** → **Security**
3. Under the "Supplier" role:
   - Add the Service Principal you created
   - Or add test users for development

## Step 4: Update API Code

The `getPowerBIToken` function in `/api/getPowerBIToken/index.ts` needs to be updated:

```typescript
const requestBody = {
  datasets: [{
    id: process.env.POWERBI_DATASET_ID,
  }],
  reports: [{
    id: process.env.POWERBI_REPORT_ID
  }],
  identities: [{
    username: email, // or accountId
    roles: ["Supplier"],
    datasets: [process.env.POWERBI_DATASET_ID],
    customData: accountId // This is passed to CUSTOMDATA() in DAX
  }]
};
```

## Step 5: Test RLS

### In PowerBI Desktop

1. Go to Modeling → View as Roles
2. Select "Supplier" role
3. In "Other user" field, enter test accountId
4. Verify only that supplier's data is visible

### In the Portal

1. Log in with a test supplier email
2. View the PowerBI report
3. Verify only that supplier's data appears
4. Check browser console for any errors

## Common DAX Patterns

### Filter by single AccountId

```dax
[AccountId] = CUSTOMDATA()
```

### Filter with NULL handling

```dax
IF(
    ISBLANK(CUSTOMDATA()),
    FALSE(),
    [AccountId] = CUSTOMDATA()
)
```

### Filter across related tables

```dax
CALCULATE(
    COUNTROWS(Donations),
    FILTER(
        Donations,
        RELATED(Suppliers[AccountId]) = CUSTOMDATA()
    )
) > 0
```

### Multiple suppliers (comma-separated)

```dax
PATHCONTAINS(CUSTOMDATA(), [AccountId])
```

## Troubleshooting

### Issue: All data visible despite RLS

**Solution**: 
- Verify role is assigned in dataset security
- Check DAX expression syntax
- Ensure customData is being passed in embed token
- Test with "View as Role" in PowerBI Desktop

### Issue: No data visible

**Solution**:
- Check accountId matches exactly (case-sensitive)
- Verify data type matches (string vs number)
- Check for leading/trailing spaces
- Log the customData value being sent

### Issue: Embed token generation fails

**Solution**:
- Verify service principal has workspace access
- Check dataset ID is correct
- Ensure service principal is added to RLS role

## Security Best Practices

1. **Always use CUSTOMDATA()** - More secure than USERPRINCIPALNAME()
2. **Test thoroughly** - Verify suppliers can't access others' data
3. **Use Service Principal** - Don't use personal accounts
4. **Audit access** - Monitor PowerBI audit logs
5. **Rotate credentials** - Regularly update service principal secrets
6. **Validate input** - Ensure accountId is validated before passing to PowerBI

## Example: Complete RLS Setup

### Suppliers Table

| AccountId | SupplierName | Email |
|-----------|--------------|-------|
| SUP001 | Supplier A | a@example.com |
| SUP002 | Supplier B | b@example.com |

### Donations Table

| DonationId | AccountId | Date | Items | Weight |
|------------|-----------|------|-------|--------|
| 1 | SUP001 | 2026-01-01 | 45 | 23.5 |
| 2 | SUP002 | 2026-01-01 | 38 | 19.2 |
| 3 | SUP001 | 2026-01-02 | 52 | 28.1 |

### RLS DAX Expression

```dax
[AccountId] = CUSTOMDATA()
```

### Result

When supplier a@example.com logs in:
- Portal API verifies email → gets AccountId "SUP001"
- Generates PowerBI embed token with customData = "SUP001"
- PowerBI applies filter: `[AccountId] = "SUP001"`
- User sees only donations 1 and 3

## Additional Resources

- [PowerBI RLS Documentation](https://learn.microsoft.com/en-us/power-bi/enterprise/service-admin-rls)
- [Embed Token API Reference](https://learn.microsoft.com/en-us/rest/api/power-bi/embed-token)
- [DAX Functions Reference](https://dax.guide/)
