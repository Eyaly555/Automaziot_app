import React, { useState } from 'react';
import { X, Send, Mail, Phone, Building, User } from 'lucide-react';
import { Input } from '../../Base';
import { validateEmail } from '../../../services/emailService';
import { validatePhone, formatPhoneDisplay } from '../../../services/whatsappService';

export interface ClientContact {
  name: string;
  company?: string;
  email: string;
  phone: string;
}

interface ContactCompletionModalProps {
  clientContact: ClientContact;
  onUpdate: (contact: ClientContact) => void;
  onSend: () => void;
  onCancel: () => void;
}

export const ContactCompletionModal: React.FC<ContactCompletionModalProps> = ({
  clientContact,
  onUpdate,
  onSend,
  onCancel,
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const handleChange = (field: keyof ClientContact, value: string) => {
    onUpdate({ ...clientContact, [field]: value });
    setTouched({ ...touched, [field]: true });

    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleBlur = (field: keyof ClientContact) => {
    setTouched({ ...touched, [field]: true });
    validateField(field);
  };

  const validateField = (field: keyof ClientContact): boolean => {
    const value = clientContact[field];
    let error = '';

    switch (field) {
      case 'name':
        if (!value || value.trim().length === 0) {
          error = 'שם הלקוח הוא שדה חובה';
        }
        break;
      case 'email':
        if (!value || value.trim().length === 0) {
          error = 'כתובת אימייל היא שדה חובה';
        } else if (!validateEmail(value)) {
          error = 'כתובת אימייל לא תקינה';
        }
        break;
      case 'phone':
        if (!value || value.trim().length === 0) {
          error = 'מספר טלפון הוא שדה חובה';
        } else if (!validatePhone(value)) {
          error = 'מספר טלפון לא תקין (נדרש מספר ישראלי)';
        }
        break;
    }

    if (error) {
      setErrors({ ...errors, [field]: error });
      return false;
    }

    return true;
  };

  const validateAll = (): boolean => {
    const nameValid = validateField('name');
    const emailValid = validateField('email');
    const phoneValid = validateField('phone');

    return nameValid && emailValid && phoneValid;
  };

  const handleSubmit = () => {
    // Mark all required fields as touched
    setTouched({ name: true, email: true, phone: true });

    if (validateAll()) {
      onSend();
    }
  };

  const isFormValid = clientContact.name && clientContact.email && clientContact.phone &&
    validateEmail(clientContact.email) && validatePhone(clientContact.phone);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-2">פרטי קשר של הלקוח</h3>
              <p className="text-blue-100 text-sm">נדרשים פרטי קשר לשליחת ההצעה</p>
            </div>
            <button
              onClick={onCancel}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 inline ml-1" />
              שם מלא <span className="text-red-500">*</span>
            </label>
            <Input
              value={clientContact.name}
              onChange={(val) => handleChange('name', val)}
              onBlur={() => handleBlur('name')}
              placeholder="שם הלקוח"
              className={`w-full ${touched.name && errors.name ? 'border-red-500' : ''}`}
            />
            {touched.name && errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Company (optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Building className="w-4 h-4 inline ml-1" />
              שם החברה (אופציונלי)
            </label>
            <Input
              value={clientContact.company || ''}
              onChange={(val) => handleChange('company', val)}
              placeholder="שם החברה"
              className="w-full"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline ml-1" />
              מספר טלפון (WhatsApp) <span className="text-red-500">*</span>
            </label>
            <Input
              value={clientContact.phone}
              onChange={(val) => handleChange('phone', val)}
              onBlur={() => handleBlur('phone')}
              placeholder="05X-XXXXXXX"
              className={`w-full ${touched.phone && errors.phone ? 'border-red-500' : ''}`}
            />
            {touched.phone && errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
            {clientContact.phone && validatePhone(clientContact.phone) && (
              <p className="text-green-600 text-sm mt-1">
                ✓ {formatPhoneDisplay(clientContact.phone)}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline ml-1" />
              כתובת אימייל <span className="text-red-500">*</span>
            </label>
            <Input
              value={clientContact.email}
              onChange={(val) => handleChange('email', val)}
              onBlur={() => handleBlur('email')}
              placeholder="email@example.com"
              type="email"
              className={`w-full ${touched.email && errors.email ? 'border-red-500' : ''}`}
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
            {clientContact.email && validateEmail(clientContact.email) && (
              <p className="text-green-600 text-sm mt-1">✓ כתובת אימייל תקינה</p>
            )}
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 טיפ:</strong> ההצעה תישלח באופן אוטומטי ב-WhatsApp ובאימייל.
              הקובץ PDF יורד אוטומטית למחשב לצירוף ידני.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-xl border-t flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            ביטול
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2 font-medium"
          >
            <Send className="w-5 h-5" />
            שלח הצעת מחיר
          </button>
        </div>
      </div>
    </div>
  );
};
