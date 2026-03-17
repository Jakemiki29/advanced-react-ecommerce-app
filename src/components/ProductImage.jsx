import { useState } from 'react'

const FALLBACK_IMAGE_URL = 'https://via.placeholder.com/280x280?text=Image+Unavailable'

function ProductImage({ src, alt, className }) {
  const [imageSrc, setImageSrc] = useState(src)

  return (
    <img
      className={className}
      src={imageSrc}
      alt={alt}
      loading="lazy"
      onError={() => setImageSrc(FALLBACK_IMAGE_URL)}
    />
  )
}

export default ProductImage
