const Footer = () => {
  return (
    <footer className="border-t border-ink/10 bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="font-display text-lg text-indigo-600">KhajaGo</p>
        <p className="mt-1 max-w-md font-sans text-sm text-ink/60">
          Delivering from local kitchens in Kathmandu, Lalitpur, Bhaktapur, Pokhara,
          Biratnagar and Birtamode.
        </p>
        <p className="mt-6 font-sans text-xs text-ink/40">
          © {new Date().getFullYear()} KhajaGo. Built as an MVP — not affiliated with
          any other delivery service.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
