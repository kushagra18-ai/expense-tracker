import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="privacy-page">
      <div className="privacy-header">
        <button className="privacy-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className="privacy-title-wrap">
          <Shield size={22} />
          <h1>Privacy Policy</h1>
        </div>
      </div>

      <div className="privacy-card">
        <p className="privacy-updated">Last updated: September 12, 2026</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>
            Expense Trackr may collect information you provide when you use the
            application, including your name, email address, and expense
            information.
          </p>
        </section>

        <section>
          <h2>2. Google Sign-In</h2>
          <p>
            If you choose to sign in using Google, we receive basic account
            information such as your name, email address, and profile
            information that Google makes available through the permissions
            requested by the application.
          </p>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>create and manage your account;</li>
            <li>authenticate you;</li>
            <li>store and display your expenses;</li>
            <li>provide the Expense Trackr service;</li>
            <li>maintain and improve the application.</li>
          </ul>
        </section>

        <section>
          <h2>4. Google User Data</h2>
          <p>
            Information received from Google APIs is used only to provide or
            improve features of Expense Trackr. We do not sell Google user data
            or use it for targeted advertising.
          </p>
        </section>

        <section>
          <h2>5. Data Storage and Security</h2>
          <p>
            We take reasonable measures to protect your information from
            unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2>6. Data Retention and Deletion</h2>
          <p>
            We retain account and expense information while your account is
            active or as necessary to provide the service. You may request
            deletion of your account and associated data by contacting us at:
          </p>
          <a href="mailto:kushagrarastogi8859@gmail.com" className="privacy-email">
            kushagrarastogi8859@gmail.com
          </a>
        </section>

        <section>
          <h2>7. Third-Party Services</h2>
          <p>
            The application may use third-party services such as Google and
            Vercel to provide authentication, hosting, and application
            functionality.
          </p>
        </section>

        <section>
          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will
            be posted on this page.
          </p>
        </section>

        <section>
          <h2>9. Contact</h2>
          <p>For questions about this Privacy Policy, contact:</p>
          <a href="mailto:kushagrarastogi8859@gmail.com" className="privacy-email">
            kushagrarastogi8859@gmail.com
          </a>
        </section>
      </div>
    </div>
  );
}
