const StarRating = ({ value, onChange, size = 'text-lg' }) => {
  const interactive = typeof onChange === 'function';

  return (
    <div className={`flex gap-0.5 ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange(star)}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'} ${
            star <= value ? 'text-marigold-500' : 'text-ink/15'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default StarRating;