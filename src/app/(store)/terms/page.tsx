import Link from "next/link";
import StaticShell, { Section } from "@/components/StaticShell";
import { site } from "@/lib/site";

export default function TermsPage() {
  return (
    <StaticShell
      crumbs="Terms & Conditions"
      title="Terms & Conditions"
      subtitle="The rules that apply when you browse or buy from VoltCore. Please read them before placing an order."
    >
      <Section heading="1. About these terms">
        <p>
          This website is operated by {site.legalName} (&quot;VoltCore&quot;, &quot;we&quot;,
          &quot;us&quot; or &quot;our&quot;). Our business address is {site.address}.
        </p>
        <p>
          These Terms &amp; Conditions govern your access to and use of this website, and any
          purchase you make through it. By browsing the site or placing an order, you agree to
          these terms. If you do not agree, please do not use the site or place an order.
        </p>
        <p>
          Our <Link href="/shipping" className="font-semibold text-coral-700 hover:underline">Shipping Policy</Link>,{" "}
          <Link href="/returns" className="font-semibold text-coral-700 hover:underline">Returns &amp; Refunds Policy</Link>,{" "}
          and any separate written agreement for bulk or custom orders also apply. If there is a
          conflict, the separate written agreement will prevail for that order.
        </p>
        <p>Last updated: 23 October 2026.</p>
      </Section>

      <Section heading="2. Who may use this website">
        <p>
          You must be at least 18 years old, or the age of majority in your state, to place an
          order. If you are under 18, you may use the site only with the involvement and consent
          of a parent or legal guardian, who agrees to these terms on your behalf.
        </p>
        <p>
          You agree to provide accurate, complete, and current information when placing an order,
          including your name, contact details, and delivery address. You are responsible for any
          activity carried out using the information you submit.
        </p>
      </Section>

      <Section heading="3. Products and information">
        <p>
          We try to describe our products accurately, including specifications, images, and
          compatibility information. Product images are for illustration and may differ slightly
          from the item supplied because of lighting, screen settings, or manufacturer changes.
          Where a product is a compatible or clone part, we identify it as such in the listing.
        </p>
        <p>
          Datasheets and technical information are provided by manufacturers or suppliers. You are
          responsible for checking that a product meets your project requirements before purchase
          and use. Product availability and prices may change without notice, and we may correct
          errors or omissions on the site at any time.
        </p>
      </Section>

      <Section heading="4. Orders and acceptance">
        <p>
          An order placed on this website is an offer to buy the products in it. We may accept,
          decline, limit, or cancel an order for reasons including product availability, payment
          failure, suspected fraud, delivery restrictions, pricing or listing errors, or a request
          that appears to be for unauthorised resale.
        </p>
        <p>
          An order confirmation or payment acknowledgement does not by itself mean that we have
          accepted your order. A contract is formed when we dispatch the products, unless we tell
          you otherwise in writing. If we cancel an order after payment, we will refund the amount
          received for that order.
        </p>
        <p>
          Bulk, college, custom, and quotation-based orders may be subject to separate terms,
          lead times, and payment conditions.
        </p>
      </Section>

      <Section heading="5. Prices, taxes, and payment">
        <p>
          Prices are shown in Indian Rupees (INR). The price payable, applicable taxes, shipping
          charges, and any cash-on-delivery fee will be shown at checkout before you place your
          order. We may change prices at any time, but changes will not affect orders that we have
          already accepted.
        </p>
        <p>
          Payments are processed by third-party payment providers. We do not store full card
          details. You confirm that you are authorised to use the payment method you select. If a
          payment is reversed, declined, or disputed, we may suspend or cancel the affected order.
        </p>
        <p>
          If a product is listed at an incorrect price or with incorrect information, we may cancel
          the order and refund the amount paid, even after an order acknowledgement.
        </p>
      </Section>

      <Section heading="6. Student discount and offers">
        <p>
          Student and promotional offers, including the STUDENT10 discount, are subject to the
          conditions shown on the offer page or at checkout. We may ask for a college email address
          or student ID to verify eligibility.
        </p>
        <p>
          Offers cannot be exchanged for cash and may not be combined unless we say so. We may
          withdraw an offer or cancel a discount if it is used improperly, including by someone who
          is not eligible. Offers may be changed or ended at any time, but changes will not apply
          retrospectively to accepted orders.
        </p>
      </Section>

      <Section heading="7. Shipping and delivery">
        <p>
          We ship within India using third-party courier partners. Dispatch and delivery times are
          estimates and may be affected by location, serviceability, weather, public holidays, or
          events outside our control.
        </p>
        <p>
          Please provide a complete and accurate address, including a landmark and a working phone
          number. If a delivery cannot be completed because the address or contact details are
          incorrect, or because the parcel is refused, additional charges may apply.
        </p>
        <p>
          Please inspect your parcel when it arrives. Report visible damage, missing items, or an
          incorrect product promptly and within 7 days of delivery so that we can investigate.
          Title and risk in the products pass to you when they are delivered to the address you
          provided.
        </p>
      </Section>

      <Section heading="8. Returns, refunds, and cancellations">
        <p>
          Our <Link href="/returns" className="font-semibold text-coral-700 hover:underline">Returns &amp; Refunds Policy</Link>{" "}
          sets out when an item can be returned, the condition it must be in, and how refunds are
          processed. In general, eligible returns must be raised within 7 days of delivery.
        </p>
        <p>
          You may ask us to cancel an order before it is dispatched by contacting our support team.
          Once an order has been dispatched, it will be handled under the returns process. Refunds
          are normally processed to the original payment method within 5 to 7 working days after we
          receive or pick up the returned item. Cash-on-delivery refunds are made to a bank account
          provided by you.
        </p>
        <p>
          Cut cables, damaged or burnt parts, and items showing misuse or physical damage may not
          be returnable. Custom and bulk orders are governed by their separate agreement. Nothing
          in this section limits any right you have under applicable consumer protection law.
        </p>
      </Section>

      <Section heading="9. Electronics safety and intended use">
        <p>
          Our products are supplied for prototyping, education, development, and general electronics
          use. They are not toys and must be handled by someone with appropriate knowledge and
          safety precautions. You are responsible for correct wiring, power ratings, isolation,
          soldering, battery handling, and testing.
        </p>
        <p>
          Do not use our products in safety-critical, life-support, medical, aviation, nuclear,
          weapons, or other applications where a failure could cause death, personal injury, or
          significant property damage. You are responsible for complying with the laws, standards,
          and certifications that apply to your project.
        </p>
      </Section>

      <Section heading="10. Website use and intellectual property">
        <p>
          You may use this website only for lawful purposes and in a way that does not interfere
          with its operation or the use of it by others. You must not attempt to gain unauthorised
          access, introduce malware, scrape the site at scale, or use automated tools in a way that
          places an unreasonable load on our systems.
        </p>
        <p>
          The VoltCore name, logo, website design, text, and other content we create are owned by
          or licensed to us and are protected by applicable intellectual property laws. You may not
          copy, reproduce, or use them for commercial purposes without our written permission.
          Manufacturer datasheets, trademarks, and product names remain the property of their
          respective owners.
        </p>
      </Section>

      <Section heading="11. Third-party services and links">
        <p>
          Our website may link to payment providers, courier tracking, manufacturers, or other
          third-party services. Those services are not controlled by us, and their own terms and
          privacy practices apply. We are not responsible for the availability, content, or
          performance of a third-party service.
        </p>
      </Section>

      <Section heading="12. Personal information">
        <p>
          We use the information you provide to process orders, arrange delivery, provide customer
          support, prevent fraud, and meet our legal obligations. Payment information is handled by
          the relevant payment provider. We handle personal information in accordance with
          applicable law and take reasonable steps to keep it secure.
        </p>
      </Section>

      <Section heading="13. Disclaimers">
        <p>
          We aim to keep the website accurate and available, but we do not guarantee that it will
          always be uninterrupted, error-free, or free of harmful components. Product information
          is provided for general guidance and is not professional engineering, safety, or legal
          advice.
        </p>
        <p>
          To the extent permitted by law, the website and products are provided on an &quot;as
          available&quot; basis. We do not exclude any warranty or guarantee that cannot lawfully be
          excluded, including rights available to consumers under applicable law.
        </p>
      </Section>

      <Section heading="14. Limitation of liability">
        <p>
          To the extent permitted by law, we will not be liable for indirect, incidental, special,
          or consequential loss, or for loss of profit, revenue, data, opportunity, or a project,
          arising from your use of the website or products.
        </p>
        <p>
          Our total aggregate liability for a claim relating to an order will not exceed the amount
          you paid us for that order. Nothing in these terms excludes or limits liability for
          fraud, wilful misconduct, death or personal injury caused by negligence, or any other
          liability that cannot be limited by law.
        </p>
      </Section>

      <Section heading="15. Indemnity">
        <p>
          To the extent permitted by law, you agree to indemnify us against reasonable losses,
          claims, and costs arising from your breach of these terms, your misuse of the website or
          products, or your violation of another person&apos;s rights or applicable law.
        </p>
      </Section>

      <Section heading="16. Events outside our control">
        <p>
          We are not responsible for a delay or failure to perform caused by an event beyond our
          reasonable control, including natural disasters, severe weather, strikes, transport
          disruption, government action, power or network failure, or a courier or supplier
          failure.
        </p>
      </Section>

      <Section heading="17. Governing law and disputes">
        <p>
          These terms are governed by the laws of India. We encourage you to contact us first so
          that we can try to resolve any concern quickly. Subject to applicable consumer protection
          law, the courts at Mumbai, Maharashtra will have jurisdiction over disputes arising from
          these terms or your use of the website.
        </p>
      </Section>

      <Section heading="18. Changes and general terms">
        <p>
          We may update these terms from time to time. The updated version will be posted on this
          page with a new effective date. Changes will apply to orders placed after the updated
          terms are posted.
        </p>
        <p>
          If any part of these terms is found to be invalid or unenforceable, the remaining parts
          will continue to apply. A failure to enforce a provision is not a waiver of our right to
          enforce it later. These terms, together with the policies and any separate agreement
          referred to above, form the entire agreement between you and us for the use of this
          website and the products.
        </p>
      </Section>

      <Section heading="19. Contact and grievance redressal">
        <p>
          For questions about these terms, an order, or a complaint, contact our customer support
          team:
        </p>
        <p>
          <strong>Grievance Officer &ndash; Customer Support</strong>
          <br />
          {site.legalName}
          <br />
          {site.address}
          <br />
          Email: <a className="font-semibold text-coral-700 hover:underline" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
          <br />
          Phone: {site.contactPhone} (Monday to Saturday, 10 AM to 7 PM IST)
        </p>
        <p>
          Please include your order ID and a clear description of the issue so that we can help you
          faster. We will acknowledge and respond to complaints within the time required by
          applicable law.
        </p>
      </Section>
    </StaticShell>
  );
}
