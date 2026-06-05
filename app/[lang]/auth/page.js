import AuthForms from './AuthForms';

export default async function AuthPage({ params }) {
  const { lang } = await params;
  return <AuthForms lang={lang} />;
}