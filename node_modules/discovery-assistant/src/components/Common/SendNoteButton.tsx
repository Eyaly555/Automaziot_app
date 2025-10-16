import React from 'react';
import { StickyNote } from 'lucide-react';
import { Button } from '../Base/Button';

export interface SendNoteButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * SendNoteButton - Reusable button for triggering Zoho note composer
 *
 * Usage:
 * ```tsx
 * const { openComposer } = useZohoNote('dashboard');
 * <SendNoteButton onClick={openComposer} />
 * ```
 */
export const SendNoteButton: React.FC<SendNoteButtonProps> = ({
  onClick,
  variant = 'ghost',
  size = 'sm',
  showIcon = true,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      icon={showIcon ? <StickyNote /> : undefined}
      onClick={onClick}
      disabled={disabled}
      className={className}
      ariaLabel={label || 'שלח Note ל-Zoho'}
    >
      {label || 'שלח Note'}
    </Button>
  );
};
