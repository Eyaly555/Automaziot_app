// Test script for the webhook endpoints
// Run with: node test-webhook-example.js

const BASE_URL = 'http://localhost:3000'; // Change to your server URL

async function testExternalTranscriptionWebhook() {
  console.log('🧪 Testing External Transcription Webhook...');
  
  const testData = {
    transcript: `שלום, אני רוצה לדבר על הצרכים של החברה שלנו. אנחנו חברה של 15 עובדים שעוסקת במכירות B2B. 
    הבעיה העיקרית שלנו היא שאנחנו מקבלים הרבה לידים דרך האתר אבל לא מצליחים לעקוב אחריהם ביעילות. 
    כרגע אנחנו שומרים הכל באקסל וזה מבולגן. אנחנו רוצים לשפר את תהליך המכירות שלנו ולהגדיל את שיעור ההמרה.
    התקציב שלנו הוא כ-50,000 שקל לפרויקט הזה.`,
    clientId: 'test-client-123',
    language: 'he',
    zohoIntegration: {
      recordId: 'test-zoho-record-123',
      module: 'Potentials1'
    }
  };

  try {
    const response = await fetch(`${BASE_URL}/api/webhook/external-transcription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Complete automated processing successful!');
      console.log('📊 Summary:', result.summary);
      console.log('🎯 Confidence:', result.confidence);
      console.log('📋 Extracted Fields:', JSON.stringify(result.extractedFields, null, 2));
      console.log('🚀 Next Steps:', result.nextSteps);
      console.log('🔄 Fields Processing:');
      console.log('   - Total Fields Filled:', result.totalFieldsFilled);
      console.log('   - Modules Affected:', result.modulesAffected);
      console.log('📝 Zoho Note Created:', result.zohoNoteCreated ? '✅ Yes' : '❌ No');
      if (result.zohoError) {
        console.log('⚠️ Zoho Error:', result.zohoError);
      }
      console.log('🔗 External Webhook Sent:', result.externalWebhookSent ? '✅ Yes' : '❌ No');
      if (result.externalWebhookError) {
        console.log('⚠️ External Webhook Error:', result.externalWebhookError);
      }
      console.log('✨ Processing Complete:', result.processingComplete ? '✅ Yes' : '❌ No');
      
      // Return the data for the next test
      return result;
    } else {
      console.error('❌ Transcription analysis failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return null;
  }
}

async function testProcessClientFieldsWebhook(transcriptionData) {
  console.log('\n🧪 Testing Process Client Fields Webhook...');
  
  if (!transcriptionData) {
    console.log('⏭️ Skipping field processing test - no transcription data');
    return;
  }

  const testData = {
    clientId: transcriptionData.data.clientId,
    extractedFields: transcriptionData.extractedFields,
    summary: transcriptionData.summary,
    confidence: transcriptionData.confidence,
    nextSteps: transcriptionData.nextSteps,
    transcript: transcriptionData.data.transcript,
    zohoIntegration: {
      recordId: 'test-zoho-record-123',
      module: 'Potentials1'
    }
  };

  try {
    const response = await fetch(`${BASE_URL}/api/webhook/process-client-fields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Field processing successful!');
      console.log('📊 Merge Summary:', result.mergeSummary);
      console.log('📋 Fields Summary:', result.fieldsSummary);
      console.log('📝 Zoho Note Created:', result.data.zohoNoteCreated);
      console.log('🔄 Updated Modules:', Object.keys(result.data.updatedModules));
      console.log('🔗 External Webhook Sent:', result.externalWebhookSent ? '✅ Yes' : '❌ No');
      if (result.externalWebhookError) {
        console.log('⚠️ External Webhook Error:', result.externalWebhookError);
      }
    } else {
      console.error('❌ Field processing failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Webhook Tests...\n');
  
  // Test 1: External transcription
  const transcriptionResult = await testExternalTranscriptionWebhook();
  
  // Test 2: Process client fields
  await testProcessClientFieldsWebhook(transcriptionResult);
  
  console.log('\n✨ Tests completed!');
}

// Run the tests
runTests().catch(console.error);
