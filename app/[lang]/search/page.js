import SearchResults from './SearchResults';

export default async function SearchPage({ params }) {
  const { lang } = await params;
  return <SearchResults lang={lang} />;
}