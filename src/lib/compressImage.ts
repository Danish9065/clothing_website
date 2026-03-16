// Compress image file to under maxSizeKB using browser Canvas API
// No external library needed.

export async function compressImage(
    file: File,
    maxSizeKB: number = 200
): Promise<File> {
    // Don't compress GIFs (would break animation)
    if (file.type === 'image/gif') return file

    // Don't compress if already small enough
    if (file.size <= maxSizeKB * 1024) return file

    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.onload = (e) => {
            const img = new Image()
            img.src = e.target?.result as string

            img.onload = () => {
                const canvas = document.createElement('canvas')
                let { width, height } = img

                // Step 1: Resize if very large (max 1200px on longest side)
                const MAX_DIMENSION = 1200
                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    if (width > height) {
                        height = Math.round((height * MAX_DIMENSION) / width)
                        width = MAX_DIMENSION
                    } else {
                        width = Math.round((width * MAX_DIMENSION) / height)
                        height = MAX_DIMENSION
                    }
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    resolve(file)
                    return
                }

                ctx.drawImage(img, 0, 0, width, height)

                // Step 2: Binary search for best quality under maxSizeKB
                let low = 0.1
                let high = 0.95
                let quality = 0.85
                let bestBlob: Blob | null = null
                let iterations = 0

                function tryQuality(q: number) {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                resolve(file)
                                return
                            }

                            iterations++
                            const sizeKB = blob.size / 1024

                            if (sizeKB <= maxSizeKB) {
                                bestBlob = blob
                                // Try higher quality if we have iterations left
                                if (high - low > 0.05 && iterations < 8) {
                                    low = q
                                    quality = (low + high) / 2
                                    tryQuality(quality)
                                } else {
                                    // Done — use best result
                                    const compressed = new File(
                                        [bestBlob],
                                        file.name.replace(/\.[^.]+$/, '.jpg'),
                                        { type: 'image/jpeg' }
                                    )
                                    console.log(
                                        `Compressed: ${Math.round(file.size / 1024)}KB → ${Math.round(blob.size / 1024)}KB (quality: ${Math.round(q * 100)}%)`
                                    )
                                    resolve(compressed)
                                }
                            } else {
                                // Too big — reduce quality
                                if (iterations < 8) {
                                    high = q
                                    quality = (low + high) / 2
                                    tryQuality(quality)
                                } else {
                                    // Force lowest quality as last resort
                                    canvas.toBlob(
                                        (b) => {
                                            if (!b) { resolve(file); return }
                                            resolve(new File(
                                                [b],
                                                file.name.replace(/\.[^.]+$/, '.jpg'),
                                                { type: 'image/jpeg' }
                                            ))
                                        },
                                        'image/jpeg',
                                        0.3
                                    )
                                }
                            }
                        },
                        'image/jpeg',
                        q
                    )
                }

                tryQuality(quality)
            }

            img.onerror = () => resolve(file)
        }

        reader.onerror = () => resolve(file)
    })
}
