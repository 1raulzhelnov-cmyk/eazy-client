import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: 'Минимум 8 символов', test: (pwd) => pwd.length >= 8 },
  { label: 'Содержит заглавную букву', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'Содержит строчную букву', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'Содержит цифру', test: (pwd) => /\d/.test(pwd) },
  { label: 'Содержит специальный символ', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const passedRequirements = requirements.filter(req => req.test(password));
  const strength = passedRequirements.length;
  const strengthPercentage = (strength / requirements.length) * 100;

  const getStrengthLabel = () => {
    if (strength <= 1) return { label: 'Слабый', color: 'text-red-500' };
    if (strength <= 3) return { label: 'Средний', color: 'text-yellow-500' };
    if (strength <= 4) return { label: 'Хороший', color: 'text-blue-500' };
    return { label: 'Отличный', color: 'text-green-500' };
  };

  const { label, color } = getStrengthLabel();

  if (!password) return null;

  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Надёжность пароля:</span>
        <span className={`text-sm font-medium ${color}`}>{label}</span>
      </div>
      
      <Progress 
        value={strengthPercentage} 
        className="h-2"
      />

      <div className="space-y-2">
        {requirements.map((requirement, index) => {
          const isPassed = requirement.test(password);
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              {isPassed ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span className={isPassed ? 'text-green-600' : 'text-muted-foreground'}>
                {requirement.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;