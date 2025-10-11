/**
 * Additional Services Types (Services 50-59)
 *
 * This file contains TypeScript interfaces for all 10 additional services
 * offered as part of the comprehensive solution package.
 *
 * These services include data management, reporting, training, support, and consulting.
 */

// ============================================================================
// Service #50: Data Cleanup - ניקוי והסרת כפילויות בנתונים
// ============================================================================

/**
 * Service #50: Data Cleanup
 * ניקוי והסרת כפילויות בנתונים
 *
 * Removes duplicates, merges data, fixes errors, and improves data quality across systems.
 * Uses fuzzy matching algorithms and ML-based detection for intelligent deduplication.
 */
export interface DataCleanupRequirements {
  // Data Sources
  dataSources: {
    systemName: string; // e.g., "Zoho CRM", "MySQL Database", "Excel Files"
    accessType: 'api' | 'export' | 'direct_db' | 'spreadsheet';
    recordCount: number; // Total number of records to process
    hasBackup: boolean; // Whether a backup exists
  }[];

  // Cleanup Scope
  cleanupScope: {
    removeDuplicates: boolean;
    fixDataQualityIssues: boolean;
    standardizeFormats: boolean; // Phone numbers, emails, addresses
    enrichData?: boolean; // Add missing information
    mergeAccounts?: boolean; // Combine related records
  };

  // Deduplication Rules
  deduplicationRules: {
    matchFields: string[]; // e.g., ['email', 'phone', 'company', 'name']
    matchingAlgorithm: 'exact' | 'fuzzy' | 'ml_based'; // Levenshtein, Jaro-Winkler, AI
    fuzzyThreshold?: number; // 0-100, for fuzzy matching (default: 80)
    mergeStrategy: 'keep_first' | 'keep_last' | 'keep_most_complete' | 'manual_review';
    conflictResolution?: {
      fieldName: string;
      rule: string; // e.g., "prefer non-empty", "take latest", "manual review"
    }[];
  };

  // Data Quality Rules
  dataQualityRules?: {
    ruleName: string; // e.g., "Valid Email Format"
    fieldName: string;
    validation: string; // e.g., "valid email format", "phone 10 digits", "required field"
    action: 'flag' | 'fix' | 'remove'; // What to do with invalid data
  }[];

  // Backup & Safety
  backupRequired: boolean;
  dryRunFirst: boolean; // Test run without making changes
  requiresApproval: boolean; // Manual approval before applying changes
  stagingEnvironment?: boolean; // Test in staging first

  // Business Rules
  businessRules?: {
    ruleName: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];

  // Deliverables
  deliverables: {
    beforeAfterReport: boolean; // Data quality comparison
    duplicatesList: boolean; // Excel file with identified duplicates
    cleanedData: boolean; // Processed data back to system
    validationReport?: boolean; // Post-cleanup validation results
    documentedRules?: boolean; // Documentation of applied rules
  };

  // Timeline & Scope
  estimatedDays: number; // 3-7 days typical (100K records: 3 days, 100K-1M: 5-7 days)
  recordVolumeCategory: 'small' | 'medium' | 'large'; // <100K, 100K-1M, >1M

  // Success Metrics
  successMetrics?: {
    targetDuplicateReduction: number; // % (e.g., 95%)
    targetDataQualityScore: number; // % (e.g., 90%)
    targetEmptyFieldReduction: number; // %
  };
}

// ============================================================================
// Service #51: Data Migration - העברת נתונים
// ============================================================================

/**
 * Service #51: Data Migration
 * העברת נתונים בין מערכות
 *
 * Transfers data between systems (old CRM to new, Excel to CRM, merging multiple sources).
 * Includes ETL process, field mapping, validation, and rollback capabilities.
 */
export interface DataMigrationRequirements {
  // Source System(s)
  sourceSystems: {
    systemName: string; // e.g., "Old Salesforce", "Excel Files", "Legacy Database"
    systemType: string; // e.g., "CRM", "Database", "Spreadsheet"
    accessMethod: 'api' | 'export' | 'direct_db' | 'ftp' | 'manual';
    apiCredentials?: boolean;
    exportFormat?: 'csv' | 'excel' | 'json' | 'sql' | 'xml';
    recordCount: number;
    dataQualityScore?: number; // 0-100
  }[];

  // Target System(s)
  targetSystems: {
    systemName: string; // e.g., "Zoho CRM", "New Database", "Data Warehouse"
    systemType: string;
    importMethod: 'api' | 'bulk_import' | 'direct_db' | 'etl_tool';
    apiCredentials?: boolean;
    hasAdminAccess: boolean;
    requiresFieldMapping: boolean;
  }[];

  // Migration Strategy
  migrationStrategy: {
    approach: 'big_bang' | 'phased' | 'parallel' | 'pilot_first';
    phasePlan?: string[]; // e.g., ["Phase 1: Accounts", "Phase 2: Contacts", "Phase 3: Deals"]
    pilotRecordCount?: number; // For pilot approach (10-100 records)
    freezeSourceDuringMigration: boolean;
  };

  // Field Mapping
  fieldMapping: {
    hasMappingDocument: boolean;
    mappingComplexity: 'simple' | 'medium' | 'complex'; // 1-to-1, transformations, calculations
    requiresDataTransformation: boolean;
    customCalculations?: {
      targetField: string;
      formula: string; // e.g., "firstName + ' ' + lastName"
    }[];
  };

  // Data Transformation
  dataTransformation?: {
    transformationType: 'format_change' | 'value_mapping' | 'calculation' | 'enrichment';
    description: string;
    toolsRequired: string[]; // e.g., ["Python script", "Talend", "SSIS"]
  }[];

  // Testing & Validation
  testingApproach: {
    pocMigration: boolean; // Proof of concept with sample data
    pocRecordCount?: number;
    validationRules: string[]; // e.g., ["Record count match", "Referential integrity", "Data accuracy"]
    userAcceptanceTesting: boolean;
    rollbackPlan: boolean;
  };

  // Data Quality & Cleanup
  dataPreparation: {
    cleanupRequired: boolean; // Remove duplicates before migration
    deduplicationNeeded: boolean;
    dataValidationNeeded: boolean;
    enrichmentNeeded?: boolean;
  };

  // Rollback & Recovery
  rollbackPlan: {
    hasBackup: boolean;
    backupLocation?: string;
    rollbackProcedure: string; // e.g., "Restore from backup", "Delete imported records"
    snapshotBeforeMigration: boolean;
  };

  // Deliverables
  deliverables: {
    fieldMappingDocument: boolean;
    migrationScripts: boolean;
    validationReport: boolean; // Before/after comparison
    rollbackProcedure: boolean;
    userDocumentation?: boolean;
  };

  // Timeline
  timeline: {
    pocDays: number; // 1-2 days typical
    fullMigrationDays: number; // 3-10 days depending on volume
    postMigrationValidationDays: number; // 1-2 days
  };

  // Success Criteria
  successCriteria: {
    targetCompletionRate: number; // % (e.g., 100%)
    maxErrorRate: number; // % (e.g., <1%)
    referentialIntegrityCheck: boolean;
    userAcceptanceRequired: boolean;
  };
}

// ============================================================================
// Service #52: Add Dashboard - הוספת דשבורד
// ============================================================================

/**
 * Service #52: Add Dashboard
 * הוספת דשבורד real-time
 *
 * Builds custom real-time dashboards for displaying business data, KPIs, and metrics.
 * Supports Power BI, Tableau, Looker, or custom React dashboards.
 */
export interface AddDashboardRequirements {
  // Platform Selection
  platform: {
    choice: 'power_bi' | 'tableau' | 'looker' | 'qlik' | 'custom_react' | 'superset';
    reason?: string; // Why this platform was chosen
    embeddedInExistingApp: boolean;
    standaloneUrl?: string;
  };

  // Data Sources
  dataSources: {
    sourceName: string; // e.g., "Zoho CRM", "MySQL Database", "Google Analytics"
    sourceType: 'database' | 'api' | 'spreadsheet' | 'cloud_service';
    connectionMethod: 'direct_db' | 'api' | 'odbc' | 'jdbc' | 'native_connector';
    refreshFrequency: 'real_time' | '15min' | '1hour' | 'daily' | 'weekly';
    requiresCredentials: boolean;
  }[];

  // KPIs & Metrics
  kpisAndMetrics: {
    category: string; // e.g., "Sales", "Customer Service", "Operations"
    metrics: {
      metricName: string; // e.g., "Monthly Revenue", "Lead Conversion Rate"
      metricType: 'number' | 'percentage' | 'currency' | 'trend' | 'comparison';
      dataSource: string;
      calculation?: string; // e.g., "SUM(revenue)", "COUNT(leads) / COUNT(opportunities)"
      targetValue?: number; // Goal or benchmark
    }[];
  }[];

  // Dashboard Design
  dashboardDesign: {
    hasWireframes: boolean;
    hasExampleDashboards: boolean; // Reference dashboards the client likes
    layout: 'single_page' | 'multi_page' | 'tabbed';
    visualizationTypes: ('chart' | 'table' | 'card' | 'gauge' | 'map' | 'timeline')[];
    colorScheme?: string; // e.g., "Corporate blue", "Viridis", "Custom"
    branding?: boolean; // Company logo, colors
  };

  // Interactivity
  interactivity: {
    filters: boolean; // Date range, region, product, etc.
    drillDown: boolean; // Click to see details
    crossFiltering: boolean; // Filter affects multiple visuals
    exportCapabilities: ('pdf' | 'png' | 'excel' | 'csv')[];
    scheduling?: boolean; // Scheduled refresh
  };

  // Access & Security
  accessControl: {
    authenticationMethod: 'sso' | 'username_password' | 'embedded_token';
    roleBasedAccess: boolean;
    userRoles?: {
      roleName: string; // e.g., "Executive", "Manager", "Analyst"
      permissions: string[]; // e.g., ["View all data", "Export reports"]
    }[];
  };

  // Performance & Optimization
  performance: {
    dataVolume: 'small' | 'medium' | 'large'; // <100K rows, 100K-1M, >1M
    useAggregatedViews: boolean; // Pre-calculate for speed
    cacheEnabled?: boolean;
    targetLoadTime: number; // Seconds (e.g., <3)
  };

  // Mobile & Responsiveness
  mobileSupport: {
    required: boolean;
    responsive: boolean;
    nativeApp?: boolean; // Power BI Mobile, Tableau Mobile
  };

  // Deliverables
  deliverables: {
    functionalDashboard: boolean;
    userGuide: boolean; // PDF or video
    accessCredentials: boolean;
    dataSourceDocumentation: boolean;
    trainingSession?: boolean;
  };

  // Timeline
  timeline: {
    complexity: 'simple' | 'medium' | 'complex';
    estimatedDays: number; // Simple: 3-5, Complex: 7-10
    includesDataModeling: boolean; // Extra time for data prep
  };

  // Target Audience
  targetAudience: {
    primaryUsers: string[]; // e.g., ["CEO", "Sales Manager", "Operations Team"]
    usageFrequency: 'daily' | 'weekly' | 'monthly' | 'ad_hoc';
    technicalLevel: 'executive' | 'manager' | 'analyst' | 'technical';
  };
}

// ============================================================================
// Service #53: Add Custom Reports - דוחות מותאמים
// ============================================================================

/**
 * Service #53: Add Custom Reports
 * דוחות מותאמים אישית
 *
 * Creates custom reports with specific breakdowns, data, and calculations unique to the business.
 * Supports SSRS, Crystal Reports, Power BI Report Builder, or custom Python/Node.js development.
 */
export interface AddCustomReportsRequirements {
  // Report Specifications
  reportSpecifications: {
    reportName: string; // e.g., "Monthly Sales by Region", "Customer Service Performance"
    reportPurpose: string; // What business question does it answer?
    reportType: 'summary' | 'detailed' | 'analytical' | 'operational' | 'dashboard_style';
    hasSampleReport: boolean; // Client provides example
    hasMockup: boolean; // Visual mockup of desired format
  }[];

  // Data Requirements
  dataRequirements: {
    dataSources: string[]; // e.g., ["Zoho CRM", "MySQL Sales DB", "Excel Files"]
    dataFields: {
      fieldName: string;
      fieldSource: string; // Which system/table
      dataType: 'text' | 'number' | 'date' | 'currency' | 'boolean';
      requiresCalculation?: string; // e.g., "SUM", "AVG", "COUNT", "Custom formula"
    }[];
    dateRanges: boolean; // Supports date filtering
    dynamicParameters: boolean; // User can change filters
  };

  // Breakdowns & Grouping
  breakdownsAndGrouping: {
    groupBy: string[]; // e.g., ["Region", "Product Category", "Sales Rep"]
    sortBy?: string[]; // e.g., ["Revenue DESC", "Date ASC"]
    subtotals: boolean;
    grandTotals: boolean;
    pivotTables?: boolean;
  };

  // Calculations & Formulas
  calculations?: {
    calculationName: string; // e.g., "Profit Margin", "Conversion Rate"
    formula: string; // e.g., "(Revenue - Cost) / Revenue * 100"
    displayFormat: string; // e.g., "Percentage with 2 decimals"
  }[];

  // Visualizations
  visualizations: {
    includesCharts: boolean;
    chartTypes?: ('bar' | 'line' | 'pie' | 'scatter' | 'area' | 'combo')[];
    includesTables: boolean;
    colorCoding?: boolean; // Conditional formatting (red/green)
    sparklines?: boolean; // Mini charts in tables
  };

  // Export Formats
  exportFormats: {
    primaryFormat: 'pdf' | 'excel' | 'csv' | 'word' | 'html';
    additionalFormats?: ('pdf' | 'excel' | 'csv' | 'word' | 'html')[];
    templateDesign?: boolean; // Custom branded template
  };

  // Report Generation
  generation: {
    generationMethod: 'ssrs' | 'crystal_reports' | 'power_bi_builder' | 'python_custom' | 'nodejs_custom';
    generationFrequency: 'on_demand' | 'scheduled' | 'both';
    averageDataVolume: 'small' | 'medium' | 'large'; // <10K rows, 10K-100K, >100K
    performanceTarget: number; // Generation time in seconds (e.g., <60)
  };

  // SQL Requirements
  sqlRequirements?: {
    complexityLevel: 'simple' | 'medium' | 'complex'; // Simple SELECT vs. multiple JOINs, subqueries
    requiresStoredProcedures: boolean;
    requiresViews: boolean;
    requiresWindowFunctions?: boolean; // Advanced SQL features
  };

  // Deliverables
  deliverables: {
    sampleReport: boolean; // Example with real data
    reportTemplate: boolean;
    technicalDocumentation: boolean; // Source queries, logic
    executionInstructions: boolean; // How to run the report
    sourceCode?: boolean; // If custom development
  };

  // Timeline
  timeline: {
    complexity: 'simple' | 'medium' | 'complex';
    estimatedDays: number; // Simple: 1-2, Medium: 3-5, Complex: 5-7
    includesDataModeling: boolean;
  };

  // Distribution
  distribution?: {
    recipients: string[]; // Email addresses or roles
    deliveryMethod: 'email' | 'file_share' | 'portal' | 'printed';
    frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  };

  // Success Criteria
  successCriteria: {
    dataAccuracy: boolean; // 100% match to source
    stakeholderApproval: boolean;
    performanceTarget: string; // e.g., "Generate in <5 minutes"
  };
}

// ============================================================================
// Service #54: Reports Automated - דיווח אוטומטי
// ============================================================================

/**
 * Service #54: Reports Automated
 * דיווח אוטומטי מתוזמן
 *
 * Automatic generation and distribution of reports on a fixed schedule (daily, weekly, monthly)
 * without manual intervention. Includes scheduling, distribution, and error handling.
 */
export interface ReportsAutomatedRequirements {
  // Base Report
  baseReport: {
    reportId?: string; // Reference to existing report from service #53
    reportName: string;
    reportType: string; // e.g., "Sales Performance", "Customer Service Metrics"
    isFromCustomReports: boolean; // Was created via service #53
  };

  // Scheduling Configuration
  scheduleConfiguration: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'event_driven';

    // For daily
    dailyTime?: string; // e.g., "08:00" (24-hour format)

    // For weekly
    weeklyDay?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    weeklyTime?: string;

    // For monthly
    monthlyDate?: number; // Day of month (1-31) or "last"
    monthlyTime?: string;

    // For event-driven
    eventTrigger?: string; // e.g., "When new data available", "When threshold reached"

    timezone: string; // e.g., "Asia/Jerusalem", "UTC"
  };

  // Dynamic Parameters
  dynamicParameters: {
    useDateRanges: boolean;
    dateRangeType?: 'yesterday' | 'last_week' | 'last_month' | 'last_quarter' | 'custom';
    customDateLogic?: string; // e.g., "Previous business week", "Rolling 30 days"

    useFilters: boolean;
    dynamicFilters?: {
      filterName: string; // e.g., "Region", "Product Line"
      filterValue: string; // e.g., "All", "Dynamic based on user"
    }[];
  };

  // Distribution List
  distributionList: {
    recipients: {
      email?: string;
      role?: string; // e.g., "Sales Manager", "Executive Team"
      name?: string;
    }[];

    // Bursting (separate reports per recipient)
    burstingEnabled: boolean;
    burstingCriteria?: {
      field: string; // e.g., "Region", "Department"
      filterPerRecipient: boolean; // Each gets their data only
    };

    ccRecipients?: string[];
    bccRecipients?: string[];
  };

  // Delivery Channels
  deliveryChannels: {
    primaryChannel: 'email' | 'ftp' | 'sftp' | 'sharepoint' | 'onedrive' | 'dropbox' | 'network_drive';

    // Email configuration
    emailConfig?: {
      subject: string; // Can include variables: "Sales Report - {date}"
      bodyTemplate: string; // Email body text
      attachmentName: string; // File naming convention
      maxAttachmentSizeMB?: number; // If larger, use link instead
    };

    // File share configuration
    fileShareConfig?: {
      path: string; // e.g., "\\server\reports\sales", "ftp://server/reports"
      credentials: boolean;
      overwriteExisting: boolean;
      archiveOldReports?: boolean;
    };

    // Additional channels
    additionalChannels?: ('teams' | 'slack' | 'portal' | 'api_webhook')[];
  };

  // Format & Export
  formatAndExport: {
    outputFormat: 'pdf' | 'excel' | 'csv' | 'html' | 'multiple';
    multipleFormats?: ('pdf' | 'excel' | 'csv' | 'html')[];
    compressionEnabled?: boolean; // ZIP large files
    passwordProtection?: boolean; // Secure sensitive reports
  };

  // Error Handling
  errorHandling: {
    retryOnFailure: boolean;
    maxRetries?: number; // e.g., 3
    retryDelayMinutes?: number; // e.g., 15

    notifyOnFailure: boolean;
    failureNotificationEmails?: string[];

    fallbackBehavior: 'skip' | 'send_error_report' | 'send_last_successful' | 'manual_intervention';
  };

  // Logging & Audit
  loggingAndAudit: {
    trackDelivery: boolean; // Log when sent, to whom
    trackOpens?: boolean; // Email open tracking
    trackDownloads?: boolean; // File download tracking
    retentionDays?: number; // How long to keep logs (e.g., 90)

    historicalArchive: boolean; // Keep copy of all sent reports
    archiveLocation?: string;
  };

  // Platform/Tool
  automationPlatform: {
    tool: 'power_automate' | 'n8n' | 'power_bi_service' | 'crystal_distributor' | 'airflow' | 'windows_task_scheduler' | 'cron';
    isCloudBased: boolean;
    requiresInfrastructure?: string; // e.g., "Windows Server", "Linux VM"
  };

  // Deliverables
  deliverables: {
    activeAutomation: boolean; // Automation is running
    scheduleDocumentation: boolean; // Document with schedule details
    configurationBackup: boolean; // Export of config
    accessToSchedulingSystem: boolean; // Client can modify
    runbook?: boolean; // Troubleshooting guide
  };

  // Timeline
  timeline: {
    setupDays: number; // 2-4 days typical
    testingDays: number; // 1-2 days
    monitoringPeriodDays?: number; // Initial monitoring (e.g., 7-14)
  };

  // Success Metrics
  successMetrics: {
    targetOnTimeDelivery: number; // % (e.g., 99%)
    maxAcceptableDelay: number; // Minutes (e.g., 5)
    zeroMissedReports: boolean;
  };
}

// ============================================================================
// Service #55: Training Workshops - הדרכות
// ============================================================================

/**
 * Service #55: Training Workshops
 * הדרכות וסדנאות למשתמשים
 *
 * Training sessions for staff on new systems, processes, and automations through practical workshops.
 * Includes live sessions, recorded materials, and hands-on exercises.
 */
export interface TrainingWorkshopsRequirements {
  // Workshop Details
  workshops: {
    topic: string; // e.g., "Zoho CRM Basics", "n8n Automation Workflows", "New Lead Process"
    targetAudience: string; // e.g., "Sales Team", "Customer Service Reps", "Admins"
    participantCount: number;
    durationHours: number; // e.g., 2, 4, 8 (full day)
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
  }[];

  // Learning Objectives
  learningObjectives: {
    workshopTopic: string;
    objectives: string[]; // e.g., ["Create a deal in CRM", "Run a weekly report", "Handle customer inquiry"]
    successCriteria: string; // What participants should be able to do after
  }[];

  // Delivery Method
  deliveryMethod: {
    format: 'onsite' | 'remote' | 'hybrid';
    platform?: 'zoom' | 'teams' | 'google_meet' | 'in_person'; // For remote/hybrid
    location?: string; // For onsite/hybrid
    timezone?: string; // For remote sessions
  };

  // Language & Localization
  language: 'he' | 'en' | 'both';
  culturalConsiderations?: string; // e.g., "Hebrew right-to-left UI", "Local business examples"

  // Workshop Structure
  workshopStructure: {
    introduction: boolean; // Overview and agenda (15-30 min)
    demonstration: boolean; // Trainer shows how (30-60 min)
    handsOnPractice: boolean; // Participants try (60-120 min)
    qaSession: boolean; // Questions and answers (30-60 min)
    assessment?: boolean; // Quiz or practical test
  };

  // Materials & Resources
  materials: {
    presentationSlides: boolean; // PowerPoint/Google Slides
    handouts: boolean; // Printed or PDF guides
    recordedSessions: boolean; // Video recordings
    practiceExercises: boolean; // Hands-on tasks
    cheatSheets?: boolean; // Quick reference cards
    faqDocument?: boolean; // Common questions
  };

  // Hands-On Environment
  handsOnEnvironment: {
    required: boolean;
    environmentType: 'demo_system' | 'sandbox' | 'production_with_test_data' | 'personal_accounts';
    demoDataProvided: boolean;
    participantAccess: boolean; // Participants have login credentials
  };

  // Schedule & Logistics
  schedule: {
    preferredDates?: string[]; // e.g., ["2024-02-15", "2024-02-16"]
    preferredTimeSlots?: string[]; // e.g., ["Morning 9-12", "Afternoon 14-17"]
    totalSessions: number;
    sessionSpacing?: string; // e.g., "One per week", "Consecutive days", "Same day"
    breaksBetweenSessions: boolean;
  };

  // Participants Management
  participants: {
    preWorkRequired: boolean; // Must complete something before workshop
    preWorkDescription?: string; // e.g., "Watch intro video", "Read getting started guide"
    prerequisiteSkills?: string[]; // e.g., ["Basic computer skills", "CRM familiarity"]
    accommodationsNeeded?: string[]; // e.g., ["Screen reader", "Large text"]
  };

  // Follow-Up Support
  followUpSupport: {
    enabled: boolean;
    duration?: string; // e.g., "2 weeks", "1 month"
    channels?: ('email' | 'chat' | 'phone' | 'office_hours')[]; // How to get help
    additionalSessionsAvailable?: boolean; // Can schedule follow-up workshops
  };

  // Assessment & Certification
  assessment: {
    required: boolean;
    assessmentType?: 'quiz' | 'practical_test' | 'project' | 'observation';
    passingScore?: number; // e.g., 80%
    certificateProvided?: boolean;
    certificationLevel?: string; // e.g., "Zoho CRM Certified User"
  };

  // Deliverables
  deliverables: {
    recordedVideos: boolean; // 1-3 videos, 30-60 min each
    documentationPDF: boolean; // Step-by-step guide
    exerciseFiles: boolean; // Practice materials
    faqDocument: boolean;
    certificatesOfCompletion?: boolean;
    attendanceReport?: boolean;
  };

  // Timeline
  timeline: {
    preparationDays: number; // 2-3 days to create materials
    deliveryDays: number; // Workshop duration (0.5-1 day)
    followUpDays?: number; // Post-workshop support (1-14 days)
  };

  // Success Metrics
  successMetrics: {
    targetAttendanceRate: number; // % (e.g., 90%)
    targetCompletionRate: number; // % (e.g., 85%)
    targetSatisfactionScore: number; // NPS or rating (e.g., 4.5/5)
    postTrainingQuizScore?: number; // % (e.g., 80%)
  };
}

// ============================================================================
// Service #56: Training Ongoing - הדרכה שוטפת
// ============================================================================

/**
 * Service #56: Training Ongoing
 * הדרכה מתמשכת ותמיכה בלמידה
 *
 * Continuous training, question support, updated learning materials, and new content over time.
 * Includes LMS setup, knowledge base, competency tracking, and regular content updates.
 */
export interface TrainingOngoingRequirements {
  // Program Structure
  programStructure: {
    duration: 'monthly' | 'quarterly' | 'annual' | 'ongoing_retainer';
    commitmentMonths: number; // Minimum commitment (e.g., 6, 12)
    includedHoursPerMonth: number; // e.g., 4-8 hours
    additionalHoursRate?: number; // $ per hour for extra support
  };

  // Content Scope
  contentScope: {
    initialTrainingCompleted: boolean; // Requires service #55 first
    contentTypes: ('video_tutorials' | 'written_guides' | 'interactive_modules' | 'webinars' | 'live_sessions')[];
    topicsCovered: string[]; // e.g., ["CRM Usage", "Automation Workflows", "Reporting", "Best Practices"]
    newContentFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  };

  // Learning Management System (LMS)
  lms: {
    required: boolean;
    platform?: 'moodle' | 'talentlms' | 'docebo' | 'learnupon' | 'existing_lms';
    needsSetup: boolean; // If doesn't exist
    features: {
      courseCatalog: boolean;
      progressTracking: boolean;
      certifications: boolean;
      assessments: boolean;
      reporting: boolean;
    };
  };

  // Knowledge Base
  knowledgeBase: {
    required: boolean;
    platform?: 'zendesk_guide' | 'confluence' | 'notion' | 'helpjuice' | 'custom';
    needsSetup: boolean;
    contentTypes: ('articles' | 'faqs' | 'video_library' | 'troubleshooting_guides' | 'best_practices')[];
    searchEnabled: boolean;
    updateFrequency: 'weekly' | 'monthly' | 'as_needed';
  };

  // Support Channels
  supportChannels: {
    email: boolean;
    chat: boolean; // Slack, Teams
    videoCall: boolean;
    officeHours: boolean; // Scheduled live Q&A
    ticketingSystem?: boolean;

    responseTimeTargets: {
      email?: string; // e.g., "24 hours"
      chat?: string; // e.g., "2 hours"
      officeHours?: string; // e.g., "Weekly Tuesday 10-11 AM"
    };
  };

  // Competency Tracking
  competencyTracking: {
    enabled: boolean;
    framework?: 'cypher' | 'talentguard' | 'cloud_assess' | 'custom';
    competencies: {
      competencyName: string; // e.g., "CRM Data Entry", "Workflow Creation", "Report Building"
      skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      assessmentMethod: 'quiz' | 'practical' | 'observation' | 'self_assessment';
    }[];
    progressReporting: boolean;
    skillsMatrix: boolean; // Track who knows what
  };

  // Content Updates & Maintenance
  contentUpdates: {
    systemChangeTriggers: boolean; // Update materials when system changes
    newUseCasesMonthly: boolean;
    videoRefreshAnnually: boolean;
    seasonalContent?: boolean; // e.g., "Year-end reporting training"
    industryUpdates?: boolean; // New best practices
  };

  // User Onboarding
  userOnboarding: {
    newEmployeeTraining: boolean;
    onboardingPath?: string; // e.g., "5-module intro course"
    assignedMentor?: boolean;
    firstWeekSupport?: boolean; // Extra attention for new users
  };

  // Certifications
  certifications: {
    offered: boolean;
    certificationLevels?: string[]; // e.g., ["Basic User", "Power User", "Admin"]
    renewalRequired: boolean;
    renewalPeriod?: string; // e.g., "Annual", "Biennial"
    certificationBenefits?: string; // e.g., "Access to advanced features", "Recognition"
  };

  // Gamification & Engagement
  gamification?: {
    enabled: boolean;
    features?: ('badges' | 'points' | 'leaderboards' | 'challenges' | 'rewards')[];
    celebrateMilestones?: boolean;
  };

  // Reporting & Analytics
  reporting: {
    monthlyReports: boolean;
    quarterlyReports: boolean;
    metricsTracked: ('course_completion' | 'quiz_scores' | 'time_to_competency' | 'knowledge_base_usage' | 'support_tickets')[];
    stakeholderReports?: boolean; // For management
  };

  // Deliverables
  deliverables: {
    monthlyNewContent: boolean; // Videos, articles, guides
    updatedKnowledgeBase: boolean;
    competencyReports: boolean; // Who achieved what skills
    qaSupport: boolean; // Email/chat/calls
    quarterlySkillAssessments: boolean;
    lmsAccess?: boolean;
  };

  // Success Metrics
  successMetrics: {
    targetKnowledgeBaseViews: number; // Per month
    targetTimeToCompetency: number; // Days for new user to become proficient
    targetCertificationRate: number; // % of users certified
    targetSupportTicketReduction: number; // % reduction due to better training
  };

  // Pricing Model
  pricingModel: {
    model: 'monthly_retainer' | 'hourly' | 'per_user' | 'annual_package';
    monthlyRetainerAmount?: number; // $ (e.g., 500-2000)
    hourlyRate?: number; // $ (e.g., 100-200)
    perUserCost?: number; // $ per user per month
  };
}

// ============================================================================
// Service #57: Support Ongoing - תמיכה שוטפת
// ============================================================================

/**
 * Service #57: Support Ongoing
 * תמיכה טכנית שוטפת ותחזוקה
 *
 * Ongoing technical support, maintenance, bug fixes, minor upgrades, and issue response.
 * Includes SLA-based ticketing, monitoring, and proactive system health checks.
 */
export interface SupportOngoingRequirements {
  // SLA Tiers & Priorities
  slaTiers: {
    tier: 'P1' | 'P2' | 'P3' | 'P4';
    description: string;

    // P1 (Critical): production down, all users affected
    // P2 (High): major functionality broken, multiple users affected
    // P3 (Medium): minor issue, workaround exists
    // P4 (Low): feature request, cosmetic issue

    responseTime: string; // e.g., "15 minutes", "2 hours", "24 hours"
    resolutionTime: string; // e.g., "4 hours", "8 hours", "48 hours", "1 week"
    examplesIssues: string[];
  }[];

  // Support Coverage
  supportCoverage: {
    supportHours: 'business_hours' | '24_7' | 'extended' | 'custom';
    businessHoursDefinition?: string; // e.g., "Sunday-Thursday 9 AM - 6 PM"
    timezone: string; // e.g., "Asia/Jerusalem", "UTC+2"
    afterHoursSupport: boolean;
    weekendSupport: boolean;
    holidaySupport: boolean;
  };

  // Support Channels
  supportChannels: {
    email: boolean;
    phone: boolean;
    liveChat: boolean;
    ticketingSystem: boolean;
    remoteAccess?: boolean; // TeamViewer, AnyDesk

    primaryChannel: 'email' | 'phone' | 'ticketing' | 'chat';
    secondaryChannels?: ('email' | 'phone' | 'ticketing' | 'chat')[];
  };

  // Ticketing System
  ticketingSystem: {
    platform: 'zendesk' | 'freshdesk' | 'jira_service_desk' | 'hubspot_service' | 'custom';
    needsSetup: boolean;

    features: {
      slaAutomation: boolean; // Auto-escalate if SLA breached
      knowledgeBaseIntegration: boolean;
      emailIntegration: boolean;
      slackTeamsIntegration?: boolean;
      selfServicePortal?: boolean;
    };

    categorization: {
      categories: string[]; // e.g., ["Bug", "Feature Request", "Question", "Incident"]
      autoRouting: boolean; // Route to correct team member
    };
  };

  // Included Support Hours
  includedHours: {
    hoursPerMonth: number; // e.g., 10, 20, 40
    rolloverAllowed: boolean; // Unused hours carry to next month
    rolloverLimit?: number; // Max hours that can accumulate
    additionalHoursCost?: number; // $ per hour beyond included
  };

  // Systems Covered
  systemsCovered: {
    systemName: string; // e.g., "Zoho CRM", "n8n Workflows", "Custom Dashboard"
    supportLevel: 'full' | 'limited' | 'monitoring_only';
    adminAccess: boolean;
    includedInSupport: boolean;
  }[];

  // Monitoring & Proactive Support
  monitoring: {
    uptimeMonitoring: boolean;
    errorTracking: boolean; // Sentry, LogRocket
    performanceMonitoring: boolean;
    automationExecutionMonitoring: boolean; // n8n workflows

    alerting: {
      alertChannels: ('email' | 'sms' | 'slack' | 'phone')[];
      alertThresholds: {
        metric: string; // e.g., "Downtime", "Error rate", "Response time"
        threshold: string; // e.g., ">5 minutes", ">5%", ">3 seconds"
      }[];
    };

    monthlyHealthCheck: boolean; // Proactive system review
    quarterlyHealthCheck: boolean;
  };

  // Escalation Procedures
  escalation: {
    tier1: string; // e.g., "Basic support technician"
    tier2: string; // e.g., "Advanced specialist"
    tier3: string; // e.g., "Development team"

    escalationTriggers: string[]; // e.g., ["SLA breach", "Critical issue", "Customer request"]
    escalationPath: string; // How issues move up tiers
  };

  // Maintenance Windows
  maintenanceWindows: {
    scheduled: boolean;
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'as_needed';
    preferredDay?: string; // e.g., "Sunday night", "3rd Sunday of month"
    preferredTime?: string; // e.g., "10 PM - 2 AM"
    notificationLeadTime: string; // e.g., "1 week", "2 weeks"
    maxDowntimeMinutes?: number; // Target (e.g., 60)
  };

  // Backup & Recovery
  backupAndRecovery: {
    backupsIncluded: boolean;
    backupFrequency?: 'daily' | 'weekly' | 'monthly';
    backupRetention?: number; // Days to keep backups
    recoveryProcedure: boolean; // Documented rollback process
    rto?: number; // Recovery Time Objective (hours)
    rpo?: number; // Recovery Point Objective (hours of data loss acceptable)
  };

  // Bug Fixes & Updates
  bugFixesAndUpdates: {
    criticalBugsFree: boolean; // P1/P2 bugs included in retainer
    minorBugsFree: boolean; // P3/P4 bugs included
    securityPatchesIncluded: boolean;
    featureEnhancements: boolean; // Small improvements
    majorUpgradesIncluded: boolean;
  };

  // Deliverables
  deliverables: {
    monthlyIncludedHours: boolean; // 10-40 hours/month
    ticketResolutionReports: boolean; // Monthly report
    uptimeReports: boolean; // SLA compliance
    maintenanceSchedule: boolean; // Planned maintenance calendar
    quarterlyHealthCheck: boolean; // System performance review
    knowledgeBaseUpdates?: boolean; // Document solutions
  };

  // Reporting & Documentation
  reporting: {
    monthlyTicketSummary: boolean;
    slaComplianceReport: boolean;
    meanTimeToResolve: boolean; // MTTR metric
    firstResponseTime: boolean; // FRT metric
    customerSatisfactionScore: boolean; // CSAT
    incidentPostMortems?: boolean; // For critical issues
  };

  // Success Metrics
  successMetrics: {
    targetSlaCompliance: number; // % (e.g., >95%)
    targetFirstResponseTime: string; // e.g., "<2 hours for P2"
    targetResolutionTime: string; // e.g., "<8 hours for P2"
    targetCustomerSatisfaction: number; // e.g., >4.5/5
    targetUptimePercentage: number; // % (e.g., 99.9%)
  };

  // Pricing Model
  pricingModel: {
    model: 'monthly_retainer' | 'hourly' | 'per_incident' | 'tiered_package';
    monthlyRetainerAmount?: number; // $ (e.g., 1500-5000)
    hourlyRate?: number; // $ (e.g., 100-200)
    includedHoursInRetainer?: number; // e.g., 10-40
    perIncidentCost?: number; // $ per ticket
  };

  // Client Responsibilities
  clientResponsibilities?: {
    ticketSubmissionProcess: string; // How to open tickets properly
    informationRequired: string[]; // What to include in tickets
    accessProvision: string; // Must provide admin access when needed
    testingResponsibility?: string; // Client tests fixes in staging
  };
}

// ============================================================================
// Service #58: Consulting Process - ייעוץ תהליכים
// ============================================================================

/**
 * Service #58: Consulting Process
 * ייעוץ ואופטימיזציה של תהליכים עסקיים
 *
 * Analysis, optimization, and improvement of business processes for efficiency and automation.
 * Uses Lean Six Sigma, BPMN, Value Stream Mapping, and process redesign methodologies.
 */
export interface ConsultingProcessRequirements {
  // Process Identification
  processIdentification: {
    processName: string; // e.g., "Lead to Sale", "Order to Cash", "Service Request Management"
    processOwner: string; // Department or role
    processScope: string; // Start and end points
    processType: 'operational' | 'management' | 'supporting';
    crossFunctional: boolean; // Involves multiple departments
  }[];

  // Analysis Methodology
  analysisMethodology: {
    approach: 'lean_six_sigma' | 'value_stream_mapping' | 'bpmn' | 'process_mining' | 'hybrid';

    // Lean Six Sigma: DMAIC
    dmaic?: {
      define: boolean; // Define problem and goals
      measure: boolean; // Collect data
      analyze: boolean; // Find root causes
      improve: boolean; // Design solutions
      control: boolean; // Monitor improvements
    };

    // Other methodologies
    valueStreamMapping?: boolean; // Visualize entire process, identify waste
    bpmnModeling?: boolean; // Business Process Model and Notation
    fiveWhysAnalysis?: boolean; // Root cause analysis
    rootCauseAnalysis?: boolean;
  };

  // Stakeholder Engagement
  stakeholderEngagement: {
    stakeholders: {
      name?: string;
      role: string; // e.g., "Sales Manager", "Customer Service Rep", "Operations Head"
      involvement: 'interview' | 'workshop' | 'observation' | 'data_provider';
      availabilityHours: number; // e.g., 1-2 hours for interview
    }[];

    workshopsRequired: boolean;
    workshopCount?: number;
    workshopDurationHours?: number; // e.g., 2-4 hours
  };

  // Current State Analysis
  currentStateAnalysis: {
    documentationExists: boolean; // Is process already documented?
    needsObservation: boolean; // Watch process in action
    needsDataCollection: boolean;

    dataToCollect: {
      metric: string; // e.g., "Cycle time", "Error rate", "Cost per transaction"
      source: string; // Where to get the data
      historicalPeriod?: string; // e.g., "Last 6 months"
    }[];

    painPoints: string[]; // Known issues to investigate
  };

  // Data Collection
  dataCollection: {
    historicalDataAccess: boolean;
    dataSources: string[]; // e.g., ["CRM", "ERP", "Spreadsheets", "Employee interviews"]

    metrics: {
      metricName: string; // e.g., "Average handle time", "First response time"
      currentValue?: string; // If known
      targetValue?: string; // Desired improvement
    }[];

    surveyRequired?: boolean;
    interviewsRequired?: boolean;
    timeTrackingRequired?: boolean;
  };

  // Gap Analysis
  gapAnalysis: {
    currentStateIssues: string[]; // Identified problems
    desiredState: string; // What ideal process looks like
    gapSize: 'minor' | 'moderate' | 'significant'; // How far from ideal
  };

  // Improvement Goals
  improvementGoals: {
    primaryGoal: string; // e.g., "Reduce cycle time by 30%", "Eliminate manual data entry"
    secondaryGoals?: string[];

    targetMetrics: {
      metric: string;
      currentValue: string;
      targetValue: string;
      targetImprovementPercent?: number; // %
    }[];

    budgetForImprovements?: number; // $ available for automation/tools
  };

  // Process Mapping
  processMapping: {
    currentStateMap: boolean; // As-Is process map
    futureStateMap: boolean; // To-Be process design
    swimLaneFormat: boolean; // Show responsibilities by role/department

    toolsUsed: ('lucidchart' | 'miro' | 'visio' | 'bizagi' | 'draw_io')[];
    bpmnCompliant?: boolean; // Formal BPMN notation
  };

  // Waste Identification
  wasteIdentification?: {
    // Lean principles: 8 types of waste (DOWNTIME)
    wasteTypes: {
      type: 'defects' | 'overproduction' | 'waiting' | 'non_utilized_talent' | 'transportation' | 'inventory' | 'motion' | 'extra_processing';
      description: string; // Where found in process
      estimatedImpact: 'high' | 'medium' | 'low';
    }[];

    bottlenecks: string[]; // Where process slows down
    redundancies: string[]; // Duplicate efforts
  };

  // Recommendations
  recommendations: {
    quickWins: string[]; // Easy improvements (1-4 weeks)
    strategicChanges: string[]; // Long-term improvements (1-6 months)

    automationOpportunities: {
      task: string; // e.g., "Data entry", "Status updates", "Report generation"
      automationMethod: string; // e.g., "n8n workflow", "API integration", "RPA"
      estimatedSavingsHours?: number; // Hours saved per month
    }[];

    systemChanges?: string[]; // New tools or platforms needed
    policyChanges?: string[]; // Business rules to update
  };

  // ROI Analysis
  roiAnalysis: {
    required: boolean;
    currentCosts: {
      laborHours?: number; // Per month
      hourlyRate?: number;
      toolCosts?: number;
      errorCosts?: number; // Cost of mistakes
    };

    projectedSavings: {
      laborSavingsHours?: number;
      toolSavings?: number;
      errorReduction?: number; // % reduction
      additionalRevenue?: number; // From faster processing
    };

    implementationCosts?: number; // Investment needed
    paybackPeriodMonths?: number;
  };

  // Implementation Roadmap
  implementationRoadmap: {
    required: boolean;
    phases: {
      phaseName: string; // e.g., "Phase 1: Quick Wins", "Phase 2: System Integration"
      durationWeeks: number;
      initiatives: string[];
      priority: 'high' | 'medium' | 'low';
      dependencies?: string[]; // What must happen first
    }[];
  };

  // Change Management
  changeManagement: {
    required: boolean;
    impactedEmployees: number;
    trainingRequired: boolean;
    communicationPlan: boolean;
    resistanceExpected: boolean;
    stakeholderBuyIn: boolean; // Management approval secured
  };

  // Deliverables
  deliverables: {
    currentStateProcessMap: boolean; // As-Is BPMN/flowchart
    valueStreamMap: boolean;
    gapAnalysisReport: boolean;
    futureStateProcessDesign: boolean; // To-Be
    improvementRoadmap: boolean; // Prioritized action plan
    roiAnalysis: boolean;
    implementationPlan: boolean;
    executiveSummary?: boolean; // For leadership
  };

  // Timeline
  timeline: {
    processComplexity: 'small' | 'medium' | 'complex';
    estimatedDays: number; // Small: 5-7, Medium: 10-14, Complex: 20-30
    phases: {
      discovery: number; // Days
      analysis: number;
      design: number;
      presentation: number;
    };
  };

  // Tools & Frameworks
  toolsAndFrameworks: {
    processMappingTools: string[]; // e.g., ["Lucidchart", "Miro"]
    dataAnalysisTools?: string[]; // e.g., ["Excel", "Minitab", "Tableau"]
    methodologies: ('lean' | 'six_sigma' | 'dmaic' | 'kaizen' | 'theory_of_constraints')[];
  };

  // Success Metrics
  successMetrics: {
    cycleTimeReduction?: number; // % target
    costPerTransactionReduction?: number; // % target
    errorRateReduction?: number; // % target
    customerSatisfactionImprovement?: number; // Points increase
    stakeholderApproval: boolean; // Process design approved
  };
}

// ============================================================================
// Service #59: Consulting Strategy - ייעוץ אסטרטגי
// ============================================================================

/**
 * Service #59: Consulting Strategy
 * ייעוץ אסטרטגי ותכנון דיגיטלי
 *
 * Strategic-level consulting: digital planning, automation roadmap, project prioritization, ROI modeling.
 * Uses Balanced Scorecard, OKRs, SWOT, strategic frameworks for long-term planning.
 */
export interface ConsultingStrategyRequirements {
  // Business Context
  businessContext: {
    industry: string; // e.g., "Healthcare", "E-commerce", "Professional Services"
    companySize: 'startup' | 'small' | 'medium' | 'enterprise'; // <50, 50-200, 200-1000, >1000
    growthStage: 'early_stage' | 'growth' | 'mature' | 'transformation';
    annualRevenue?: string; // Range or exact
    employeeCount?: number;
    geographicScope: 'local' | 'national' | 'regional' | 'global';
  };

  // Strategic Questions
  strategicQuestions: {
    mainChallenges: string[]; // e.g., ["Scale operations", "Reduce costs", "Improve customer experience"]

    decisionsToMake: {
      decision: string; // e.g., "Invest in automation or hire more staff?"
      options: string[]; // Alternative approaches
      decisionDeadline?: string;
    }[];

    strategicFocus: ('digital_transformation' | 'operational_efficiency' | 'growth_acceleration' | 'cost_reduction' | 'innovation' | 'customer_experience')[];
  };

  // Analysis Frameworks
  analysisFrameworks: {
    swotAnalysis: boolean; // Strengths, Weaknesses, Opportunities, Threats
    pestelAnalysis?: boolean; // Political, Economic, Social, Technological, Environmental, Legal
    porterFiveForces?: boolean; // Competitive analysis
    balancedScorecard?: boolean; // 4 perspectives performance

    swotDetails?: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
  };

  // Balanced Scorecard
  balancedScorecard?: {
    enabled: boolean;

    perspectives: {
      financial: {
        objectives: string[]; // e.g., ["Increase revenue by 20%", "Reduce operating costs by 15%"]
        measures: string[]; // How to track
      };

      customer: {
        objectives: string[]; // e.g., ["Improve NPS to 50", "Reduce churn to 5%"]
        measures: string[];
      };

      internalProcess: {
        objectives: string[]; // e.g., ["Automate 50% of manual tasks", "Reduce cycle time by 30%"]
        measures: string[];
      };

      learningAndGrowth: {
        objectives: string[]; // e.g., ["Upskill 80% of workforce", "Implement innovation program"]
        measures: string[];
      };
    };
  };

  // OKRs Framework
  okrsFramework?: {
    enabled: boolean;
    planningHorizon: 'quarterly' | 'annual' | 'multi_year';

    objectives: {
      objective: string; // Ambitious goal (e.g., "Become industry leader in automation")

      keyResults: {
        keyResult: string; // Measurable outcome (e.g., "Reduce manual tasks by 50%")
        currentValue?: string;
        targetValue: string;
        measurementFrequency: 'weekly' | 'monthly' | 'quarterly';
      }[];

      owner?: string; // Department or executive
      priority: 'high' | 'medium' | 'low';
    }[];
  };

  // Stakeholder Engagement
  stakeholderEngagement: {
    executiveInterviews: {
      role: string; // e.g., "CEO", "CTO", "CFO", "COO"
      interviewDuration: number; // Hours (typically 1-2)
      availability: boolean;
    }[];

    boardPresentation?: boolean;
    workshopSessions?: {
      sessionType: string; // e.g., "Strategic Planning Workshop", "Digital Roadmap Session"
      participants: number;
      durationHours: number; // e.g., 3-4 hours
    }[];
  };

  // Current State Assessment
  currentStateAssessment: {
    technologyStackReview: boolean; // What systems exist
    processMaturityAssessment: boolean; // How advanced are processes
    automationMaturity?: 'none' | 'basic' | 'intermediate' | 'advanced' | 'optimized';

    dataAccess: {
      financialData: boolean;
      operationalMetrics: boolean;
      customerData: boolean;
      competitiveIntelligence?: boolean;
    };

    industryBenchmarking?: boolean; // Compare to industry standards
  };

  // Digital Transformation Roadmap
  digitalTransformationRoadmap: {
    required: boolean;
    timeHorizon: '1_year' | '2_years' | '3_years' | '5_years';

    focusAreas: {
      area: string; // e.g., "CRM Modernization", "Process Automation", "AI Integration", "Data Analytics"
      priority: 'high' | 'medium' | 'low';
      estimatedBudget?: number;
      estimatedDuration?: string; // e.g., "6 months", "1 year"
    }[];

    phasedApproach: boolean;
    phases?: {
      phaseName: string; // e.g., "Foundation", "Acceleration", "Optimization"
      durationMonths: number;
      initiatives: string[];
    }[];
  };

  // Initiative Prioritization
  initiativePrioritization: {
    required: boolean;

    criteria: {
      criteriaName: string; // e.g., "ROI", "Strategic alignment", "Risk", "Effort"
      weight: number; // Relative importance (0-10)
    }[];

    initiatives: {
      initiativeName: string;
      description: string;
      estimatedROI?: number; // % or $
      estimatedEffort: 'low' | 'medium' | 'high';
      strategicValue: 'low' | 'medium' | 'high';
      risk: 'low' | 'medium' | 'high';
      priority?: 'must_have' | 'should_have' | 'nice_to_have';
    }[];
  };

  // ROI Modeling
  roiModeling: {
    required: boolean;

    investmentAreas: {
      area: string; // e.g., "Automation platform", "CRM upgrade", "AI implementation"
      estimatedCost: number;
      estimatedAnnualSavings?: number;
      estimatedRevenueIncrease?: number;
      paybackPeriodMonths?: number;
      npv?: number; // Net Present Value
      irr?: number; // Internal Rate of Return %
    }[];

    budgetConstraints: {
      totalAvailableBudget?: number;
      annualBudget?: number;
      capitalVsOperational?: string; // Split between CapEx and OpEx
    };
  };

  // AI & Automation Strategy
  aiAndAutomationStrategy?: {
    required: boolean;

    aiReadinessAssessment: boolean;
    aiUseCases: string[]; // e.g., ["Chatbot", "Predictive analytics", "Document processing"]

    automationRoadmap: {
      automationType: 'rpa' | 'workflow_automation' | 'ai_ml' | 'intelligent_automation';
      useCases: string[];
      estimatedSavingsHours?: number; // Per month
      implementationPriority: 'high' | 'medium' | 'low';
    }[];
  };

  // System Consolidation Strategy
  systemConsolidation?: {
    required: boolean;
    currentSystemCount?: number;
    targetSystemCount?: number;

    consolidationOpportunities: {
      systemsToConsolidate: string[]; // e.g., ["3 CRMs into 1", "5 spreadsheets into database"]
      targetSolution: string;
      estimatedSavings?: number; // License costs, admin time
    }[];
  };

  // Change Management & Governance
  changeManagement: {
    required: boolean;

    governanceModel: {
      steeringCommittee: boolean;
      projectManagementOffice?: boolean; // PMO
      decisionMakingFramework: string; // e.g., "RACI matrix", "Approval hierarchy"
    };

    changeImpact: {
      employeesImpacted: number;
      processesChanged: number;
      systemsReplaced?: number;
      expectedResistance: 'low' | 'medium' | 'high';
    };

    changeApproach?: 'prosci_adkar' | 'kotters_8_steps' | 'mckinsey_7s' | 'custom';
  };

  // Deliverables
  deliverables: {
    strategicAssessmentReport: boolean;
    swotAnalysis: boolean;
    digitalTransformationRoadmap: boolean; // 12-36 months
    prioritizedInitiatives: boolean; // With ROI
    okrsFramework?: boolean;
    balancedScorecard?: boolean;
    implementationGovernanceModel: boolean;
    changeManagementPlan: boolean;
    executivePresentation: boolean;
    quarterlyReviewFramework?: boolean; // How to track progress
  };

  // Timeline
  timeline: {
    engagementType: 'short' | 'comprehensive';
    totalWeeks: number; // Short: 2 weeks, Comprehensive: 4-6 weeks

    phases: {
      discovery: number; // Days
      analysis: number;
      strategyDesign: number;
      roadmapDevelopment: number;
      presentation: number;
    };
  };

  // Industry Trends & Best Practices
  industryContext?: {
    industryTrends: string[]; // e.g., ["AI adoption accelerating", "Remote work normalization"]
    competitorAnalysis: boolean;
    bestPractices: string[]; // Industry-specific recommendations
  };

  // Success Metrics
  successMetrics: {
    strategicClarity: boolean; // Team alignment on direction
    roadmapAdoption: boolean; // Initiatives being executed
    initiativeCompletionRate?: number; // % target within 12 months
    roiRealization?: number; // % of projected ROI achieved
    stakeholderSatisfaction: number; // e.g., 4.5/5
  };

  // Pricing & Engagement
  pricingAndEngagement: {
    pricingModel: 'project_based' | 'daily_rate' | 'value_based';
    estimatedCost?: number; // Project total
    dailyRate?: number; // If daily rate model
    retainerOption?: boolean; // Ongoing strategic advisory
    retainerMonths?: number;
  };
}

// ============================================================================
// Union Type & Entry Interface
// ============================================================================

/**
 * Union type for all Additional Service requirement types
 */
export type AdditionalServiceConfig =
  | DataCleanupRequirements
  | DataMigrationRequirements
  | AddDashboardRequirements
  | AddCustomReportsRequirements
  | ReportsAutomatedRequirements
  | TrainingWorkshopsRequirements
  | TrainingOngoingRequirements
  | SupportOngoingRequirements
  | ConsultingProcessRequirements
  | ConsultingStrategyRequirements;

/**
 * Service entry interface for tracking individual additional service instances
 */
export interface AdditionalServiceEntry {
  // Service identification
  serviceId: string; // '50', '51', '52', etc.
  serviceName: string; // 'data-cleanup', 'data-migration', etc.
  serviceDisplayName: string; // Display name in Hebrew/English

  // Service configuration
  requirements: AdditionalServiceConfig;

  // Service status
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';

  // Metadata
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
  completedAt?: string; // ISO date string

  // Assignment & tracking
  assignedTo?: string; // Team member or vendor
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;

  // Notes & documentation
  notes?: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  }[];
}

/**
 * Container for all additional services in a meeting
 */
export interface AdditionalServicesModule {
  // Service entries
  services: AdditionalServiceEntry[];

  // Module metadata
  lastUpdated?: string;
  completedCount?: number; // How many services completed

  // Overall notes
  overallNotes?: string;
}
