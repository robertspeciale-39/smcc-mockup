export function PageHeader({ title, lead }: { title: string; lead: string }) {
  return (
    <header className="bg-deep">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-12">
        <h1 className="font-display text-4xl text-sand sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-haze">{lead}</p>
      </div>
      <div className="pinstripe" />
    </header>
  );
}
