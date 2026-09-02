const Loading = ({ label = 'Loading' }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-ink/60">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-indigo-600" />
      <span className="font-sans text-sm">{label}</span>
    </div>
  );
};

export default Loading;
