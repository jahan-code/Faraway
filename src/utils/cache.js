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
  try {
    const { page = 1, limit = 10, status } = req.query;
    const cacheKey = `yachts:${page}:${limit}:${status || 'all'}`;
    
    // Fast Redis check with very short timeout
    const cachedData = await Promise.race([
      redis.get(cacheKey),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis timeout')), 200) // Only 200ms timeout!
      )
    ]);
    
    if (cachedData) {
      console.log('⚡ Cache hit for yacht list');
      return res.json(JSON.parse(cachedData));
    }
    
    // Store original send method
    const originalSend = res.json;
    
    // Override send method to cache response (async, don't wait)
    res.json = function(data) {
      // Cache for 5 minutes (don't block response)
      redis.setex(cacheKey, 300, JSON.stringify(data))
        .then(() => console.log('💾 Cached yacht list data'))
        .catch(err => console.error('Cache write error:', err.message));
      
      return originalSend.call(this, data);
    };
    
    next();
  } catch (error) {
    console.log('⚠️ Redis cache failed, using database directly');
    next(); // Continue without cache if Redis fails
  }
};

// Cache middleware for individual yacht
export const cacheYachtById = async (req, res, next) => {
  try {
    const { id } = req.query;
    const cacheKey = `yacht:${id}`;
    
    // Try to get from cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log('✅ Cache hit for yacht by ID');
      return res.json(JSON.parse(cachedData));
    }
    
    // Store original send method
    const originalSend = res.json;
    
    // Override send method to cache response
    res.json = function(data) {
      // Cache for 10 minutes (longer for individual yachts)
      redis.setex(cacheKey, 600, JSON.stringify(data));
      console.log('💾 Cached yacht by ID data');
      return originalSend.call(this, data);
    };
    
    next();
  } catch (error) {
    console.error('Cache error:', error);
    next(); // Continue without cache if Redis fails
  }
};

// Cache middleware for blog listings
export const cacheBlogList = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const cacheKey = `blogs:${page}:${limit}:${status || 'all'}`;
    
    // Try to get from cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log('✅ Cache hit for blog list');
      return res.json(JSON.parse(cachedData));
    }
    
    // Store original send method
    const originalSend = res.json;
    
    // Override send method to cache response
    res.json = function(data) {
      // Cache for 5 minutes
      redis.setex(cacheKey, 300, JSON.stringify(data));
      console.log('💾 Cached blog list data');
      return originalSend.call(this, data);
    };
    
    next();
  } catch (error) {
    console.error('Cache error:', error);
    next(); // Continue without cache if Redis fails
  }
};

// Cache middleware for individual blog
export const cacheBlogById = async (req, res, next) => {
  try {
    const { id } = req.query;
    const cacheKey = `blog:${id}`;
    
    // Try to get from cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log('✅ Cache hit for blog by ID');
      return res.json(JSON.parse(cachedData));
    }
    
    // Store original send method
    const originalSend = res.json;
    
    // Override send method to cache response
    res.json = function(data) {
      // Cache for 10 minutes (longer for individual blogs)
      redis.setex(cacheKey, 600, JSON.stringify(data));
      console.log('💾 Cached blog by ID data');
      return originalSend.call(this, data);
    };
    
    next();
  } catch (error) {
    console.error('Cache error:', error);
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
