import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users } from "lucide-react";

/**
 * Reusable IAM Security popup.
 * Drop <IAMSecurity service="Firebase" /> (or "Google Sheets", "BigQuery", etc.) on any page.
 * The `service` prop customises the title — all other content is universal dev-access guidance.
 */
export default function IAMSecurity({ service = "Google" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        IAM Access
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>IAM & Dev Staff Access — {service}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 text-sm text-muted-foreground">

            <div className="border-2 border-destructive/50 rounded-lg overflow-hidden">
              <div className="bg-destructive/10 px-4 py-2">
                <span className="text-destructive font-bold text-xs uppercase tracking-wide">
                  🔐 Priority — Internal Dev Staff Access Control
                </span>
              </div>
              <div className="p-4 space-y-1 text-xs text-muted-foreground">
                <p className="text-foreground">Every developer who touches this project should have the <strong>minimum role needed</strong> — both on Google's side (GCP IAM) and in this app's code. Over-permissioned devs are the most common cause of accidental data leaks or deletions.</p>
              </div>
            </div>

            {/* Google-side IAM */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">1. Google Side — GCP / Firebase IAM Roles</h3>
              <p className="text-xs mb-3">Go to <a href="https://console.cloud.google.com/iam-admin/iam" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Cloud Console → IAM & Admin → IAM</a> and assign the correct role per person:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left px-3 py-2 border border-border font-semibold text-foreground">Staff Level</th>
                      <th className="text-left px-3 py-2 border border-border font-semibold text-foreground">GCP / Firebase Role</th>
                      <th className="text-left px-3 py-2 border border-border font-semibold text-foreground">What They Can Do</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 border border-border font-medium text-foreground">Lead Dev / Owner</td>
                      <td className="px-3 py-2 border border-border font-mono">Owner</td>
                      <td className="px-3 py-2 border border-border">Full access — billing, delete project, manage all IAM. <span className="text-destructive font-medium">Max 2 people.</span></td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="px-3 py-2 border border-border font-medium text-foreground">Senior Dev</td>
                      <td className="px-3 py-2 border border-border font-mono">Editor</td>
                      <td className="px-3 py-2 border border-border">Read/write all resources, deploy functions, manage services. Cannot manage IAM.</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border border-border font-medium text-foreground">Dev / Contributor</td>
                      <td className="px-3 py-2 border border-border font-mono">Firebase Develop Admin</td>
                      <td className="px-3 py-2 border border-border">Manage Firebase features (Firestore, Auth, Functions) but <strong>not</strong> billing or IAM.</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="px-3 py-2 border border-border font-medium text-foreground">Junior Dev / Tester</td>
                      <td className="px-3 py-2 border border-border font-mono">Firebase Viewer</td>
                      <td className="px-3 py-2 border border-border">Read-only console access. Cannot write data or deploy. Good for debugging.</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border border-border font-medium text-foreground">QA / Stakeholder</td>
                      <td className="px-3 py-2 border border-border font-mono">Viewer</td>
                      <td className="px-3 py-2 border border-border">Read-only across GCP. Cannot touch data directly.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs">To assign: IAM page → <strong>Grant Access</strong> → enter their Google account email → select role → Save.</p>
            </div>

            <hr className="border-border" />

            {/* Code-side */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">2. Code Side — Role-Based Access in This App</h3>
              <p className="text-xs mb-3">This app uses Base44's <code className="bg-muted px-1 rounded">user.role</code> field. Backend functions must check the caller's role before performing sensitive operations. Assign roles via <strong>Base44 Dashboard → Users</strong>.</p>

              <p className="text-xs font-medium text-foreground mb-1">Recommended role mapping:</p>
              <div className="overflow-x-auto mb-3">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left px-3 py-2 border border-border font-semibold text-foreground">Base44 Role</th>
                      <th className="text-left px-3 py-2 border border-border font-semibold text-foreground">Access Level</th>
                      <th className="text-left px-3 py-2 border border-border font-semibold text-foreground">Who</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 border border-border font-mono">admin</td>
                      <td className="px-3 py-2 border border-border">Read + Write + Delete + run maintenance functions</td>
                      <td className="px-3 py-2 border border-border">Lead dev, system owner</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="px-3 py-2 border border-border font-mono">user</td>
                      <td className="px-3 py-2 border border-border">Read + Write their own records only</td>
                      <td className="px-3 py-2 border border-border">Regular app users</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs font-medium text-foreground mb-1">Enforce in backend functions:</p>
              <pre className="bg-muted rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap break-words mb-3">
{`const user = await base44.auth.me();
if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

// Only admins reach this point
await base44.asServiceRole.entities.SomeEntity.delete(id);`}
              </pre>

              <p className="text-xs font-medium text-foreground mb-1">Enforce in Firestore Rules (role via custom auth claims):</p>
              <pre className="bg-muted rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap break-words">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admins can read/write everything
    match /{document=**} {
      allow read, write: if request.auth != null
        && request.auth.token.role == 'admin';
    }
    // Regular users can only access their own records
    match /records/{docId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.uid;
    }
  }
}`}
              </pre>
              <p className="mt-2 text-xs">To use <code className="bg-muted px-1 rounded">request.auth.token.role</code>, set a custom claim server-side via the Firebase Admin SDK when assigning a user's role.</p>
            </div>

            <hr className="border-border" />

            {/* Checklist */}
            <div className="bg-amber-50 border border-amber-200 rounded p-3 space-y-1">
              <p className="font-semibold text-foreground text-xs">Dev Staff Access Checklist:</p>
              <ul className="space-y-0.5 text-xs text-muted-foreground">
                <li>✓ Each developer has their own Google account — no shared credentials</li>
                <li>✓ IAM roles assigned at minimum necessary level per person</li>
                <li>✓ Remove ex-staff from IAM immediately on departure</li>
                <li>✓ Backend functions check <code className="bg-muted px-1 rounded">user.role</code> before sensitive operations</li>
                <li>✓ No service account keys stored in code or shared over Slack/email</li>
                <li>✓ Enable <strong>2FA / Google 2-Step Verification</strong> for all dev Google accounts</li>
                <li>✓ Review IAM access quarterly — remove stale accounts</li>
              </ul>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}