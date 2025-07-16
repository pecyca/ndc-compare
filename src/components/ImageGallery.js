// src/components/ImageGallery.js
import React, { useEffect, useState } from "react";

function ImageGallery({ ndc, rxcui }) {
    const [images, setImages] = useState([]);

    useEffect(() => {
        const fetchImages = async () => {
            const formatted = ndc.replace(/\D/g, "").padStart(11, "0");
            const dashed = `${formatted.slice(0, 5)}-${formatted.slice(5, 9)}-${formatted.slice(9)}`;
            let found = [];

            try {
                const res = await fetch(`https://rximage.nlm.nih.gov/api/rximage/1/rxnav?ndc=${dashed}`);
                const json = await res.json();
                found = json?.nlmRxImages || [];
                if (!found.length && rxcui) {
                    const alt = await fetch(`https://rximage.nlm.nih.gov/api/rximage/1/rxnav?rxcui=${rxcui}`);
                    const altJson = await alt.json();
                    found = altJson?.nlmRxImages || [];
                }
                setImages(found);
            } catch (e) {
                console.error("Error loading images", e);
                setImages([]);
            }
        };

        fetchImages();
    }, [ndc, rxcui]);

    return (
        <div>
            <h4>Images</h4>
            {images.length > 0 ? (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {images.map((img, idx) => (
                        <img
                            key={idx}
                            src={img.imageUrl}
                            alt={img.ndc11}
                            style={{ maxHeight: "100px", border: "1px solid #ccc", borderRadius: "4px" }}
                        />
                    ))}
                </div>
            ) : (
                <p>No images found. You may upload one below.</p>
            )}
            <input type="file" />
        </div>
    );
}

export default ImageGallery;
