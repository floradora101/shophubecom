# Check if Migration Was Applied

## Quick Check

1. **Stop your backend server** (important!)

2. **Check migration status**:

   ```bash
   cd backend
   npx prisma migrate status
   ```

3. **If migration shows as pending, apply it**:

   ```bash
   npx prisma migrate deploy
   ```

   OR for development:

   ```bash
   npx prisma migrate dev
   ```

4. **Verify the schema in database**:
   Connect to your database (pgAdmin or psql) and run:

   ```sql
   SELECT column_name, is_nullable, data_type
   FROM information_schema.columns
   WHERE table_name = 'CartItem' AND column_name = 'variantId';
   ```

   Should show: `is_nullable = 'YES'`

5. **Check unique constraint**:

   ```sql
   SELECT constraint_name, constraint_type
   FROM information_schema.table_constraints
   WHERE table_name = 'CartItem';
   ```

   Should show a unique constraint on `(cartId, productId, variantId)`

## If Migration Fails

The migration might fail if:

- The old unique constraint `CartItem_cartId_variantId_key` doesn't exist
- Or if there's existing data with conflicts

**Fix**: Check the actual constraint names first:

```sql
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'CartItem' AND constraint_type = 'UNIQUE';
```

Then update the migration SQL accordingly.
