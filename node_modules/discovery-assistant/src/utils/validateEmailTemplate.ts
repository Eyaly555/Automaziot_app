import { EmailTemplateValidation } from '../types/automationServices';

/**
 * Validates an email template for common issues and best practices
 * @param htmlContent - The HTML content of the email template
 * @param hasUnsubscribeLink - Whether the template includes an unsubscribe link
 * @param hasPhysicalAddress - Whether the template includes a physical address
 * @param personalizationFields - Array of personalization field names that should be in the template
 * @returns EmailTemplateValidation object with errors, warnings, and spam score
 */
export function validateEmailTemplate(
  htmlContent: string,
  hasUnsubscribeLink: boolean = false,
  hasPhysicalAddress: boolean = false,
  personalizationFields: string[] = []
): EmailTemplateValidation {
  const errors: EmailTemplateValidation['errors'] = [];
  const warnings: EmailTemplateValidation['warnings'] = [];
  let spamScore = 0;

  // Check if HTML is empty
  if (!htmlContent || htmlContent.trim().length === 0) {
    errors.push({
      type: 'invalid_html',
      message: 'Email template is empty',
      messageHe: 'תבנית האימייל ריקה',
      severity: 'error',
    });
    return {
      isValid: false,
      errors,
      warnings,
      spamScore: 10,
      estimatedDeliverability: 'poor',
    };
  }

  // Check for valid HTML structure
  const hasHtmlTag = /<html/i.test(htmlContent);
  const hasBodyTag = /<body/i.test(htmlContent);

  if (!hasHtmlTag || !hasBodyTag) {
    warnings.push({
      type: 'html_structure',
      message:
        'Missing <html> or <body> tags. Some email clients may not render correctly.',
      messageHe:
        'חסרים תגי <html> או <body>. חלק מלקוחות האימייל עשויים לא להציג נכון.',
    });
    spamScore += 0.5;
  }

  // Check for unsubscribe link (required by law)
  const hasUnsubscribeInContent = /unsubscribe|הסרה מרשימה/i.test(htmlContent);

  if (!hasUnsubscribeLink && !hasUnsubscribeInContent) {
    errors.push({
      type: 'missing_unsubscribe',
      message: 'Missing unsubscribe link (required by CAN-SPAM Act and GDPR)',
      messageHe: 'חסר קישור להסרה מרשימה (נדרש לפי CAN-SPAM ו-GDPR)',
      severity: 'error',
    });
  }

  // Check for physical address (required by CAN-SPAM)
  const hasAddressPattern =
    /\d{1,5}\s\w+\s(street|st|avenue|ave|road|rd|drive|dr)/i.test(htmlContent);

  if (!hasPhysicalAddress && !hasAddressPattern) {
    errors.push({
      type: 'missing_address',
      message: 'Missing physical address (required by CAN-SPAM Act)',
      messageHe: 'חסרה כתובת פיזית (נדרש לפי CAN-SPAM Act)',
      severity: 'error',
    });
  }

  // Check for personalization variables
  const variablePattern = /\{\{[\s\w]+\}\}|\{\%[\s\w]+\%\}|<%=[\s\w]+%>/g;
  const foundVariables = htmlContent.match(variablePattern) || [];

  if (personalizationFields.length > 0 && foundVariables.length === 0) {
    warnings.push({
      type: 'missing_personalization',
      message:
        'No personalization variables found. Consider adding {{firstName}} or similar.',
      messageHe:
        'לא נמצאו משתני התאמה אישית. שקול להוסיף {{firstName}} או דומה.',
    });
  }

  // Check for too many images (spam indicator)
  const imageCount = (htmlContent.match(/<img/gi) || []).length;

  if (imageCount > 5) {
    warnings.push({
      type: 'too_many_images',
      message: `${imageCount} images found. Emails with many images often go to spam. Recommended: 2-3 images max.`,
      messageHe: `נמצאו ${imageCount} תמונות. אימיילים עם הרבה תמונות נוטים להגיע לספאם. מומלץ: 2-3 תמונות מקסימום.`,
    });
    spamScore += Math.min(imageCount - 5, 3);
  }

  // Check for external links (spam indicator if too many)
  const linkCount = (htmlContent.match(/<a\s+href=/gi) || []).length;

  if (linkCount > 10) {
    warnings.push({
      type: 'too_many_links',
      message: `${linkCount} links found. Too many links can trigger spam filters. Recommended: 5-7 links max.`,
      messageHe: `נמצאו ${linkCount} קישורים. יותר מדי קישורים עלולים להפעיל פילטרי ספאם. מומלץ: 5-7 קישורים מקסימום.`,
    });
    spamScore += Math.min(linkCount - 10, 2);
  }

  // Check for ALL CAPS in subject or content (spam indicator)
  const hasAllCaps = /[A-Z]{10,}/.test(htmlContent);

  if (hasAllCaps) {
    warnings.push({
      type: 'all_caps',
      message: 'Text in ALL CAPS detected. This can trigger spam filters.',
      messageHe: 'זוהה טקסט באותיות גדולות. זה עלול להפעיל פילטרי ספאם.',
    });
    spamScore += 1;
  }

  // Check for spam trigger words
  const spamWords = [
    'free',
    'click here',
    'buy now',
    'limited time',
    'act now',
    'winner',
    'congratulations',
    'prize',
    'cash',
    'earn money',
    'make money fast',
    'זכית',
    'חינם',
    'לחץ כאן',
    'קנה עכשיו',
    'זמן מוגבל',
    'פעל עכשיו',
  ];

  const foundSpamWords = spamWords.filter((word) =>
    new RegExp(`\\b${word}\\b`, 'i').test(htmlContent)
  );

  if (foundSpamWords.length > 0) {
    warnings.push({
      type: 'spam_words',
      message: `Spam trigger words detected: ${foundSpamWords.slice(0, 3).join(', ')}. Consider rephrasing.`,
      messageHe: `זוהו מילות ספאם: ${foundSpamWords.slice(0, 3).join(', ')}. שקול לנסח מחדש.`,
    });
    spamScore += Math.min(foundSpamWords.length, 2);
  }

  // Check for inline CSS (recommended)
  const hasInlineStyles = /style\s*=\s*["']/i.test(htmlContent);
  const hasStyleTag = /<style/i.test(htmlContent);

  if (hasStyleTag && !hasInlineStyles) {
    warnings.push({
      type: 'css_not_inline',
      message:
        'Using <style> tags instead of inline styles. Many email clients strip <style> tags.',
      messageHe:
        'משתמש ב-<style> tags במקום inline styles. הרבה לקוחות אימייל מסירים את תגי ה-<style>.',
    });
  }

  // Check for responsive design indicators
  const hasViewportMeta = /viewport/i.test(htmlContent);
  const hasMediaQueries = /@media/i.test(htmlContent);

  if (!hasViewportMeta && !hasMediaQueries) {
    warnings.push({
      type: 'not_responsive',
      message:
        'No responsive design detected. 60%+ of emails are opened on mobile.',
      messageHe: 'לא זוהה עיצוב רספונסיבי. 60%+ מהאימיילים נפתחים במובייל.',
    });
    spamScore += 0.5;
  }

  // Check for broken variables (e.g., {{ firstName }} with spaces)
  const brokenVariables = htmlContent.match(/\{\{\s*\w+\s*\}\}/g) || [];

  if (brokenVariables.length > 0) {
    warnings.push({
      type: 'broken_variables',
      message:
        'Potentially broken personalization variables detected. Check spacing in {{ variable }} syntax.',
      messageHe:
        'זוהו משתנים שעשויים להיות שבורים. בדוק רווחים בתחביר {{ variable }}.',
    });
  }

  // Check for missing alt text on images
  const imagesWithoutAlt = (
    htmlContent.match(/<img(?![^>]*alt=)[^>]*>/gi) || []
  ).length;

  if (imagesWithoutAlt > 0) {
    warnings.push({
      type: 'missing_alt_text',
      message: `${imagesWithoutAlt} images without alt text. Add alt text for better accessibility and deliverability.`,
      messageHe: `${imagesWithoutAlt} תמונות ללא טקסט חלופי. הוסף alt text לנגישות ושליחות טובה יותר.`,
    });
  }

  // Calculate deliverability estimate
  const isValid = errors.length === 0;
  let estimatedDeliverability: EmailTemplateValidation['estimatedDeliverability'];

  if (spamScore === 0) {
    estimatedDeliverability = 'excellent';
  } else if (spamScore <= 2) {
    estimatedDeliverability = 'good';
  } else if (spamScore <= 5) {
    estimatedDeliverability = 'fair';
  } else {
    estimatedDeliverability = 'poor';
  }

  return {
    isValid,
    errors,
    warnings,
    spamScore: Math.min(spamScore, 10),
    estimatedDeliverability,
  };
}

/**
 * Quick validation for personalization variables in a template
 * @param template - Template content with variables
 * @param templateEngine - The template engine being used
 * @returns Object with validation result and extracted variables
 */
export function validatePersonalizationVariables(
  template: string,
  templateEngine: 'handlebars' | 'liquid' | 'mustache' | 'ejs'
): {
  isValid: boolean;
  variables: string[];
  errors: string[];
} {
  const errors: string[] = [];
  let variablePattern: RegExp;

  switch (templateEngine) {
    case 'handlebars':
    case 'mustache':
      variablePattern = /\{\{([^}]+)\}\}/g;
      break;
    case 'liquid':
      variablePattern = /\{\{\s*([^}]+)\s*\}\}/g;
      break;
    case 'ejs':
      variablePattern = /<%=\s*([^%]+)\s*%>/g;
      break;
    default:
      variablePattern = /\{\{([^}]+)\}\}/g;
  }

  const matches = template.matchAll(variablePattern);
  const variables: string[] = [];

  for (const match of matches) {
    const variable = match[1].trim();

    // Check for invalid variable names
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable)) {
      errors.push(`Invalid variable name: ${variable}`);
    } else {
      variables.push(variable);
    }
  }

  return {
    isValid: errors.length === 0,
    variables: [...new Set(variables)], // Remove duplicates
    errors,
  };
}

/**
 * Estimates spam score for an email subject line
 * @param subject - Email subject line
 * @returns Spam score (0-10) and warnings
 */
export function validateEmailSubject(subject: string): {
  spamScore: number;
  warnings: string[];
} {
  const warnings: string[] = [];
  let spamScore = 0;

  // Check for ALL CAPS
  if (subject === subject.toUpperCase() && subject.length > 5) {
    warnings.push('Subject line is in ALL CAPS - high spam indicator');
    spamScore += 3;
  }

  // Check for excessive punctuation
  const exclamationCount = (subject.match(/!/g) || []).length;
  if (exclamationCount > 1) {
    warnings.push(
      `${exclamationCount} exclamation marks detected - avoid excessive punctuation`
    );
    spamScore += exclamationCount;
  }

  // Check for spam trigger words
  const spamWords = [
    'free',
    'click here',
    'buy now',
    'winner',
    'congratulations',
    'act now',
  ];
  const foundSpamWords = spamWords.filter((word) =>
    new RegExp(`\\b${word}\\b`, 'i').test(subject)
  );

  if (foundSpamWords.length > 0) {
    warnings.push(`Spam trigger words: ${foundSpamWords.join(', ')}`);
    spamScore += foundSpamWords.length * 2;
  }

  // Check subject length (optimal: 40-60 characters)
  if (subject.length > 90) {
    warnings.push(
      'Subject line too long - may be truncated on mobile (recommended: 40-60 characters)'
    );
    spamScore += 1;
  } else if (subject.length < 10) {
    warnings.push('Subject line very short - may appear suspicious');
    spamScore += 0.5;
  }

  // Check for personalization
  const hasPersonalization = /\{\{|\{%|<%=/i.test(subject);
  if (!hasPersonalization) {
    warnings.push(
      'No personalization in subject - consider adding {{firstName}} or similar'
    );
  }

  return {
    spamScore: Math.min(spamScore, 10),
    warnings,
  };
}
