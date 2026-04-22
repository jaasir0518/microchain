# 🔧 MongoDB Troubleshooting Guide

## Common Issues & Solutions

---

## 1. Connection Issues

### ❌ Error: "MongooseServerSelectionError: connect ECONNREFUSED"

**Cause**: Cannot connect to MongoDB Atlas

**Solutions**:

```bash
# 1. Check .env file exists and has correct URI
cat .env | grep MONGODB_URI

# 2. Verify network connectivity
ping microchain.rkonfon.mongodb.net

# 3. Check IP whitelist in MongoDB Atlas
# Go to: Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

# 4. Test connection string
npx tsx -e "
import mongoose from 'mongoose';
await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected!');
process.exit(0);
"
```

---

### ❌ Error: "MongooseError: Operation buffering timed out"

**Cause**: Connection not established before query

**Solution**:

```typescript
// ❌ Wrong - Query before connection
const users = await User.find();

// ✅ Correct - Ensure connection first
import connectDB from './lib/mongoose';
await connectDB();
const users = await User.find();
```

---

## 2. Authentication Issues

### ❌ Error: "Authentication failed"

**Cause**: Wrong username/password in connection string

**Solutions**:

```bash
# 1. Check credentials in .env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/database

# 2. Verify user exists in MongoDB Atlas
# Go to: Database Access → Check user

# 3. Reset password if needed
# Go to: Database Access → Edit User → Update Password

# 4. Ensure special characters are URL-encoded
# @ → %40
# : → %3A
# / → %2F
```

---

## 3. Schema Validation Errors

### ❌ Error: "Validation failed: email: Path `email` is required"

**Cause**: Missing required field

**Solution**:

```typescript
// ❌ Wrong - Missing required field
await User.create({
  name: 'John Doe',
  password: 'secret123'
  // Missing email!
});

// ✅ Correct - All required fields
await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secret123'
});
```

---

### ❌ Error: "E11000 duplicate key error"

**Cause**: Trying to insert duplicate unique value

**Solutions**:

```typescript
// Check if exists first
const existingUser = await User.findOne({ email });
if (existingUser) {
  throw new Error('Email already registered');
}

// Or use upsert
await User.findOneAndUpdate(
  { email },
  { name, password },
  { upsert: true, new: true }
);

// Or handle the error
try {
  await User.create({ email, name, password });
} catch (error) {
  if (error.code === 11000) {
    throw new Error('Email already exists');
  }
  throw error;
}
```

---

## 4. Query Issues

### ❌ Error: "Cast to ObjectId failed"

**Cause**: Invalid ObjectId format

**Solution**:

```typescript
import mongoose from 'mongoose';

// ❌ Wrong - Invalid ID
const user = await User.findById('invalid-id');

// ✅ Correct - Validate first
if (!mongoose.Types.ObjectId.isValid(userId)) {
  throw new Error('Invalid user ID');
}
const user = await User.findById(userId);
```

---

### ❌ Issue: Queries are slow

**Cause**: Missing indexes or inefficient queries

**Solutions**:

```typescript
// 1. Check if query uses index
const explain = await User.find({ email: 'test@example.com' }).explain();
console.log(explain.executionStats);

// 2. Create missing indexes
await User.createIndexes();

// 3. Use lean() for read-only queries (30% faster)
const users = await User.find().lean();

// 4. Select only needed fields
const users = await User.find().select('name email trustScore');

// 5. Limit results
const users = await User.find().limit(20);
```

---

## 5. Password Issues

### ❌ Issue: Password not hashing

**Cause**: Pre-save hook not triggering

**Solution**:

```typescript
// ❌ Wrong - Bypasses pre-save hook
await User.updateOne({ _id: userId }, { password: 'newpass' });

// ✅ Correct - Triggers pre-save hook
const user = await User.findById(userId);
user.password = 'newpass';
await user.save();
```

---

### ❌ Issue: Password comparison fails

**Cause**: Not selecting password field

**Solution**:

```typescript
// ❌ Wrong - Password not included (select: false in schema)
const user = await User.findOne({ email });
const isMatch = await user.comparePassword(password); // Error!

// ✅ Correct - Explicitly select password
const user = await User.findOne({ email }).select('+password');
const isMatch = await user.comparePassword(password);
```

---

## 6. Relationship Issues

### ❌ Issue: Populate returns null

**Cause**: Referenced document doesn't exist

**Solution**:

```typescript
// Check if reference exists
const loan = await Loan.findById(loanId).populate('userId');
if (!loan.userId) {
  console.error('Referenced user not found');
}

// Or use populate with error handling
const loan = await Loan.findById(loanId)
  .populate({
    path: 'userId',
    select: 'name email',
    options: { strictPopulate: false }
  });
```

---

## 7. Transaction Issues

### ❌ Error: "Transaction numbers are only allowed on a replica set"

**Cause**: Transactions require replica set (not available on free tier)

**Solution**:

```typescript
// ❌ Won't work on free tier
const session = await mongoose.startSession();
session.startTransaction();

// ✅ Alternative - Use atomic operations
await Promise.all([
  Loan.create({ ... }),
  TrustCircle.updateOne({ ... })
]);

// Or use $inc for atomic updates
await TrustCircle.updateOne(
  { _id: circleId },
  { $inc: { poolBalance: -amount } }
);
```

---

## 8. Memory Issues

### ❌ Issue: Out of memory with large queries

**Cause**: Loading too much data at once

**Solutions**:

```typescript
// ❌ Wrong - Loads everything into memory
const allLoans = await Loan.find();

// ✅ Correct - Use cursor for large datasets
const cursor = Loan.find().cursor();
for (let loan = await cursor.next(); loan != null; loan = await cursor.next()) {
  // Process one at a time
  console.log(loan);
}

// Or use pagination
const page = 1;
const limit = 20;
const loans = await Loan.find()
  .skip((page - 1) * limit)
  .limit(limit);
```

---

## 9. Index Issues

### ❌ Issue: Indexes not being used

**Cause**: Query doesn't match index pattern

**Solution**:

```typescript
// Index: { circleId: 1, status: 1 }

// ❌ Wrong - Doesn't use compound index efficiently
const loans = await Loan.find({ status: 'approved' });

// ✅ Correct - Uses compound index
const loans = await Loan.find({ circleId, status: 'approved' });

// Check index usage
const explain = await Loan.find({ circleId, status: 'approved' }).explain();
console.log(explain.executionStats.executionStages);
```

---

## 10. Date Issues

### ❌ Issue: Date queries not working

**Cause**: Comparing Date objects incorrectly

**Solution**:

```typescript
// ❌ Wrong - String comparison
const overdue = await Loan.find({ dueDate: { $lt: new Date().toString() } });

// ✅ Correct - Date object comparison
const overdue = await Loan.find({ dueDate: { $lt: new Date() } });

// For date ranges
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-12-31');
const loans = await Loan.find({
  createdAt: { $gte: startDate, $lte: endDate }
});
```

---

## 🔍 Debugging Tools

### 1. Enable Mongoose Debug Mode

```typescript
mongoose.set('debug', true);
// Shows all queries in console
```

### 2. Check Connection State

```typescript
console.log('Connection state:', mongoose.connection.readyState);
// 0 = disconnected
// 1 = connected
// 2 = connecting
// 3 = disconnecting
```

### 3. Monitor Queries

```typescript
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});
```

### 4. Validate Documents

```typescript
const user = new User({ email: 'test@example.com' });
const error = user.validateSync();
if (error) {
  console.error('Validation errors:', error.errors);
}
```

### 5. Check Index Usage

```bash
# Run setup script to verify indexes
npm run db:setup

# Or manually check
npx tsx -e "
import User from './models/User';
const indexes = await User.collection.getIndexes();
console.log(indexes);
"
```

---

## 🚨 Emergency Commands

### Reset Database (DANGER!)

```typescript
// ⚠️ WARNING: Deletes ALL data!
await mongoose.connection.dropDatabase();
```

### Drop Specific Collection

```typescript
await User.collection.drop();
```

### Rebuild Indexes

```typescript
await User.collection.dropIndexes();
await User.createIndexes();
```

### Clear Cache

```typescript
// Clear Mongoose model cache
delete mongoose.models.User;
delete mongoose.modelSchemas.User;
```

---

## 📊 Health Check Script

```typescript
// scripts/health-check.ts
import connectDB from '../lib/mongoose';
import mongoose from 'mongoose';

async function healthCheck() {
  try {
    await connectDB();
    
    const health = {
      connected: mongoose.connection.readyState === 1,
      database: mongoose.connection.db.databaseName,
      host: mongoose.connection.host,
      collections: await mongoose.connection.db.listCollections().toArray(),
      ping: await mongoose.connection.db.admin().ping()
    };
    
    console.log('✅ Health Check:', JSON.stringify(health, null, 2));
  } catch (error) {
    console.error('❌ Health Check Failed:', error);
  }
}

healthCheck();
```

---

## 🆘 Getting Help

1. **Check Logs**: Look for error messages in console
2. **Run Setup**: `npm run db:setup` to verify configuration
3. **Test Connection**: Use health check script above
4. **MongoDB Atlas**: Check Network Access and Database Access settings
5. **Documentation**: See `MONGODB_GUIDE.md` for detailed info

---

## 📚 Useful Resources

- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [MongoDB Error Codes](https://docs.mongodb.com/manual/reference/error-codes/)
- [Mongoose Debugging](https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-set)

---

**Last Updated**: Phase 2 Complete  
**Support**: Check project documentation or MongoDB Atlas support
