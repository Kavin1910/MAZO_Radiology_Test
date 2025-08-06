
import { useEffect, useRef } from 'react';
import { type MedicalCase } from '@/hooks/useMedicalCases';
import { useNotifications } from '@/contexts/NotificationContext';

export const useCaseNotifications = (cases: MedicalCase[]) => {
  const { addNotification } = useNotifications();
  const previousCasesRef = useRef<MedicalCase[]>([]);

  useEffect(() => {
    const previousCases = previousCasesRef.current;
    
    // Check for new cases
    const newCases = cases.filter(
      currentCase => !previousCases.find(prevCase => prevCase.id === currentCase.id)
    );

    // Check for critical/urgent cases that need immediate attention
    const criticalCases = cases.filter(
      case_ => (case_.priority === 'critical' || case_.priority === 'high') && 
               case_.status === 'open'
    );

    // Trigger notifications for new cases
    newCases.forEach(newCase => {
      addNotification({
        type: 'new-case',
        title: 'New Case Received',
        message: `${newCase.imageType} scan for ${newCase.patientName} (${newCase.bodyPart})`,
        caseId: newCase.id,
        priority: newCase.priority,
      });
    });

    // Trigger notifications for critical cases (even existing ones that are still open)
    criticalCases.forEach(criticalCase => {
      const wasAlreadyCritical = previousCases.find(
        prevCase => prevCase.id === criticalCase.id && 
        (prevCase.priority === 'critical' || prevCase.priority === 'high') &&
        prevCase.status === 'open'
      );

      // Only notify if this is a new critical case or newly changed to critical
      if (!wasAlreadyCritical) {
        addNotification({
          type: criticalCase.priority === 'critical' ? 'critical-case' : 'urgent-case',
          title: criticalCase.priority === 'critical' ? 'Critical Case Alert' : 'Urgent Case Alert',
          message: `${criticalCase.priority.toUpperCase()} priority: ${criticalCase.patientName} - ${criticalCase.bodyPart} ${criticalCase.imageType}${criticalCase.findings ? '. ' + criticalCase.findings : ''}`,
          caseId: criticalCase.id,
          priority: criticalCase.priority,
        });
      }
    });

    // Update the previous cases reference
    previousCasesRef.current = [...cases];
  }, [cases, addNotification]);
};
