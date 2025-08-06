-- Create settings table for user preferences
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_preferences JSONB DEFAULT '{"email_alerts": true, "push_notifications": true, "critical_case_alerts": true, "daily_summary": false}'::jsonb,
  display_preferences JSONB DEFAULT '{"theme": "light", "cases_per_page": 25, "default_view": "list", "auto_refresh": true}'::jsonb,
  workflow_preferences JSONB DEFAULT '{"auto_assign_cases": false, "priority_filter": "all", "show_confidence_scores": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user settings
CREATE POLICY "Users can view their own settings" 
ON public.user_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.user_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.user_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create help articles table
CREATE TABLE public.help_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('getting-started', 'case-management', 'analytics', 'troubleshooting', 'billing')),
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for help articles (public read access)
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to help articles
CREATE POLICY "Anyone can view help articles" 
ON public.help_articles 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on user_settings
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample help articles
INSERT INTO public.help_articles (title, content, category, tags, is_featured) VALUES
('Getting Started with Mazo Radiology', 'Welcome to Mazo Radiology! This guide will help you get started with our AI-powered diagnostic platform. Our system uses advanced AI algorithms to prioritize cases based on urgency and clinical significance. You can upload DICOM images, review AI-generated findings, and manage your workflow efficiently.', 'getting-started', ARRAY['onboarding', 'basics'], true),
('Understanding AI Confidence Scores', 'Learn how to interpret AI confidence scores and use them effectively in your diagnostic workflow. Confidence scores range from 0-100% and indicate how certain our AI model is about detected findings. Scores above 90% typically indicate high confidence, while scores below 70% may require additional review.', 'case-management', ARRAY['ai', 'confidence', 'diagnostics'], true),
('Managing Critical Cases', 'Best practices for handling critical cases and emergency situations using our prioritization system. Critical cases are automatically flagged and moved to the top of your queue. Always review these cases first and ensure proper escalation procedures are followed for emergency findings.', 'case-management', ARRAY['critical', 'emergency', 'workflow'], true),
('Analytics Dashboard Overview', 'Comprehensive guide to understanding your analytics dashboard and key performance metrics. Monitor your throughput, accuracy rates, turnaround times, and case distribution. Use these insights to optimize your workflow and improve patient care quality.', 'analytics', ARRAY['dashboard', 'metrics', 'reporting'], false),
('Troubleshooting Image Upload Issues', 'Common solutions for image upload problems and technical difficulties. Ensure DICOM files are properly formatted, check network connectivity, and verify file size limits. Contact support if issues persist after following these troubleshooting steps.', 'troubleshooting', ARRAY['upload', 'images', 'technical'], false);