// components/OptimizedImage.jsx
import Image from 'next/image';

// Функция получения URL остаётся прежней (можно импортировать из lib, но продублируем для автономности)
function getImageUrl(image) {
  if (!image) return null;
  return image.url || image.formats?.large?.url || image.formats?.medium?.url || image.formats?.small?.url || null;
}

export default function OptimizedImage({ image, alt, fill = false, width, height, className = '', priority = false, ...rest }) {
  const src = getImageUrl(image);
  if (!src) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-gray-400 text-xs ${className}`}>
        No image
      </div>
    );
  }

  // Если fill, обязательно нужен родительский контейнер с position: relative и заданными размерами
  const imageProps = fill
    ? { fill: true, sizes: '(max-width: 640px) 100vw, 33vw' }
    : { width: width || 200, height: height || 200 };

  return (
    <Image
      src={src}
      alt={alt || ''}
      className={`object-cover ${className}`}
      loading={priority ? undefined : 'lazy'}
      priority={priority}
      {...imageProps}
      {...rest}
    />
  );
}