
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Activity, Zap } from 'lucide-react';

export const BackendConnectivityTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<{
    success: boolean;
    timestamp: string;
    responseTime: number;
    error?: string;
  } | null>(null);
  const { toast } = useToast();

  const testBackendConnectivity = async () => {
    setTesting(true);
    const startTime = Date.now();

    try {
      const response = await apiService.healthCheck();
      const responseTime = Date.now() - startTime;

      if (response.error) {
        throw new Error(response.error);
      }

      setLastTestResult({
        success: true,
        timestamp: new Date().toISOString(),
        responseTime
      });

      toast({
        title: "Backend Connected",
        description: `Successfully connected to backend (${responseTime}ms)`,
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setLastTestResult({
        success: false,
        timestamp: new Date().toISOString(),
        responseTime,
        error: errorMessage
      });

      toast({
        variant: "destructive",
        title: "Backend Connection Failed",
        description: errorMessage,
      });
    } finally {
      setTesting(false);
    }
  };

  const testDicomProcessing = async () => {
    setTesting(true);

    try {
      const response = await apiService.processDicomFiles();
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "DICOM Processing Test",
        description: `Found ${response.data?.processed || 0} new files to process`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "DICOM Processing Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Backend Status
        </CardTitle>
        <CardDescription>
          Test connectivity and DICOM processing functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastTestResult && (
          <div className="p-3 rounded-lg border bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Last Test</span>
              <Badge variant={lastTestResult.success ? "default" : "destructive"}>
                {lastTestResult.success ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {lastTestResult.success ? 'Connected' : 'Failed'}
              </Badge>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <div>Response Time: {lastTestResult.responseTime}ms</div>
              <div>Time: {new Date(lastTestResult.timestamp).toLocaleTimeString()}</div>
              {lastTestResult.error && (
                <div className="text-red-600">Error: {lastTestResult.error}</div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Button 
            onClick={testBackendConnectivity}
            disabled={testing}
            className="w-full"
            variant="outline"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Activity className="h-4 w-4 mr-2" />
            )}
            Test Backend Connection
          </Button>

          <Button 
            onClick={testDicomProcessing}
            disabled={testing}
            className="w-full"
            variant="outline"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Test DICOM Processing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
