
// Utility functions for parsing AI findings text
export const parseAIFindings = (findings: string) => {
  const severityMatch = findings.match(/SEVERITY SCORE[:\s]*(\d+)/i);
  const confidenceMatch = findings.match(/CONFIDENCE SCORE[:\s]*(\d+)/i);
  
  const severity = severityMatch ? parseInt(severityMatch[1]) : null;
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : null;
  
  return { severity, confidence };
};

export const severityToPriority = (severityRating: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (severityRating >= 8) return 'critical';  // 8-10 is Critical
  if (severityRating >= 6) return 'high';      // 6-7 is High  
  if (severityRating >= 3) return 'medium';    // 3-5 is Medium
  return 'low';                                 // 1-2 is Low
};
