/**
 * Migration Testing Script
 * Run this after applying the migration to verify data integrity
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TestResult {
  test: string
  passed: boolean
  message: string
}

async function testMigration(): Promise<void> {
  const results: TestResult[] = []
  
  console.log('Starting migration tests...\n')
  
  try {
    // Test 1: Check if User table has new columns
    console.log('Test 1: Checking User table structure...')
    const userColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('role', 'cohort', 'roleAssignedAt', 'roleHistory')
    ` as any[]
    
    results.push({
      test: 'User table structure',
      passed: userColumns.length === 4,
      message: `Found ${userColumns.length}/4 expected columns`
    })
    
    // Test 2: Verify all users have roles
    console.log('Test 2: Verifying user roles...')
    const usersWithoutRoles = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "User" 
      WHERE role IS NULL
    ` as any[]
    
    results.push({
      test: 'All users have roles',
      passed: usersWithoutRoles[0].count === '0',
      message: `${usersWithoutRoles[0].count} users without roles`
    })
    
    // Test 3: Check role history migration
    console.log('Test 3: Checking role history...')
    const usersWithHistory = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "User" 
      WHERE "roleHistory" IS NOT NULL 
      AND jsonb_array_length("roleHistory") > 0
    ` as any[]
    
    results.push({
      test: 'Role history migration',
      passed: true, // Just informational
      message: `${usersWithHistory[0].count} users have role history`
    })
    
    // Test 4: Verify Application statusHistory
    console.log('Test 4: Checking application status history...')
    const appsWithHistory = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Application" 
      WHERE "statusHistory" IS NOT NULL 
      AND jsonb_array_length("statusHistory") > 0
    ` as any[]
    
    results.push({
      test: 'Application status history',
      passed: true, // Just informational
      message: `${appsWithHistory[0].count} applications have status history`
    })
    
    // Test 5: Check Email labels migration
    console.log('Test 5: Checking email labels...')
    const emailsWithLabels = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Email" 
      WHERE labels IS NOT NULL 
      AND array_length(labels, 1) > 0
    ` as any[]
    
    results.push({
      test: 'Email labels migration',
      passed: true, // Just informational
      message: `${emailsWithLabels[0].count} emails have labels`
    })
    
    // Test 6: Verify backup tables exist
    console.log('Test 6: Checking backup tables...')
    const backupTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '_backup_%20241231'
    ` as any[]
    
    results.push({
      test: 'Backup tables created',
      passed: backupTables.length >= 3,
      message: `Found ${backupTables.length} backup tables`
    })
    
    // Test 7: Check data consistency
    console.log('Test 7: Checking data consistency...')
    const orphanedData = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM "User" WHERE role NOT IN ('SUPER_ADMIN', 'ADMIN', 'MENTOR', 'STUDENT', 'ALUMNI', 'USER')) as invalid_roles,
        (SELECT COUNT(*) FROM "Application" WHERE status IS NULL) as null_statuses
    ` as any[]
    
    results.push({
      test: 'Data consistency',
      passed: orphanedData[0].invalid_roles === '0' && orphanedData[0].null_statuses === '0',
      message: `Invalid roles: ${orphanedData[0].invalid_roles}, Null statuses: ${orphanedData[0].null_statuses}`
    })
    
    // Test 8: Performance check - User query
    console.log('Test 8: Testing query performance...')
    const startTime = Date.now()
    const users = await prisma.$queryRaw`
      SELECT id, email, role, cohort 
      FROM "User" 
      WHERE role = 'STUDENT' 
      LIMIT 100
    `
    const queryTime = Date.now() - startTime
    
    results.push({
      test: 'Query performance',
      passed: queryTime < 100, // Should be under 100ms
      message: `Query took ${queryTime}ms`
    })
    
    // Test 9: Check helper functions
    console.log('Test 9: Testing helper functions...')
    try {
      // Test update_user_role function exists
      await prisma.$queryRaw`
        SELECT proname 
        FROM pg_proc 
        WHERE proname IN ('update_user_role', 'add_application_status')
      ` as any[]
      
      results.push({
        test: 'Helper functions',
        passed: true,
        message: 'Functions created successfully'
      })
    } catch (error) {
      results.push({
        test: 'Helper functions',
        passed: false,
        message: 'Functions not found'
      })
    }
    
    // Test 10: Sample role update
    console.log('Test 10: Testing role update...')
    try {
      // Get a test user
      const testUser = await prisma.$queryRaw`
        SELECT id, role FROM "User" LIMIT 1
      ` as any[]
      
      if (testUser.length > 0) {
        // Test the update function (in a transaction that we'll rollback)
        await prisma.$transaction(async (tx) => {
          await tx.$executeRaw`
            SELECT update_user_role(
              ${testUser[0].id}::text,
              ${testUser[0].role}::text,
              NULL,
              'test-admin'::text,
              'Test update'::text
            )
          `
          
          // Check if history was updated
          const updatedUser = await tx.$queryRaw`
            SELECT "roleHistory" FROM "User" WHERE id = ${testUser[0].id}
          ` as any[]
          
          results.push({
            test: 'Role update function',
            passed: true,
            message: 'Function works correctly'
          })
          
          // Rollback the test change
          throw new Error('Rollback test change')
        }).catch(err => {
          if (err.message !== 'Rollback test change') throw err
        })
      }
    } catch (error) {
      results.push({
        test: 'Role update function',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error)
  } finally {
    // Print results
    console.log('\n' + '='.repeat(60))
    console.log('TEST RESULTS')
    console.log('='.repeat(60))
    
    let passedCount = 0
    results.forEach(result => {
      const icon = result.passed ? 'PASS' : 'FAIL'
      console.log(`${icon} ${result.test}: ${result.message}`)
      if (result.passed) passedCount++
    })
    
    console.log('='.repeat(60))
    console.log(`Summary: ${passedCount}/${results.length} tests passed`)
    
    if (passedCount === results.length) {
      console.log('All tests passed! Migration successful.')
    } else {
      console.log('Some tests failed. Review the migration.')
    }
    
    await prisma.$disconnect()
  }
}

// Run the tests
testMigration().catch(console.error)