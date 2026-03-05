function ensureSlug(value) {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

    if (slugRegex.test(value)) {
        return value;
    }
    return value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-");
}

export {ensureSlug}