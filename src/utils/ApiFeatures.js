

class ApiFeatures {
    constructor(query, queryString, allowFields = []) {
        this.query = query;
        this.queryString = queryString;
        this.allowFields = allowFields;
    }

    filter() {
        const queryObj = {};

        for (let key in this.queryString) {
            const baseField = key.split("[")[0];

            if (!this.allowFields.includes(baseField)) continue;

            const operatorMatch = key.match(/\[(gt|gte|lt|lte)\]/);

            // ✅ PRICE with operators
            if (operatorMatch) {
                const operator = `$${operatorMatch[1]}`; // gt → $gt

                if (!queryObj[baseField]) {
                    queryObj[baseField] = {};
                }

                queryObj[baseField][operator] = Number(this.queryString[key]);
            }

            // ✅ CATEGORY or simple field
            else {
                queryObj[baseField] = this.queryString[key];
            }
        }

        this.query = this.query.find(queryObj);
        return this;
    }

}

export { ApiFeatures }
