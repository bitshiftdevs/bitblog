import { jwtVerify } from 'jose'

export async function verifyJWT(event: any) {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  try {
    const jwtSecret = new TextEncoder().encode(config.jwtSecret)
    const { payload } = await jwtVerify(token, jwtSecret)
    
    return payload as {
      sub: string
      email: string
      name: string
      permissions: string[]
    }
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export function requireAuth(event: any) {
  return verifyJWT(event).then(user => {
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    return user
  })
}

export function requirePermission(permission: string) {
  return async (event: any) => {
    const user = await requireAuth(event)
    
    const hasPermission = user.permissions?.includes(permission) || 
                         user.permissions?.includes('admin')
    
    if (!hasPermission) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient permissions'
      })
    }
    
    return user
  }
}
