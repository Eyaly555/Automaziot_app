/**
 * Feedback Button Component
 *
 * Floating button for quick feedback capture during production testing.
 * Opens feedback modal when clicked.
 *
 * @module components/Feedback/FeedbackButton
 */

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

/**
 * Feedback Button
 *
 * Displays a floating purple button in the top-left corner
 * that opens the feedback modal when clicked.
 */
export const FeedbackButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 left-4 z-50
                   bg-purple-600 hover:bg-purple-700 active:bg-purple-800
                   text-white rounded-full p-3 shadow-lg
                   transition-all duration-200 hover:scale-110
                   border-2 border-purple-400
                   focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        title="פידבק מהיר - Feedback"
        aria-label="Open feedback modal"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Modal */}
      {isOpen && <FeedbackModal onClose={() => setIsOpen(false)} />}
    </>
  );
};
