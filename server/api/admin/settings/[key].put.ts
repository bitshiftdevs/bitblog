
import { z } from 'zod'
import { prisma, createAuditLog } from '~~/lib/utils/database'
import { verifyJWT } from '~~/server/utils/auth'

const UpdateSingleSettingSchema = z.object({
  value: z.any()
})

export default defineEventHandler(async (event) => {
  try {
    // Verify authentication and permissions
    const user = await verifyJWT(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Check permissions
    const hasPermission = user.permissions?.includes('settings.write') || 
                         user.permissions?.includes('admin')
    
    if (!hasPermission) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient permissions'
      })
    }

    const key = getRouterParam(event, 'key')
    if (!key) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Setting key is required'
      })
    }

    const body = await readBody(event)
    const { value } = UpdateSingleSettingSchema.parse(body)

    const clientIP = getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'

    // Get previous value for audit log
    const previousSetting = await prisma.siteSettings.findUnique({
      where: { key }
    })

    // Update setting
    const setting = await prisma.siteSettings.upsert({
      where: { key },
      update: {
        value,
        updatedById: user.sub,
      },
      create: {
        key,
        value,
        updatedById: user.sub,
      }
    })

    // Log the change
    await createAuditLog({
      entity: 'site_settings',
      entityId: setting.id,
      action: previousSetting ? 'update' : 'create',
      details: { 
        key, 
        previousValue: previousSetting?.value || null, 
        newValue: value 
      },
      userId: user.sub,
      ipAddress: clientIP,
      userAgent,
    })

    return {
      success: true,
      data: {
        key: setting.key,
        value: setting.value,
        updatedAt: setting.updatedAt.toISOString(),
      }
    }

  } catch (error) {
    console.error(`Error updating setting ${getRouterParam(event, 'key')}:`, error)
    
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid setting data',
        data: error.errors
      })
    }
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update setting'
    })
  }
})

