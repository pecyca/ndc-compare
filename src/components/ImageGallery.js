import React, { useEffect, useState } from 'react';
import { getRxImageUrls } from '../utils/rximage';

function ImageGallery({ ndc, rxCui }) {
    const [images, setImages] = useState([]);

    useEffect(() => {
        async function fetchImages() {
            const urls = await getRxImageUrls({ ndc, rxCui });
            setImages(urls);
        }

        if (ndc || rxCui) fetchImages();
    }, [ndc, rxCui]);

    if (!images.length) return <p className="italic text-sm">No images available.</p>;

    return (
        <div className="image-gallery grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
            {images.map((url, i) => (
                <img
                    key={i}
                    src={url}
                    alt="Drug"
                    className="rounded shadow-md object-contain h-32 w-full"
                />
            ))}
        </div>
    );
}

export default ImageGallery;
