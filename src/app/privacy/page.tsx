import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-24 text-slate-800">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm md:p-12">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Legal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: March 14, 2026</p>
        </div>

        <div className="space-y-7 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
            <p className="mt-2">
              Kivo helps teams ingest and analyze multilingual feedback. This policy explains what data we collect,
              why we collect it, and how we protect it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Information We Collect</h2>
            <p className="mt-2">
              We may collect account details (name, email, profile image), app connection metadata, feedback content
              you ingest, usage analytics, and support messages.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">How We Use Data</h2>
            <p className="mt-2">
              We use data to authenticate users, provide dashboard insights, run translation/analysis workflows,
              improve product quality, and maintain platform security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Data Sharing</h2>
            <p className="mt-2">
              We do not sell personal data. We only share data with service providers needed to operate Kivo, such as
              hosting, authentication, analytics, and localization/AI processing partners.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Data Retention</h2>
            <p className="mt-2">
              We retain data for as long as your account is active or as required for legitimate business and legal
              purposes. You can request account deletion at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Security</h2>
            <p className="mt-2">
              We apply reasonable technical and organizational safeguards. No system is fully risk-free, but we
              continuously improve our controls to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Your Rights</h2>
            <p className="mt-2">
              Depending on your region, you may have rights to access, correct, delete, or export your data. Contact
              us to submit a request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
            <p className="mt-2">
              For privacy requests, email{" "}
              <a href="mailto:privacy@kivo.dev" className="font-medium text-blue-700 hover:underline">
                privacy@kivo.dev
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <Link href="/" className="font-medium text-blue-700 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
