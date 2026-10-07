/**
 * Unified pagination helper for Mongoose models across Zemam Backend
 *
 * @param {import('mongoose').Model} model - Mongoose Model
 * @param {object} filters - Query filter criteria
 * @param {object} options - Pagination options: { page, limit, sort, populate, select, lean }
 * @returns {Promise<{ docs: any[], pagination: { total: number, page: number, limit: number, totalPages: number, hasNextPage: boolean, hasPrevPage: boolean } }>}
 */
async function paginate(model, filters = {}, options = {}) {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(options.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };

    let query = model.find(filters).sort(sort).skip(skip).limit(limit);

    if (options.populate) {
        if (Array.isArray(options.populate)) {
            options.populate.forEach((p) => {
                query = query.populate(p);
            });
        } else {
            query = query.populate(options.populate);
        }
    }

    if (options.select) {
        query = query.select(options.select);
    }

    if (options.lean !== false) {
        query = query.lean();
    }

    const [docs, total] = await Promise.all([
        query.exec(),
        model.countDocuments(filters),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
        docs,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
}

module.exports = { paginate };
