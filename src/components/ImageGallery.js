import React, { useEffect, useState } from 'react';

function ImageGallery({ ndc, rxCui }) {
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchImages() {
            const urls = [];

            if (ndc) {
                const safeNdc = ndc?.replace?.(/[^0-9-]/g, '')?.replace?.(/-/g, '') || '';
                urls.push(`https://rximage.nlm.nih.gov/api/rximage/1/rxnav?resolution=300&idtype=NDC&id=${safeNdc}`);
            }

            if (rxCui) {
                urls.push(`https://rximage.nlm.nih.gov/api/rximage/1/rxnav?resolution=300&idtype=RXCUI&id=${rxCui}`);
            }

            const tryUrls = async (urls) => {
                for (let url of urls) {
                    try {
                        const res = await fetch(url);
                        const data = await res.json();
                        if (data.nlmRxImages?.length) return data.nlmRxImages;
                    } catch (err) {
                        console.error('Image fetch error:', err);
                    }
                }
                return [];
            };

            const foundImages = await tryUrls(urls);
            setImages(foundImages);
        }

        if (ndc || rxCui) fetchImages();
    }, [ndc, rxCui]);

    if (error) return <p>Error loading images.</p>;
    if (!images.length) return <p>No images available.</p>;

    return (
        <div className="image-gallery">
            {images.map((img, i) => (
                <img
                    key={i}
                    src={img.imageUrl}
                    alt={img.name || 'Drug Image'}
                    className="drug-image"
                />
            ))}
        </div>
    );
}

export default ImageGallery;
