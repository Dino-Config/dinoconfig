import { Component, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss']
})
export class PoliciesComponent implements OnInit {
  ngOnInit() {
    // Scroll to top when component initializes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  policyCategories = [
    {
      title: 'Core Legal',
      items: [
        { name: 'Terms of Service', route: '/policies/terms-of-service' },
        { name: 'Privacy Policy', route: '/policies/privacy-policy' },
        { name: 'Acceptable Use Policy', route: '/policies/acceptable-use-policy' },
        { name: 'Billing & Refund Policy', route: '/policies/billing-refund-policy' }
      ]
    },
    {
      title: 'Data & Compliance',
      items: [
        { name: 'Security', route: '/policies/security' },
        { name: 'DPA', route: '/policies/dpa' },
        { name: 'GDPR / CCPA', route: '/policies/gdpr-ccpa' },
        { name: 'Data Rights', route: '/policies/data-rights' },
        { name: 'Cookie Policy & Settings', route: '/policies/cookie-policy' }
      ]
    },
    {
      title: 'Company',
      items: [
        { name: 'Legal Imprint', route: '/policies/legal-imprint' },
        { name: 'Contact', route: '/policies/contact' },
        { name: 'IP Notice', route: '/policies/ip-notice' },
        { name: 'DMCA', route: '/policies/dmca' }
      ]
    },
    {
      title: 'Service Contracts',
      items: [
        { name: 'SLA', route: '/policies/sla' },
        { name: 'API Terms', route: '/policies/api-terms' },
        { name: 'Beta Terms', route: '/policies/beta-terms' },
        { name: 'Licensing', route: '/policies/licensing' },
        { name: 'Affiliate Terms', route: '/policies/affiliate-terms' }
      ]
    }
  ];
}

