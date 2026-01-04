#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { glob } from 'glob'

async function fixDynamicRoute(filePath: string) {
  try {
    let content = await fs.readFile(filePath, 'utf-8')
    
    // Check if it has dynamic params
    if (!content.includes('{ params }')) {
      return false
    }
    
    // Fix GET function
    content = content.replace(
      /export async function GET\(\s*request: NextRequest,\s*\{ params \}: \{ params: \{ (\w+): string(; \w+: string)* \} \}\s*\)/g,
      (match, param1) => {
        const paramName = param1
        return `export async function GET(\n  request: NextRequest,\n  { params }: { params: Promise<{ ${paramName}: string }> }\n)`
      }
    )
    
    // Fix PATCH function
    content = content.replace(
      /export async function PATCH\(\s*request: NextRequest,\s*\{ params \}: \{ params: \{ (\w+): string(; \w+: string)* \} \}\s*\)/g,
      (match, param1) => {
        const paramName = param1
        return `export async function PATCH(\n  request: NextRequest,\n  { params }: { params: Promise<{ ${paramName}: string }> }\n)`
      }
    )
    
    // Fix PUT function
    content = content.replace(
      /export async function PUT\(\s*request: NextRequest,\s*\{ params \}: \{ params: \{ (\w+): string(; \w+: string)* \} \}\s*\)/g,
      (match, param1) => {
        const paramName = param1
        return `export async function PUT(\n  request: NextRequest,\n  { params }: { params: Promise<{ ${paramName}: string }> }\n)`
      }
    )
    
    // Fix DELETE function
    content = content.replace(
      /export async function DELETE\(\s*request: NextRequest,\s*\{ params \}: \{ params: \{ (\w+): string(; \w+: string)* \} \}\s*\)/g,
      (match, param1) => {
        const paramName = param1
        return `export async function DELETE(\n  request: NextRequest,\n  { params }: { params: Promise<{ ${paramName}: string }> }\n)`
      }
    )
    
    // Fix POST function
    content = content.replace(
      /export async function POST\(\s*request: NextRequest,\s*\{ params \}: \{ params: \{ (\w+): string(; \w+: string)* \} \}\s*\)/g,
      (match, param1) => {
        const paramName = param1
        return `export async function POST(\n  request: NextRequest,\n  { params }: { params: Promise<{ ${paramName}: string }> }\n)`
      }
    )
    
    // Add await params at the beginning of each function
    const functions = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
    for (const func of functions) {
      const regex = new RegExp(
        `export async function ${func}\\([^)]+\\{ params \\}: \\{ params: Promise<\\{ (\\w+): string \\}> \\}\\s*\\)\\s*\\{\\s*try \\{`,
        'g'
      )
      content = content.replace(regex, (match, param1) => {
        return match + `\n    const { ${param1} } = await params`
      })
    }
    
    // Replace params.id with id, params.slug with slug etc
    content = content.replace(/params\.(\w+)/g, '$1')
    
    await fs.writeFile(filePath, content, 'utf-8')
    console.log(`Fixed: ${filePath}`)
    return true
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error)
    return false
  }
}

async function main() {
  const dynamicRoutes = [
    'app/api/calendar/events/[id]/route.ts',
    'app/api/calendar/events/[id]/rsvp/route.ts',
    'app/api/tasks/[id]/route.ts',
    'app/api/resources/[id]/route.ts',
    'app/api/profile/[slug]/route.ts'
  ]
  
  for (const route of dynamicRoutes) {
    const fullPath = path.join(process.cwd(), route)
    await fixDynamicRoute(fullPath)
  }
  
  console.log('Done fixing dynamic routes!')
}

main().catch(console.error)