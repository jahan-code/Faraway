import Redis from 'ioredis';

// Redis client configuration
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: false, // Connect immediately
  keepAlive: 30000,
  connectTimeout: 5000, // Faster timeout
  commandTimeout: 3000, // Faster command timeout
  maxLoadingTimeout: 3000, // Faster loading timeout
  enableOfflineQueue: false, // Don't queue commands when disconnected
});

// Redis connection event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('ready', () => {
  console.log('🚀 Redis ready for commands');
  // Test Redis performance on startup
  testRedisPerformance();
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

redis.on('close', () => {
  console.log('⚠️ Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

// Test Redis performance
async function testRedisPerformance() {
  try {
    const start = Date.now();
    await redis.ping();
    const responseTime = Date.now() - start;
    
    if (responseTime < 100) {
      console.log(`⚡ Redis ping: ${responseTime}ms (Excellent)`);
    } else if (responseTime < 500) {
      console.log(`✅ Redis ping: ${responseTime}ms (Good)`);
    } else {
      console.log(`⚠️ Redis ping: ${responseTime}ms (Slow - check connection)`);
    }
  } catch (error) {
    console.error('❌ Redis ping failed:', error.message);
  }
}

// Cache middleware for yacht listings
export const cacheYachtList = async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const cacheKey = `yachts:${page}:${limit}:${status || 'all'}`;
  
  try {
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      console.log(`⚡ Cache HIT for yacht list | Key: ${cacheKey}`);
      return res.json(JSON.parse(cachedData));
    }
    
    console.log(`🔄 Cache MISS for yacht list | Key: ${cacheKey}`);
    
    // Store original send method
    const originalSend = res.json;
    
    // Override send method to cache response
    res.json = function(data) {
      // Cache for 5 minutes
      redis.setex(cacheKey, 300, JSON.stringify(data))
        .then(() => console.log(`💾 Cached yacht list data | Key: ${cacheKey}`))
        .catch(err => console.error('Cache write error:', err.message));
      
      return originalSend.call(this, data);
    };
    
    next();
  } catch (error) {
    console.log(`⚠️ Redis cache failed for yacht list | Error: ${error.message}`);
    next(); // Continue without cache if Redis fails
  }
};

// Cache middleware for individual yacht
export const cacheYachtById = async (req, res, next) => {
  const { id } = req.query;
  const cacheKey = `yacht:${id}`;
  
  try {
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      console.log(`⚡ Cache HIT for yacht by ID | ID: ${id}`);
      return res.json(JSON.parse(cachedData));
    }
    
    console.log(`🔄 Cache MISS for yacht by ID | ID: ${id}`);
    
    // Store original send method
    const originalSend = res.json;
    
    // Override send method to cache response
    res.json = function(data) {
      // Cache for 10 minutes (longer for individual yachts)
      redis.setex(cacheKey, 600, JSON.stringify(data))
        .then(() => console.log(`💾 Cached yacht by ID data | ID: ${id}`))
        .catch(err => console.error('Cache write error:', err.message));
      
      return originalSend.call(this, data);
    };
    
    next();
  } catch (error) {
    console.log(`⚠️ Redis cache failed for yacht by ID | Error: ${error.message} | ID: ${id}`);
    next(); // Continue without cache if Redis fails
  }
};

// Cache middleware for blog listings
export const cacheBlogList = async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const cacheKey = `blogs:${page}:${limit}:${status || 'all'}`;
  
  try {
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      console.log(`⚡ Cache HIT for blog list | Key: ${cacheKey}`);
      return res.json(JSON.parse(cachedData));
    }
    
    console.log(`🔄 Cache MISS for blog list | Key: ${cacheKey}`);
    
    // Store original send method
    const originalSend = res.json;
    
    // Override send method to cache response
    res.json = function(data) {
      // Cache for 5 minutes
      redis.setex(cacheKey, 300, JSON.stringify(data))
        .then(() => console.log(`💾 Cached blog list data | Key: ${cacheKey}`))
        .catch(err => console.error('Cache write error:', err.message));
      
      return originalSend.call(this, data);
    };
    
    next();
  } catch (error) {
    console.log(`⚠️ Redis cache failed for blog list | Error: ${error.message}`);
    next(); // Continue without cache if Redis fails
  }
};

// Cache middleware for individual blog
export const cacheBlogById = async (req, res, next) => {
  const { id } = req.query;
  const cacheKey = `blog:${id}`;
  
  try {
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      console.log(`⚡ Cache HIT for blog by ID | ID: ${id}`);
      return res.json(JSON.parse(cachedData));
    }
    
    console.log(`🔄 Cache MISS for blog by ID | ID: ${id}`);
    
    // Store original send method
    const originalSend = res.json;
    
    // Override send method to cache response
    res.json = function(data) {
      // Cache for 10 minutes (longer for individual blogs)
      redis.setex(cacheKey, 600, JSON.stringify(data))
        .then(() => console.log(`💾 Cached blog by ID data | ID: ${id}`))
        .catch(err => console.error('Cache write error:', err.message));
      
      return originalSend.call(this, data);
    };
    
    next();
  } catch (error) {
    console.log(`⚠️ Redis cache failed for blog by ID | Error: ${error.message} | ID: ${id}`);
    next(); // Continue without cache if Redis fails
  }
};

// Clear cache when yacht data changes
export const clearYachtCache = async () => {
  try {
    const keys = await redis.keys('yachts:*');
    const individualKeys = await redis.keys('yacht:*');
    if (keys.length > 0 || individualKeys.length > 0) {
      await redis.del(...keys, ...individualKeys);
      console.log('🗑️ Cleared all yacht cache');
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

// Clear cache when blog data changes
export const clearBlogCache = async () => {
  try {
    const keys = await redis.keys('blogs:*');
    const individualKeys = await redis.keys('blog:*');
    if (keys.length > 0 || individualKeys.length > 0) {
      await redis.del(...keys, ...individualKeys);
      console.log('🗑️ Cleared all blog cache');
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

export default redis;
