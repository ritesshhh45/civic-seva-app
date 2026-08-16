import { createFileRoute } from "@tanstack/react-router";

export default function Privacy() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <a
          href="/"
          className="mb-8 inline-block text-sm font-semibold text-primary"
        >
          ← Back to Civic Seva
        </a>

        <h1 className="text-3xl font-extrabold sm:text-4xl">
          Privacy Policy
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: August 16, 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7">
          <section>
            <h2 className="text-xl font-bold">1. Introduction</h2>
            <p className="mt-2">
              Sanjay Chaudhary Civic Seva respects your privacy. This Privacy
              Policy explains how information is collected, used, stored and
              protected when you use the Civic Seva application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">2. Information We Collect</h2>
            <p className="mt-2">
              Depending on the features you use, the application may collect
              your name, mobile number, complaint details, complaint
              descriptions and photographs submitted with complaints.
            </p>
            <p className="mt-2">
              For push notifications, the application may process a device
              notification token and platform information required to deliver
              notifications.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">3. How We Use Information</h2>
            <p className="mt-2">
              Information may be used to register citizens, receive and manage
              complaints, communicate updates, provide requested services,
              deliver push notifications and maintain the security and
              functionality of the application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">4. Complaints and Photos</h2>
            <p className="mt-2">
              Information and photographs voluntarily submitted with a
              complaint may be stored and accessed by authorized administrators
              for the purpose of reviewing and managing the complaint.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">5. Push Notifications</h2>
            <p className="mt-2">
              If you grant notification permission, the application may use
              Firebase Cloud Messaging and a device notification token to
              deliver important Civic Seva updates and notifications.
            </p>
            <p className="mt-2">
              You can manage notification permission through your device
              settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">6. Data Storage</h2>
            <p className="mt-2">
              Application data may be stored using Supabase database and
              storage services. Access to administrative information is
              restricted through application authorization and security
              controls.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">7. WhatsApp and Phone Links</h2>
            <p className="mt-2">
              The application may provide WhatsApp and phone/call links to help
              citizens contact the relevant service or representative. When
              you use these links, you may be redirected to the respective
              external service, which has its own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">8. Data Security</h2>
            <p className="mt-2">
              Reasonable technical and organizational measures are used to
              protect application information against unauthorized access,
              alteration or misuse. However, no electronic system can be
              guaranteed to be completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">9. Data Retention</h2>
            <p className="mt-2">
              Information is retained only for as long as reasonably necessary
              for providing services, managing complaints, maintaining
              application records, meeting legal requirements and protecting
              the security of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">10. Data Sharing and Sale</h2>
            <p className="mt-2">
              We do not sell your personal data to third parties. Information
              is only shared with service providers (such as Firebase and
              Supabase) strictly to operate the application's core features,
              such as notifications and data storage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">11. Your Rights</h2>
            <p className="mt-2">
              You may request information about your personal data, or
              request correction or deletion where applicable, by contacting
              us using the details in the Contact section below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">12. Changes to This Policy</h2>
            <p className="mt-2">
              This Privacy Policy may be updated when application features or
              data practices change. The updated version will be published on
              this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">13. Contact</h2>
            <p className="mt-2">
              For privacy-related questions or data requests, please contact
              us at:
            </p>
            <p className="mt-2">
              Email:{" "}
              <a href="mailto:ritesshhh19@gmail.com" className="font-semibold text-primary">
                ritesshhh19@gmail.com
              </a>
              <br />
              WhatsApp/Phone:{" "}
              <a href="tel:+919422115394" className="font-semibold text-primary">
                +91 94221 15394
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export const Route = createFileRoute("/privacy")({
  component: Privacy,
});