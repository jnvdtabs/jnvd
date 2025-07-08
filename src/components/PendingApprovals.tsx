import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDatabase } from '@/hooks/useDatabase';

interface PendingApproval {
  id: string;
  profile_id: string;
  user_email: string;
  full_name: string;
  role: string;
  requested_at: string;
  processed: boolean;
}

const PendingApprovals = () => {
  const { toast } = useToast();
  const { getPendingApprovals, approveUser, rejectUser } = useDatabase();
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async () => {
    try {
      const approvals = await getPendingApprovals();
      setPendingApprovals(approvals);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending approvals.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (profileId: string, userName: string) => {
    try {
      await approveUser(profileId);
      toast({
        title: "User Approved",
        description: `${userName} has been approved and can now take the quiz.`,
      });
      loadPendingApprovals();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve user.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (profileId: string, userName: string) => {
    try {
      await rejectUser(profileId);
      toast({
        title: "User Rejected",
        description: `${userName}'s registration has been rejected.`,
      });
      loadPendingApprovals();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject user.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-netflix-gray shadow-netflix border border-netflix-light-gray">
        <CardHeader>
          <CardTitle className="text-netflix-text flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-netflix-red mx-auto mb-4"></div>
            <p className="text-netflix-muted">Loading pending approvals...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-netflix-gray shadow-netflix border border-netflix-light-gray">
      <CardHeader>
        <CardTitle className="text-netflix-text flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Approvals
          {pendingApprovals.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {pendingApprovals.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-netflix-muted">
          Review and approve new user registrations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingApprovals.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-netflix-muted">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div
                key={approval.id}
                className="flex items-center justify-between p-4 bg-netflix-light-gray/10 rounded-lg border border-netflix-light-gray/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-netflix-red/20 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-netflix-red" />
                  </div>
                  <div>
                    <p className="font-medium text-netflix-text">{approval.full_name}</p>
                    <p className="text-sm text-netflix-muted">{approval.user_email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {approval.role}
                      </Badge>
                      <span className="text-xs text-netflix-muted">
                        {new Date(approval.requested_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(approval.profile_id, approval.full_name)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(approval.profile_id, approval.full_name)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingApprovals;