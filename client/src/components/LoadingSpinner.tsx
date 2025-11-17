export default function LoadingSpinner({ size = 'small' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClass = `spinner-${size}`;
  return (
    <span className={`spinner ${sizeClass}`}></span>
  );
}

