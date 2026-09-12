import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import './PrivacyPolicy.css'; // reuse same styles

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="privacy-page">
      <div className="privacy-header">
        <button className="privacy-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className="privacy-title-wrap">
          <FileText size={22} />
          <h1>Terms of Service</h1>
        </div>
      </div>

      <div className="privacy-card">
        <p className="privacy-updated">Last updated: September 12, 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By using Expense Trackr, you agree to these Terms of Service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            Expense Trackr is an application that allows users to record,
            organize, and manage personal expense information.
          </p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>
            You are responsible for maintaining the security of your account
            and for activity performed through your account.
          </p>
        </section>

        <section>
          <h2>4. Acceptable Use</h2>
          <p>
            You agree not to misuse, disrupt, reverse engineer, or attempt to
            gain unauthorized access to the application or its systems.
          </p>
        </section>

        <section>
          <h2>5. User Data</h2>
          <p>
            You retain responsibility for the information you enter into
            Expense Trackr. You grant Expense Trackr permission to process
            that information only as necessary to provide the service.
          </p>
        </section>

        <section>
          <h2>6. Availability</h2>
          <p>
            We may modify, suspend, or discontinue parts of the service at
            any time.
          </p>
        </section>

        <section>
          <h2>7. Disclaimer</h2>
          <p>
            Expense Trackr is provided on an &quot;as is&quot; and &quot;as available&quot;
            basis. The application is intended as an expense-management tool
            and does not provide financial, investment, tax, or legal advice.
          </p>
        </section>

        <section>
          <h2>8. Limitation of Liability</h2>
          <p>
            To the extent permitted by applicable law, Expense Trackr and its
            developers will not be liable for losses arising from use of or
            inability to use the service.
          </p>
        </section>

        <section>
          <h2>9. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Updated Terms will
            be posted on this page.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>For questions about these Terms, contact:</p>
          <a href="mailto:kushagrarastogi8859@gmail.com" className="privacy-email">
            kushagrarastogi8859@gmail.com
          </a>
        </section>
      </div>
    </div>
  );
}
