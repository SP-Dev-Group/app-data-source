import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield } from "lucide-react";

export default function GoogleFirebaseSecurity() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Shield className="h-4 w-4" />
        Security
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Firebase Security & Permissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 text-sm text-muted-foreground">

            {/* ── TOP PRIORITY: Internal Dev Staff Access ── */}
            <div className="border-2 border-destructive/50 rounded-lg overflow-hidden">
              <div className="bg-destructive/10 px-4 py-2 flex items-center gap-2">
                <span className="text-destructive font-bold text-xs uppercase tracking-wide">🔐 Priority 1 — Internal Dev Staff Access Control</span>
              </div>
              <div className="p-4 space-y-4 text-xs">
                <p className="text-foreground">Every developer who touches this project should have the <strong>minimum role needed</strong> — both on Google's side (Firebase / GCP IAM) and in this app's code. Over-permissioned devs are the most common cause of accidental data leaks or deletions.</p>

                <div>
                  <p className="font-semibold text-foreground mb-2">Google Side — Firebase / GCP IAM Roles</p>
                  <p className="mb-2 text-muted-foreground">Go to <a href="https://console.cloud.google.com/iam-admin/iam" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Cloud Console → IAM & Admin → IAM</a> and assign the correct role per person:</p>
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
                          <td className="px-3 py-2 border border-border">Read/write all resources, deploy functions, manage Firestore. Cannot manage IAM.</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 border border-border font-medium text-foreground">Dev / Contributor</td>
                          <td className="px-3 py-2 border border-border font-mono">Firebase Develop Admin</td>
                          <td className="px-3 py-2 border border-border">Manage Firebase features (Firestore, Auth, Functions) but <strong>not</strong> billing or IAM.</td>
                        </tr>
                        <tr className="bg-muted/20">
                          <td className="px-3 py-2 border border-border font-medium text-foreground">Junior Dev / Tester</td>
                          <td className="px-3 py-2 border border-border font-mono">Firebase Viewer</td>
                          <td className="px-3 py-2 border border-border">Read-only access to console. Cannot write data or deploy. Good for debugging.</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 border border-border font-medium text-foreground">QA / Stakeholder</td>
                          <td className="px-3 py-2 border border-border font-mono">Viewer</td>
                          <td className="px-3 py-2 border border-border">Read-only across GCP. Cannot touch Firestore data directly.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-muted-foreground">To assign: IAM page → <strong>Grant Access</strong> → enter their Google account email → select role → Save.</p>
                </div>

                <hr className="border-border" />

                <div>
                  <p className="font-semibold text-foreground mb-2">Code Side — Role-Based Access in This App</p>
                  <p className="mb-2 text-muted-foreground">This app uses Base44's <code className="bg-muted px-1 rounded">user.role</code> field. Backend functions should always check the caller's role before performing sensitive operations. Assign roles via the Base44 dashboard → Users.</p>

                  <p className="font-medium text-foreground mb-1">Recommended role mapping:</p>
                  <div className="overflow-x-auto mb-3">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="text-left px-3 py-2 border border-border font-semibold text-foreground">Base44 Role</th>
                          <th className="text-left px-3 py-2 border border-border font-semibold text-foreground">Firebase Access</th>
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

                  <p className="font-medium text-foreground mb-1">Enforce in backend functions:</p>
                  <pre className="bg-muted rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap break-words mb-3">
{`// In any sensitive backend function:
const user = await base44.auth.me();
if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

// Only admins reach this point
await base44.asServiceRole.entities.SomeEntity.delete(id);`}
                  </pre>

                  <p className="font-medium text-foreground mb-1">Enforce in Firestore Rules (tie Firebase auth UID to role):</p>
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
                  <p className="mt-2 text-muted-foreground">Note: To use <code className="bg-muted px-1 rounded">request.auth.token.role</code> in rules, set a custom claim on the Firebase Auth token server-side using the Firebase Admin SDK when a user's role is assigned.</p>
                </div>

                <hr className="border-border" />

                <div className="bg-amber-50 border border-amber-200 rounded p-3 space-y-1">
                  <p className="font-semibold text-foreground">Dev Staff Access Checklist:</p>
                  <ul className="space-y-0.5 text-muted-foreground">
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
            </div>

            <div className="bg-destructive/10 p-3 rounded text-xs">
              <p className="font-medium text-foreground">⚠️ Never leave test mode open in production</p>
              <p>The default "test mode" rules allow anyone to read and write your database. Lock it down before going live.</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">2. Firestore Security Rules</h3>
              <p className="mb-2">Go to <strong>Firestore Database → Rules</strong> tab in the Firebase Console.</p>

              <p className="mb-1 text-xs font-medium text-foreground">Locked down (no public access):</p>
              <pre className="bg-muted rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap break-words mb-3">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`}
              </pre>

              <p className="mb-1 text-xs font-medium text-foreground">Authenticated users only:</p>
              <pre className="bg-muted rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap break-words mb-3">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}
              </pre>

              <p className="mb-1 text-xs font-medium text-foreground">Per-user data (users can only access their own docs):</p>
              <pre className="bg-muted rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap break-words">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /records/{docId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.uid;
    }
  }
}`}
              </pre>
            </div>

            <hr className="border-border" />

            <div>
              <h3 className="font-semibold text-foreground mb-2">3. Restrict Access by Domain (Google Identity Platform)</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-xs">
                <li>Go to <strong>Authentication → Sign-in method</strong> in Firebase Console</li>
                <li>Enable <strong>Google</strong> or <strong>Email/Password</strong> sign-in</li>
                <li>Under <strong>Authorized domains</strong>, add only your app's domain</li>
                <li>Remove <code className="bg-muted px-1 rounded">localhost</code> from authorized domains before going live</li>
              </ol>
            </div>

            <hr className="border-border" />

            <div>
              <h3 className="font-semibold text-foreground mb-2">4. API Key Restrictions (Google Cloud Console)</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-xs">
                <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary underline">console.cloud.google.com/apis/credentials</a></li>
                <li>Find the API key generated by Firebase (named <em>Browser key (auto created by Firebase)</em>)</li>
                <li>Click it → under <strong>Application restrictions</strong>, select <strong>HTTP referrers</strong></li>
                <li>Add your domain (e.g. <code className="bg-muted px-1 rounded">https://yourapp.base44.app/*</code>)</li>
                <li>Under <strong>API restrictions</strong>, restrict to <strong>Cloud Firestore API</strong> only</li>
              </ol>
            </div>

            <hr className="border-border" />

            <div>
              <h3 className="font-semibold text-foreground mb-2">5. Service Account Permissions (Admin SDK)</h3>
              <ul className="space-y-2 text-xs ml-2">
                <li>• If using a <strong>service account</strong> (server-side), go to <strong>Project Settings → Service accounts</strong></li>
                <li>• Grant only the minimum IAM roles needed (e.g. <code className="bg-muted px-1 rounded">Cloud Datastore User</code> for read/write)</li>
                <li>• Avoid using <code className="bg-muted px-1 rounded">Owner</code> or <code className="bg-muted px-1 rounded">Editor</code> roles on service accounts</li>
                <li>• Rotate service account keys regularly and never commit them to source control</li>
              </ul>
            </div>

            <div className="bg-accent/30 p-3 rounded text-xs">
              <p className="font-medium text-foreground mb-1">Best Practice Summary:</p>
              <ul className="space-y-0.5">
                <li>✓ Use Firestore Rules to enforce who can read/write</li>
                <li>✓ Restrict your API key to your domain in Google Cloud Console</li>
                <li>✓ Enable Firebase Authentication before going live</li>
                <li>✓ Never expose service account keys in frontend code</li>
              </ul>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}