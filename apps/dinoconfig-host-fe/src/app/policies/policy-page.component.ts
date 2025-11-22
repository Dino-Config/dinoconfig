import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface PolicyContent {
  title: string;
  effectiveDate: string;
  content: string;
  sections?: Array<{ title: string; content: string }>;
}

@Component({
  selector: 'app-policy-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './policy-page.component.html',
  styleUrls: ['./policy-page.component.scss']
})
export class PolicyPageComponent implements OnInit {
  policyContent: PolicyContent | null = null;
  policyId: string = '';
  formattedContent: SafeHtml = '';

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // Scroll to top when component initializes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    this.route.params.subscribe(params => {
      this.policyId = params['id'];
      this.loadPolicyContent();
      // Scroll to top when route params change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  private loadPolicyContent() {
    const policyMap: Record<string, PolicyContent> = {
      'terms-of-service': this.getTermsOfService(),
      'privacy-policy': this.getPrivacyPolicy(),
      'acceptable-use-policy': this.getAcceptableUsePolicy(),
      'billing-refund-policy': this.getBillingRefundPolicy(),
      'security': this.getSecurity(),
      'dpa': this.getDPA(),
      'gdpr-ccpa': this.getGDPRCCPA(),
      'data-rights': this.getDataRights(),
      'cookie-policy': this.getCookiePolicy(),
      'legal-imprint': this.getLegalImprint(),
      'contact': this.getContact(),
      'ip-notice': this.getIPNotice(),
      'dmca': this.getDMCA(),
      'sla': this.getSLA(),
      'api-terms': this.getAPITerms(),
      'beta-terms': this.getBetaTerms(),
      'licensing': this.getLicensing(),
      'affiliate-terms': this.getAffiliateTerms()
    };

    this.policyContent = policyMap[this.policyId] || null;
    if (this.policyContent) {
      this.formattedContent = this.sanitizer.bypassSecurityTrustHtml(
        this.formatPolicyContent(this.policyContent.content)
      );
    }
  }

  private getTermsOfService(): PolicyContent {
    return {
      title: 'Terms of Service',
      effectiveDate: 'November 22, 2024',
      content: `
1. Introduction

Welcome to DinoConfig ("Company", "we", "us", "our"). These Terms of Service ("Terms") govern your access to and use of our website, products, SDKs, APIs and services (collectively, the "Services"). By creating an account, using the Services, or accessing the dashboard, you agree to be bound by these Terms.

2. Definitions

Customer — entity or person who registers for a paid or trial account.

User — any person using the Services.

Content — configuration data, files, code or other data uploaded, created or processed by Customer.

3. Account Registration & Security

You must provide accurate information, maintain the confidentiality of credentials, and notify us of unauthorized account use. You are responsible for all activity under your account.

4. License & Use

Subject to these Terms and payment of any fees, we grant you a limited, non-exclusive, non-transferable right to use the Services. You shall not copy, modify, reverse engineer, or create derivative works of the Services except as expressly permitted.

5. Billing & Payment

Fees, billing cycles, renewal and cancellation rules are described in our Billing & Refund Policy. Failure to pay may result in suspension of Services.

6. Acceptable Use

You must not use the Services to violate laws, infringe IP rights, distribute malware, or engage in abusive behavior. See our Acceptable Use Policy for details.

7. Intellectual Property

We retain all rights in the Services. Customers retain rights to their Content; by uploading you grant us a license necessary to provide the Services.

8. Confidentiality

Each party will keep confidential information private and use it solely to perform obligations under these Terms.

9. Warranties & Disclaimers

Services are provided "as is" and "as available" unless otherwise agreed in a written contract. We disclaim implied warranties to the extent permitted by law.

10. Limitation of Liability

Our aggregate liability is limited to the amounts paid by you for the Services in the 12 months preceding the claim. We are not liable for consequential, incidental or punitive damages.

11. Termination

We may suspend or terminate accounts for material breaches. On termination, your access ends and data retention is governed by our Data Retention & Deletion practices.

12. Governing Law & Dispute Resolution

These Terms are governed by the law specified in our Imprint. Disputes will be resolved by the mechanisms set out therein.

13. Changes to Terms

We may update these Terms; material changes will be notified and take effect on the stated effective date.
      `
    };
  }

  private getPrivacyPolicy(): PolicyContent {
    return {
      title: 'Privacy Policy',
      effectiveDate: 'November 22, 2024',
      content: `
1. Overview

This Privacy Policy explains how DinoConfig collects, uses, discloses and protects personal data when you use our Services, website, SDKs, or APIs.

2. Data We Collect

Account data: name, email, company, billing information.

Usage data: logs, telemetry, SDK calls, error reports and analytics.

Content: configuration values, uploaded files, and other customer data.

Support data: communications with support and related attachments.

3. How We Use Data

We use personal data to provide the Services, process payments, respond to support requests, improve the product, detect abuse, and comply with legal obligations.

4. Legal Bases (where applicable)

For EU users: processing is based on performance of a contract, legitimate interests, and consent where required.

5. Data Sharing & Subprocessors

We share data with vendors and subprocessors (hosting, analytics, payment processors). We use contractual terms requiring adequate protection. A current list of subprocessors is available on request.

6. International Transfers

Personal data may be transferred internationally. We rely on lawful transfer mechanisms such as standard contractual clauses or adequacy decisions.

7. Data Retention

We retain personal data for as long as necessary to provide the Services, meet legal obligations, or as described in your contract.

8. Security

We implement administrative, technical and physical safeguards (encryption in transit, access controls, monitoring). See Security Overview for details.

9. Your Rights

Depending on your jurisdiction: access, rectification, deletion, portability, restriction, objection and the right to lodge a complaint with a supervisory authority. Use the Data Rights page to submit requests.

10. Children

We do not knowingly collect personal data of children under the age required by applicable law.

11. Contact

Data protection inquiries: help@dinoconfig.com
      `
    };
  }

  private getAcceptableUsePolicy(): PolicyContent {
    return {
      title: 'Acceptable Use Policy',
      effectiveDate: 'November 22, 2024',
      content: `
1. Purpose

To protect our infrastructure, users and Services by prohibiting misuse.

2. Prohibited Activities

Illegal activities (fraud, trafficking, malware distribution).

Unauthorized access, scanning or reverse engineering.

Spamming, phishing, or unsolicited messaging.

Uploading or distributing infringing or harmful content.

Denial-of-service attacks, resource abuse, or actions that degrade service for others.

3. Enforcement

We may warn, throttle, suspend or terminate accounts for violations and cooperate with law enforcement.

4. Reporting Abuse

Report suspected abuse to help@dinoconfig.com.
      `
    };
  }

  private getBillingRefundPolicy(): PolicyContent {
    return {
      title: 'Billing & Refund Policy',
      effectiveDate: 'November 22, 2024',
      content: `
1. Billing Cycle & Payment Methods

Subscriptions are billed monthly or annually in advance. We accept major credit cards and supported payment processors.

2. Automatic Renewals

Subscriptions renew automatically unless canceled before the next billing date.

3. Upgrades & Downgrades

Upgrades take effect immediately; charges may be prorated. Downgrades take effect at the next billing cycle unless otherwise stated.

4. Refunds & Cancellations

Refunds are provided at our discretion and according to any terms in your contract. Generally, cancellations stop future billing but do not automatically generate prorated refunds unless specified.

5. Failed Payments & Chargebacks

Failed payments may result in account suspension. Chargebacks may result in termination pending resolution.
      `
    };
  }

  private getSecurity(): PolicyContent {
    return {
      title: 'Security Overview',
      effectiveDate: 'November 22, 2024',
      content: `
1. Commitment to Security

We employ people, processes and technology to protect customer data and maintain service integrity.

2. Key Controls

Transport security: TLS enforced on all public endpoints.

Encryption at rest: Sensitive data encrypted using industry-standard algorithms.

Access controls: MFA and least privilege for administrative access.

Vulnerability management: Regular patching, scanning, and remediation.

Monitoring & incident response: Centralized logging, alerts, and a documented incident response plan.

3. Third-Party Audits & Tests

We perform penetration testing and security audits. Summaries or attestations (SOC/ISO) are available under NDA or on request.

4. Responsible Disclosure

Report vulnerabilities to help@dinoconfig.com. We will acknowledge and triage reports promptly.
      `
    };
  }

  private getDPA(): PolicyContent {
    return {
      title: 'Data Processing Agreement (DPA)',
      effectiveDate: 'November 22, 2024',
      content: `
1. Parties & Purpose

This DPA governs processing of Personal Data by DinoConfig (Processor) on behalf of the Customer (Controller) in connection with the Services.

2. Processing Details

Subject-matter: Provision of Services and related support.

Categories of Data: Account information, usage logs, and any personal data contained in Content.

Duration: For the term of the contractual relationship unless otherwise requested.

3. Processor Obligations

Processor shall process data only on documented instructions, implement adequate security measures, assist with data subject requests, and engage subprocessors under contract.

4. Subprocessors

A list of subprocessors and the purposes they serve will be provided on request and updated as necessary.

5. Data Subject Rights & Assistance

Processor will assist Controller in responding to data subject requests and complying with regulatory obligations.

6. International Transfers

Processor will use appropriate safeguards for transfers (SCCs, adequacy decisions, or other lawful mechanisms).

7. Termination & Deletion

Upon termination, Processor will, at Controller's choice, return or delete personal data within a reasonable period unless required to retain for legal obligations.
      `
    };
  }

  private getGDPRCCPA(): PolicyContent {
    return {
      title: 'GDPR / CCPA Compliance',
      effectiveDate: 'November 22, 2024',
      content: `
GDPR Compliance (EU Data Subject Rights)

1. Overview

This page explains how EU individuals can exercise their rights under GDPR regarding personal data processed in our Services.

2. Rights Available

Right of access
Right to rectification
Right to erasure ("right to be forgotten")
Right to restriction of processing
Right to data portability
Right to object and to withdraw consent where applicable

3. How to Submit a Request

Use the Data Rights page or contact help@dinoconfig.com. We may require verification and will respond within statutory timelines (generally 30 days).

4. Supervisory Authority

If unsatisfied, you may lodge a complaint with your local supervisory authority.

CCPA / CPRA Compliance (California)

1. Overview

California residents have specific rights under CCPA/CPRA about the collection and sale of personal information.

2. Consumer Rights

Right to Know (categories collected and purpose)
Right to Delete
Right to Opt-Out of Sale (if applicable)
Right to Non-Discrimination for exercising rights

3. How to Exercise Rights

Submit verifiable requests via the Data Rights page or email help@dinoconfig.com. We will verify your identity and respond within statutory timelines.
      `
    };
  }

  private getDataRights(): PolicyContent {
    return {
      title: 'Data Rights',
      effectiveDate: 'November 22, 2024',
      content: `
Your Data & Privacy Requests

Use this page to:

Download your account and content data (Data Export).

Request deletion of your account and data (Account Deletion).

Rectify or update personal information.

Submit a privacy rights request (GDPR/CCPA).

Requests are processed within 30 days unless otherwise required by law. You will be notified of the status.

To submit a request, please contact: help@dinoconfig.com
      `
    };
  }

  private getCookiePolicy(): PolicyContent {
    return {
      title: 'Cookie Policy',
      effectiveDate: 'November 22, 2024',
      content: `
1. What are cookies

Cookies are small files stored on your device to improve site functionality and provide analytics.

2. Types of Cookies We Use

Essential cookies: required for site operation and authentication.

Analytics cookies: used to understand usage patterns (Google Analytics, etc.).

Functional cookies: remember preferences and settings.

Advertising cookies: used only if you opt-in.

3. How to Manage Cookies

You can manage cookie preferences via the Cookie Settings page or through your browser settings. Disabling non-essential cookies may affect some features.

4. Third-Party Cookies

Third parties may set cookies when you interact with embedded content or integrations. See specific vendor privacy pages for details.

Cookie Preferences

Manage your cookie preferences below. Toggle non-essential cookies (Analytics, Advertising). Essential cookies are required for the site to function and cannot be disabled.

Essential (always on)
Analytics
Functional
Advertising

Save preferences | Accept all | Reject non-essential
      `
    };
  }

  private getLegalImprint(): PolicyContent {
    return {
      title: 'Legal Imprint',
      effectiveDate: 'November 22, 2024',
      content: `
1. Company Information

Company name: DinoConfig

Contact: help@dinoconfig.com

Responsible person: DinoConfig Legal Team

2. Additional Information

For specific company registration details, please contact help@dinoconfig.com.
      `
    };
  }

  private getContact(): PolicyContent {
    return {
      title: 'Contact & Support',
      effectiveDate: 'November 22, 2024',
      content: `
Contact Information

Support email: help@dinoconfig.com
Sales: help@dinoconfig.com
Legal: help@dinoconfig.com
Security: help@dinoconfig.com

Office hours: Mon–Fri 09:00–17:00 (local time)

For general inquiries, please use help@dinoconfig.com
      `
    };
  }

  private getIPNotice(): PolicyContent {
    return {
      title: 'Intellectual Property Notice',
      effectiveDate: 'November 22, 2024',
      content: `
All product names, service names, logos and marks are trademarks of DinoConfig or their respective owners. You may not use our trademarks without prior written permission. Content uploaded by customers remains their property but is licensed to us to provide the Services.

For trademark inquiries: help@dinoconfig.com
      `
    };
  }

  private getDMCA(): PolicyContent {
    return {
      title: 'DMCA Notice',
      effectiveDate: 'November 22, 2024',
      content: `
Copyright Policy

Designated Agent: help@dinoconfig.com

To file a DMCA complaint, provide:

A physical or electronic signature of the copyright owner or authorized agent.

Identification of the copyrighted work claimed infringed.

Identification of the material claimed to be infringing and its location.

Contact information for the complaining party.

A statement of good faith and accuracy, and a statement under penalty of perjury.

We will respond per applicable law and may remove or disable access to infringing content.
      `
    };
  }

  private getSLA(): PolicyContent {
    return {
      title: 'Service Level Agreement (SLA)',
      effectiveDate: 'November 22, 2024',
      content: `
Scope: Applies to paid enterprise service tiers where SLA is contractually agreed.

1. Availability Commitment

Uptime target: 99.9% monthly uptime (or as contracted). Scheduled maintenance windows are excluded.

2. Service Credits

If we fail to meet uptime targets, eligible customers may receive service credits calculated as a percentage of monthly fees according to the credit table in the contract.

3. Maintenance & Notices

We provide advance notice for scheduled maintenance. Emergency fixes may be deployed with minimal notice.

4. Support & Escalation

Support response times and channels vary by plan (standard/premium/enterprise). See plan details for SLA response targets.
      `
    };
  }

  private getAPITerms(): PolicyContent {
    return {
      title: 'Developer API Terms & SDK Use',
      effectiveDate: 'November 22, 2024',
      content: `
1. API Keys & Security

API keys and SDK credentials must be kept confidential. You are responsible for activity from your keys.

2. Rate Limits & Fair Use

APIs are subject to rate limits. Excessive calls may be throttled. Contact sales for higher limits.

3. Versioning & Deprecation

We maintain versioning and provide at least 60 days' notice for breaking changes or deprecations to public APIs and SDKs, unless an urgent security fix is required.

4. Allowed Use & Restrictions

Do not distribute keys, create harmful bots, or use the API for unlawful purposes. See AUP for details.
      `
    };
  }

  private getBetaTerms(): PolicyContent {
    return {
      title: 'Beta & Preview Features Terms',
      effectiveDate: 'November 22, 2024',
      content: `
Beta features are provided "as is" for evaluation and may be unstable. Use of beta features does not change your support entitlements and may be subject to additional terms. We may collect extra telemetry for improvement.
      `
    };
  }

  private getLicensing(): PolicyContent {
    return {
      title: 'Licensing & Third-Party Software',
      effectiveDate: 'November 22, 2024',
      content: `
We list third-party components and open-source licenses used in our product. Where third-party license obligations apply, they are included in our Notices and Attributions document. For any third-party software included with the Services, the applicable license governs your use of that software.

For licensing inquiries: help@dinoconfig.com
      `
    };
  }

  private getAffiliateTerms(): PolicyContent {
    return {
      title: 'Affiliate & Partnership Terms',
      effectiveDate: 'November 22, 2024',
      content: `
This page describes rules for affiliates, commission structures, payout schedules, prohibited promotion methods, and termination rights. Affiliates must not misrepresent the Company or violate laws. Commission details and minimum payout thresholds are specified in the affiliate contract.

For affiliate inquiries: help@dinoconfig.com
      `
    };
  }

  formatPolicyContent(content: string): string {
    let html = content.trim();
    const lines = html.split('\n');
    let result: string[] = [];
    let currentParagraph: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        if (currentParagraph.length > 0) {
          if (inList) {
            result.push('</ul>');
            inList = false;
          }
          result.push(`<p>${currentParagraph.join(' ')}</p>`);
          currentParagraph = [];
        } else if (inList) {
          result.push('</ul>');
          inList = false;
        }
        continue;
      }

      // Check for numbered section (e.g., "1. Title")
      if (/^\d+\.\s+/.test(line)) {
        if (currentParagraph.length > 0) {
          if (inList) {
            result.push('</ul>');
            inList = false;
          }
          result.push(`<p>${currentParagraph.join(' ')}</p>`);
          currentParagraph = [];
        }
        const headerText = line.replace(/^\d+\.\s+/, '');
        result.push(`<h2>${line}</h2>`);
        continue;
      }

      // Check for subsection (capital letter at start, ends with colon, no period in middle)
      if (/^[A-Z][^:]+:$/.test(line) && !line.includes('.')) {
        if (currentParagraph.length > 0) {
          if (inList) {
            result.push('</ul>');
            inList = false;
          }
          result.push(`<p>${currentParagraph.join(' ')}</p>`);
          currentParagraph = [];
        }
        result.push(`<h3>${line}</h3>`);
        continue;
      }

      // Check for bullet point
      if (/^[-•]\s+/.test(line)) {
        if (currentParagraph.length > 0) {
          result.push(`<p>${currentParagraph.join(' ')}</p>`);
          currentParagraph = [];
        }
        if (!inList) {
          result.push('<ul>');
          inList = true;
        }
        const listItem = line.replace(/^[-•]\s+/, '');
        result.push(`<li>${listItem}</li>`);
        continue;
      }

      // Regular text line
      currentParagraph.push(line);
    }

    // Close any remaining content
    if (currentParagraph.length > 0) {
      if (inList) {
        result.push('</ul>');
      }
      result.push(`<p>${currentParagraph.join(' ')}</p>`);
    } else if (inList) {
      result.push('</ul>');
    }

    return result.join('\n');
  }
}

